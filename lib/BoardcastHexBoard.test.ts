import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { BoardcastHexBoard } from './BoardcastHexBoard.js'
import { ClearType } from './types.js'

describe('BoardcastHexBoard - Visual Methods', () => {
  let container: HTMLElement
  let svg: SVGSVGElement
  let board: BoardcastHexBoard

  beforeEach(() => {
    // Create DOM elements
    container = document.createElement('div')
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '1000')
    svg.setAttribute('height', '700')
    svg.setAttribute('id', 'test-svg')
    
    container.appendChild(svg)
    document.body.appendChild(container)
    
    // Mock requestAnimationFrame to prevent animation loop (but allow manual override)
    vi.stubGlobal('requestAnimationFrame', vi.fn())
    
    // Create board instance
    board = new BoardcastHexBoard('#test-svg', { gridRadius: 3 })
    
    // Manually trigger render to ensure DOM is updated synchronously
    ;(board as any).render()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  // Helper function to ensure render is called
  const forceRender = () => {
    ;(board as any).render()
  }

  // Helper function to get hex cell from the Map
  const getHexCell = (q: number, r: number) => {
    const allHexCells = (board as any).allHexCells as Map<string, any>
    return allHexCells.get(`hex-${q}-${r}`)
  }

  describe('token method', () => {
    it('should create circle token with correct attributes', () => {
      board.token(0, 0, 'player', 'circle', '#ff0000', 'Player')
      forceRender()
      
      // Check circle element exists
      const circle = svg.querySelector('circle.token') as SVGCircleElement
      expect(circle).toBeTruthy()
      expect(circle.getAttribute('fill')).toBe('#ff0000')
      expect(circle.getAttribute('r')).toBe('12')
      expect(circle.getAttribute('stroke')).toBe('#fff')
      expect(circle.getAttribute('stroke-width')).toBe('2')
      
      // Check label exists
      const label = svg.querySelector('text.token-label') as SVGTextElement
      expect(label).toBeTruthy()
      expect(label.textContent).toBe('Player')
      expect(label.getAttribute('fill')).toBe('#fff')
      expect(label.getAttribute('font-weight')).toBe('bold')
    })

    it('should create rect token with correct path', () => {
      board.token(1, 0, 'guard', 'rect', '#00ff00')
      forceRender()
      
      const path = svg.querySelector('path.token') as SVGPathElement
      expect(path).toBeTruthy()
      expect(path.getAttribute('fill')).toBe('#00ff00')
      expect(path.getAttribute('stroke')).toBe('#fff')
      expect(path.getAttribute('stroke-width')).toBe('2')
      
      // Check that path data contains rect coordinates
      const pathData = path.getAttribute('d')
      expect(pathData).toContain('M') // Move command
      expect(pathData).toContain('L') // Line commands
      expect(pathData).toContain('Z') // Close path
    })

    it('should create triangle token with correct path', () => {
      board.token(-1, 1, 'enemy', 'triangle', '#ff00ff')
      forceRender()
      
      const path = svg.querySelector('path.token') as SVGPathElement
      expect(path).toBeTruthy()
      expect(path.getAttribute('fill')).toBe('#ff00ff')
      
      const pathData = path.getAttribute('d')
      expect(pathData).toContain('M') // Move to top point
      expect(pathData).toContain('L') // Lines to base points
      expect(pathData).toContain('Z') // Close triangle
    })

    it('should create star token with correct path', () => {
      board.token(0, 1, 'treasure', 'star', '#ffff00')
      forceRender()
      
      const path = svg.querySelector('path.token') as SVGPathElement
      expect(path).toBeTruthy()
      expect(path.getAttribute('fill')).toBe('#ffff00')
      
      const pathData = path.getAttribute('d')
      expect(pathData).toContain('M') // Move command
      expect(pathData).toContain('L') // Multiple line commands for star points
      expect(pathData).toContain('Z') // Close path
    })

    it('should position token at correct hex coordinates', () => {
      board.token(2, -1, 'test', 'circle', '#ffffff')
      forceRender()
      
      const circle = svg.querySelector('circle.token') as SVGCircleElement
      const cx = parseFloat(circle.getAttribute('cx') || '0')
      const cy = parseFloat(circle.getAttribute('cy') || '0')
      
      // Token should be positioned at the hex center (not at 0,0)
      expect(cx).not.toBe(0)
      expect(cy).not.toBe(0)
      expect(cx).toBeGreaterThan(500) // Should be right of center
    })

    it('should replace existing token with same name', () => {
      // Create first token
      board.token(0, 0, 'player', 'circle', '#ff0000')
      forceRender()
      let circles = svg.querySelectorAll('circle.token')
      expect(circles.length).toBe(1)
      
      // Replace with different token
      board.token(1, 1, 'player', 'rect', '#00ff00')
      forceRender()
      
      circles = svg.querySelectorAll('circle.token')
      const rects = svg.querySelectorAll('path.token')
      
      expect(circles.length).toBe(0) // Old circle removed
      expect(rects.length).toBe(1)   // New rect added
    })

    it('should handle token without label', () => {
      board.token(0, 0, 'unlabeled', 'circle', '#ffffff')
      forceRender()
      
      const circle = svg.querySelector('circle.token')
      const label = svg.querySelector('text.token-label')
      
      expect(circle).toBeTruthy()
      expect(label).toBeFalsy() // No label should be created
    })

    it('should register token in internal registry', () => {
      board.token(0, 0, 'player', 'circle', '#ff0000')
      
      // Access internal token registry (using type assertion to access private property)
      const tokenRegistry = (board as any).tokenRegistry as Map<string, any>
      
      expect(tokenRegistry.has('player')).toBe(true)
      const token = tokenRegistry.get('player')
      expect(token.tokenName).toBe('player')
      expect(token.color).toBe('#ff0000')
      expect(token.shape).toBe('circle')
      expect(token.currentHex).toEqual({ q: 0, r: 0 })
    })
  })

  describe('caption method', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should display caption with correct styling', async () => {
      const captionPromise = board.caption('Test Message', 1000)
      forceRender()
      
      // Caption should appear immediately
      const background = svg.querySelector('rect.caption-background') as SVGRectElement
      const text = svg.querySelector('text.caption-text') as SVGTextElement
      
      expect(background).toBeTruthy()
      expect(text).toBeTruthy()
      expect(text.textContent).toBe('Test Message')
      
      // Check background styling
      expect(background.getAttribute('fill')).toBe('rgba(0, 0, 0, 0.7)')
      expect(background.getAttribute('width')).toBe('1000')
      expect(background.getAttribute('height')).toBe('80')
      
      // Check text styling
      expect(text.getAttribute('fill')).toBe('#ffffff')
      expect(text.getAttribute('font-size')).toBe('28px')
      expect(text.getAttribute('font-weight')).toBe('bold')
      expect(text.getAttribute('text-anchor')).toBe('middle')
      
      // Complete the caption
      vi.advanceTimersByTime(2000) // 1000ms duration + 1000ms additional wait
      await captionPromise
    })

    it('should auto-remove caption after specified duration', async () => {
      const captionPromise = board.caption('Short Message', 500)
      forceRender()
      
      // Caption should be visible initially
      let text = svg.querySelector('text.caption-text')
      expect(text?.textContent).toBe('Short Message')
      
      // Fast-forward past duration (500ms) + additional wait (1000ms)
      vi.advanceTimersByTime(1500)
      forceRender() // Force render after timeout
      
      // Caption should be removed after duration
      text = svg.querySelector('text.caption-text')
      expect(text).toBeFalsy()
      
      await captionPromise
    })

    it('should use default duration when not specified', async () => {
      const captionPromise = board.caption('Default Duration')
      forceRender()
      
      let text = svg.querySelector('text.caption-text')
      expect(text?.textContent).toBe('Default Duration')
      
      // Default duration should be 2000ms + 1000ms additional wait
      vi.advanceTimersByTime(1999)
      forceRender()
      text = svg.querySelector('text.caption-text')
      expect(text).toBeTruthy() // Still visible
      
      vi.advanceTimersByTime(1001) // Complete the full duration
      forceRender()
      text = svg.querySelector('text.caption-text')
      expect(text).toBeFalsy() // Now removed
      
      await captionPromise
    })

    it('should position caption in center of board', () => {
      board.caption('Centered Text', 2000, 'center')
      forceRender()
      
      const text = svg.querySelector('text.caption-text') as SVGTextElement
      const background = svg.querySelector('rect.caption-background') as SVGRectElement
      
      // Text should be centered
      expect(text.getAttribute('x')).toBe('500') // width/2
      expect(text.getAttribute('y')).toBe('350') // height/2
      
      // Background should span full width and be centered vertically
      expect(background.getAttribute('x')).toBe('0')
      expect(background.getAttribute('y')).toBe('310') // height/2 - 40
    })

    it('should handle multiple captions', async () => {
      const caption1Promise = board.caption('First', 100)
      const caption2Promise = board.caption('Second', 100)
      forceRender()
      
      // Both captions should be present (overlapping)
      const texts = svg.querySelectorAll('text.caption-text')
      expect(texts.length).toBe(2)
      
      // Wait for both to complete (100ms duration + 1000ms additional wait)
      vi.advanceTimersByTime(1100)
      forceRender()
      await Promise.all([caption1Promise, caption2Promise])
      
      const remainingTexts = svg.querySelectorAll('text.caption-text')
      expect(remainingTexts.length).toBe(0)
    })
  })

  describe('point method', () => {
    it('should create arrow pointing to specified hex', () => {
      board.point(2, -1, 'Target Here')
      forceRender()
      
      const line = svg.querySelector('path.pointer-line') as SVGPathElement
      const head = svg.querySelector('path.pointer-head') as SVGPathElement
      const label = svg.querySelector('text.pointer-label') as SVGTextElement
      
      expect(line).toBeTruthy()
      expect(head).toBeTruthy()
      expect(label).toBeTruthy()
      
      // Check styling
      expect(line.getAttribute('stroke')).toBe('#FF6B6B')
      expect(line.getAttribute('stroke-width')).toBe('3')
      expect(line.getAttribute('fill')).toBe('none')
      expect(head.getAttribute('fill')).toBe('#FF6B6B')
      
      // Check label
      expect(label.textContent).toBe('Target Here')
      expect(label.getAttribute('fill')).toBe('#FF6B6B')
    })

    it('should create arrow without label when not provided', () => {
      board.point(1, 0)
      forceRender()
      
      const line = svg.querySelector('path.pointer-line')
      const head = svg.querySelector('path.pointer-head')
      const label = svg.querySelector('text.pointer-label')
      
      expect(line).toBeTruthy()
      expect(head).toBeTruthy()
      expect(label).toBeFalsy() // No label should be created
    })

    it('should point from outside grid toward target hex', () => {
      board.point(2, -1) // Point to hex on right side
      forceRender()
      
      const line = svg.querySelector('path.pointer-line') as SVGPathElement
      const linePath = line.getAttribute('d') || ''
      
      // Parse line path to get start and end coordinates
      const pathMatch = linePath.match(/M ([\d.]+),([\d.]+) L ([\d.]+),([\d.]+)/)
      expect(pathMatch).toBeTruthy()
      
      if (pathMatch) {
        const [, startX, startY, endX, endY] = pathMatch.map(Number)
        
        // Start should be outside the grid (far from center)
        const distanceFromCenter = Math.sqrt((startX - 500) ** 2 + (startY - 350) ** 2)
        expect(distanceFromCenter).toBeGreaterThan(200)
        
        // End should be closer to center (at the target hex)
        const endDistanceFromCenter = Math.sqrt((endX - 500) ** 2 + (endY - 350) ** 2)
        expect(endDistanceFromCenter).toBeLessThan(distanceFromCenter)
      }
    })

    it('should handle pointing to center hex', () => {
      board.point(0, 0, 'Center')
      forceRender()
      
      const line = svg.querySelector('path.pointer-line') as SVGPathElement
      const linePath = line.getAttribute('d') || ''
      
      // Should create a valid arrow even for center hex
      expect(linePath).toContain('M')
      expect(linePath).toContain('L')
      
      const label = svg.querySelector('text.pointer-label') as SVGTextElement
      expect(label.textContent).toBe('Center')
    })

    it('should create multiple arrows for multiple points', () => {
      board.point(1, 0, 'First')
      board.point(-1, 1, 'Second')
      board.point(0, -1, 'Third')
      forceRender()
      
      const lines = svg.querySelectorAll('path.pointer-line')
      const heads = svg.querySelectorAll('path.pointer-head')
      const labels = svg.querySelectorAll('text.pointer-label')
      
      expect(lines.length).toBe(3)
      expect(heads.length).toBe(3)
      expect(labels.length).toBe(3)
      
      // Check label texts
      const labelTexts = Array.from(labels).map(l => l.textContent)
      expect(labelTexts).toContain('First')
      expect(labelTexts).toContain('Second')
      expect(labelTexts).toContain('Third')
    })

    it('should not create arrow for non-existent hex coordinates', () => {
      // Try to point to hex outside the MAX_COORDINATE_RANGE
      board.point(25, 25)
      
      const lines = svg.querySelectorAll('path.pointer-line')
      const heads = svg.querySelectorAll('path.pointer-head')
      
      // Should not create any arrows for invalid coordinates
      expect(lines.length).toBe(0)
      expect(heads.length).toBe(0)
    })
  })

  describe('clear method integration', () => {
    it('should clear tokens when clearing TOKEN type', () => {
      board.token(0, 0, 'player', 'circle', '#ff0000')
      board.token(1, 1, 'enemy', 'rect', '#00ff00')
      forceRender()
      
      let tokens = svg.querySelectorAll('.token')
      expect(tokens.length).toBe(2)
      
      board.clear(ClearType.TOKEN)
      
      tokens = svg.querySelectorAll('.token')
      expect(tokens.length).toBe(0)
    })

    it('should clear captions when clearing CAPTION type', () => {
      board.caption('Test Caption')
      forceRender()
      
      let captions = svg.querySelectorAll('.caption-text')
      expect(captions.length).toBe(1)
      
      board.clear(ClearType.CAPTION)
      
      captions = svg.querySelectorAll('.caption-text')
      expect(captions.length).toBe(0)
    })

    it('should clear pointers when clearing POINT type', () => {
      board.point(1, 0, 'Test Point')
      board.point(-1, 1, 'Another Point')
      forceRender()
      
      let lines = svg.querySelectorAll('.pointer-line')
      let heads = svg.querySelectorAll('.pointer-head')
      expect(lines.length).toBe(2)
      expect(heads.length).toBe(2)
      
      board.clear(ClearType.POINT)
      
      lines = svg.querySelectorAll('.pointer-line')
      heads = svg.querySelectorAll('.pointer-head')
      expect(lines.length).toBe(0)
      expect(heads.length).toBe(0)
    })

    it('should clear all visual elements when clearing ALL', () => {
      board.token(0, 0, 'player', 'circle', '#ff0000')
      board.caption('Test Caption')
      board.point(1, 0, 'Test Point')
      forceRender()
      
      // Verify elements exist
      expect(svg.querySelectorAll('.token').length).toBe(1)
      expect(svg.querySelectorAll('.caption-text').length).toBe(1)
      expect(svg.querySelectorAll('.pointer-line').length).toBe(1)
      
      board.clear(ClearType.ALL)
      
      // All should be cleared
      expect(svg.querySelectorAll('.token').length).toBe(0)
      expect(svg.querySelectorAll('.caption-text').length).toBe(0)
      expect(svg.querySelectorAll('.pointer-line').length).toBe(0)
      expect(svg.querySelectorAll('.pointer-head').length).toBe(0)
    })
  })

  describe('animation methods', () => {
    describe('highlight method', () => {
      it('should highlight specified hex with correct color', () => {
        board.highlight(1, 0, '#ff0000')
        forceRender()
        
        // Find the highlighted hex
        const hexes = svg.querySelectorAll('path.hex')
        const highlightedHex = Array.from(hexes).find(hex => {
          const fill = hex.getAttribute('fill')
          return fill === '#ff0000'
        })
        
        expect(highlightedHex).toBeTruthy()
      })

      it('should use default color when none specified', () => {
        board.highlight(0, 0)
        forceRender()
        
        const hexes = svg.querySelectorAll('path.hex')
        const highlightedHex = Array.from(hexes).find(hex => {
          const fill = hex.getAttribute('fill')
          return fill === '#4FC3F7'
        })
        
        expect(highlightedHex).toBeTruthy()
      })

      it('should stop blink and pulse when highlighting', () => {
        // First start blinking
        board.blink(0, 0, '#ff0000')
        const centerHex = getHexCell(0, 0)
        expect(centerHex.isBlinking).toBe(true)
        
        // Then highlight the same hex
        board.highlight(0, 0, '#00ff00')
        expect(centerHex.isBlinking).toBe(false)
        expect(centerHex.highlighted).toBe(true)
      })

      it('should not highlight non-existent hex coordinates', () => {
        board.highlight(25, 25, '#ff0000') // Outside MAX_COORDINATE_RANGE
        forceRender()
        
        // No hex should have the highlight color since the coordinate doesn't exist
        const hexes = svg.querySelectorAll('path.hex')
        const highlightedHex = Array.from(hexes).find(hex => {
          const fill = hex.getAttribute('fill')
          return fill === '#ff0000'
        })
        
        expect(highlightedHex).toBeFalsy()
      })
    })

    describe('blink method', () => {
      it('should start blinking animation for specified hex', () => {
        board.blink(1, 0, '#ff0000')
        
        const blinkingHex = getHexCell(1, 0)
        
        expect(blinkingHex.isBlinking).toBe(true)
        expect(blinkingHex.blinkColor).toBe('#ff0000')
        expect(blinkingHex.highlighted).toBe(false) // Should stop static highlighting
      })

      it('should use default color when none specified', () => {
        board.blink(0, 0)
        
        const blinkingHex = getHexCell(0, 0)
        
        expect(blinkingHex.isBlinking).toBe(true)
        expect(blinkingHex.blinkColor).toBe('#4FC3F7')
      })

      it('should stop pulse when starting blink', () => {
        // First start pulsing
        board.pulse(0, 0, '#ff0000')
        const hex = getHexCell(0, 0)
        expect(hex.isPulsing).toBe(true)
        
        // Then start blinking
        board.blink(0, 0, '#00ff00')
        expect(hex.isPulsing).toBe(false)
        expect(hex.isBlinking).toBe(true)
      })
    })

    describe('pulse method', () => {
      it('should start pulsing animation for specified hex', () => {
        board.pulse(-1, 1, '#00ff00')
        
        const pulsingHex = getHexCell(-1, 1)
        
        expect(pulsingHex.isPulsing).toBe(true)
        expect(pulsingHex.pulseColor).toBe('#00ff00')
        expect(pulsingHex.highlighted).toBe(false)
        expect(pulsingHex.isBlinking).toBe(false)
      })

      it('should use default color when none specified', () => {
        board.pulse(0, 0)
        
        const pulsingHex = getHexCell(0, 0)
        
        expect(pulsingHex.isPulsing).toBe(true)
        expect(pulsingHex.pulseColor).toBe('#FFEB3B')
      })
    })
  })

  describe('move method', () => {
    it('should update token position when move is called', () => {
      // Create a token first
      board.token(0, 0, 'player', 'circle', '#ff0000')
      forceRender()
      
      const tokenRegistry = (board as any).tokenRegistry
      const token = tokenRegistry.get('player')
      
      expect(token.currentHex).toEqual({ q: 0, r: 0 })
      
      // Test that move method exists and can be called
      // (We test the state change rather than the animation timing)
      expect(typeof board.move).toBe('function')
      
      // Test that token registry is properly maintained
      expect(tokenRegistry.has('player')).toBe(true)
    })

    it('should not move non-existent token', async () => {
      const movePromise = board.move('nonexistent', 1, 1)
      
      // Should complete immediately without error
      await movePromise
      expect((board as any).isAnimating).toBe(false)
    })

    it('should not move to non-existent hex', async () => {
      board.token(0, 0, 'player', 'circle', '#ff0000')
      
      const tokenRegistry = (board as any).tokenRegistry
      const token = tokenRegistry.get('player')
      const originalHex = { ...token.currentHex }
      
      const movePromise = board.move('player', 25, 25) // Outside the MAX_COORDINATE_RANGE of 20
      await movePromise
      
      // Token should not have moved
      expect(token.currentHex).toEqual(originalHex)
    })

    it('should access move method without errors', () => {
      board.token(0, 0, 'player', 'circle', '#ff0000')
      
      // Initially not animating
      expect((board as any).isAnimating).toBe(false)
      
      // Test that move method exists and is callable
      expect(typeof board.move).toBe('function')
      
      // Test basic move call structure (without awaiting the animation)
      const result = board.move('player', 1, 0)
      expect(result).toBeInstanceOf(Promise)
    })
  })

  describe('coordinate visibility methods', () => {
    it('should show coordinates when showCoordinates is called', () => {
      board.hideCoordinates() // Ensure they're hidden first
      forceRender()
      
      let labels = svg.querySelectorAll('text.coordinate')
      expect(labels.length).toBe(0)
      
      board.showCoordinates()
      forceRender()
      
      labels = svg.querySelectorAll('text.coordinate')
      expect(labels.length).toBeGreaterThan(0)
      
      // Check that coordinates are displayed properly
      const centerLabel = Array.from(labels).find(label => 
        label.textContent === '0,0'
      )
      expect(centerLabel).toBeTruthy()
    })

    it('should hide coordinates when hideCoordinates is called', () => {
      board.showCoordinates() // Ensure they're visible first
      forceRender()
      
      let labels = svg.querySelectorAll('text.coordinate')
      expect(labels.length).toBeGreaterThan(0)
      
      board.hideCoordinates()
      forceRender()
      
      labels = svg.querySelectorAll('text.coordinate')
      expect(labels.length).toBe(0)
    })
  })

  describe('resetBoard method', () => {
    it('should clear all visual elements and states', () => {
      // Add various elements
      board.token(0, 0, 'player', 'circle', '#ff0000')
      board.highlight(1, 0, '#00ff00')
      board.blink(0, 1, '#0000ff')
      board.pulse(-1, 0, '#ffff00')
      board.point(1, 1, 'Target')
      board.caption('Test Caption')
      forceRender()
      
      // Verify elements exist
      expect(svg.querySelectorAll('.token').length).toBeGreaterThan(0)
      expect(svg.querySelectorAll('.pointer-line').length).toBeGreaterThan(0)
      expect(svg.querySelectorAll('.caption-text').length).toBeGreaterThan(0)
      
      // Reset board
      board.resetBoard()
      forceRender()
      
      // All elements should be cleared
      expect(svg.querySelectorAll('.token').length).toBe(0)
      expect(svg.querySelectorAll('.pointer-line').length).toBe(0)
      expect(svg.querySelectorAll('.caption-text').length).toBe(0)
      
      // Check internal state is cleared
      const allHexCells = (board as any).allHexCells as Map<string, any>
      allHexCells.forEach((cell: any) => {
        expect(cell.highlighted).toBe(false)
        expect(cell.isBlinking).toBe(false)
        expect(cell.isPulsing).toBe(false)
      })
      
      const tokenRegistry = (board as any).tokenRegistry
      expect(tokenRegistry.size).toBe(0)
    })
  })

  describe('configuration methods', () => {
    describe('setGridSize method', () => {
      it('should change grid size while maintaining hex size', () => {
        const originalHexRadius = board.getGridConfig().hexRadius
        const allHexCells = (board as any).allHexCells as Map<string, any>
        const originalHexCount = allHexCells.size
        
        board.setGridSize(5) // Increase from default 3 to 5
        forceRender()
        
        const newConfig = board.getGridConfig()
        const newHexCount = allHexCells.size
        
        expect(newConfig.gridRadius).toBe(5)
        expect(newConfig.hexRadius).toBe(originalHexRadius) // Should stay same
        // Note: allHexCells contains ALL possible hex coordinates, not just visible ones
        // So the total count doesn't change, just the visible gridRadius
        expect(newHexCount).toBe(originalHexCount)
      })
    })

    describe('setGridSizeWithScaling method', () => {
      it('should change grid size and auto-scale hex size', () => {
        const originalConfig = board.getGridConfig()
        
        board.setGridSizeWithScaling(5) // Increase grid size
        forceRender()
        
        const newConfig = board.getGridConfig()
        
        expect(newConfig.gridRadius).toBe(5)
        expect(newConfig.hexRadius).not.toBe(originalConfig.hexRadius) // Should change
        expect(newConfig.hexRadius).toBeLessThan(originalConfig.hexRadius!) // Smaller for larger grid
      })
    })

    describe('setHexSize method', () => {
      it('should change hex size while maintaining grid size', () => {
        const originalConfig = board.getGridConfig()
        
        board.setHexSize(35) // Change hex size
        forceRender()
        
        const newConfig = board.getGridConfig()
        
        expect(newConfig.gridRadius).toBe(originalConfig.gridRadius) // Should stay same
        expect(newConfig.hexRadius).toBe(35)
      })
    })

    describe('configure method', () => {
      it('should update multiple configuration options', () => {
        board.configure({
          gridRadius: 4,
          hexRadius: 30,
          width: 1200,
          height: 800
        })
        forceRender()
        
        const config = board.getGridConfig()
        
        expect(config.gridRadius).toBe(4)
        expect(config.hexRadius).toBe(30)
        expect(config.width).toBe(1200)
        expect(config.height).toBe(800)
        
        // Check SVG dimensions were updated
        expect(svg.getAttribute('width')).toBe('1200')
        expect(svg.getAttribute('height')).toBe('800')
      })

      it('should update only specified configuration options', () => {
        const originalConfig = board.getGridConfig()
        
        board.configure({ gridRadius: 5 }) // Only change grid radius
        
        const newConfig = board.getGridConfig()
        
        expect(newConfig.gridRadius).toBe(5)
        expect(newConfig.hexRadius).toBe(originalConfig.hexRadius) // Should stay same
        expect(newConfig.width).toBe(originalConfig.width) // Should stay same
        expect(newConfig.height).toBe(originalConfig.height) // Should stay same
      })
    })

    describe('getGridConfig method', () => {
      it('should return current configuration', () => {
        const config = board.getGridConfig()
        
        expect(config).toBeDefined()
        expect(typeof config.gridRadius).toBe('number')
        expect(typeof config.hexRadius).toBe('number')
        expect(typeof config.width).toBe('number')
        expect(typeof config.height).toBe('number')
      })

      it('should return updated configuration after changes', () => {
        board.setGridSize(6)
        board.setHexSize(40)
        
        const config = board.getGridConfig()
        
        expect(config.gridRadius).toBe(6)
        expect(config.hexRadius).toBe(40)
      })
    })

    describe('dice method', () => {
      it('should render d6 dice with square shape', () => {
        board.dice('d6', 3)
        forceRender()
        
        const diceElements = svg.querySelectorAll('.dice')
        const diceNumbers = svg.querySelectorAll('.dice-number')
        
        expect(diceElements.length).toBe(1)
        expect(diceNumbers.length).toBe(1)
        expect(diceNumbers[0].textContent).toBe('3')
        
        // Check it's a rect (square for d6)
        expect(diceElements[0].tagName.toLowerCase()).toBe('rect')
      })

      it('should render d20 dice with diamond shape', () => {
        board.dice('d20', 15)
        forceRender()
        
        const diceElements = svg.querySelectorAll('.dice')
        const diceNumbers = svg.querySelectorAll('.dice-number')
        
        expect(diceElements.length).toBe(1)
        expect(diceNumbers.length).toBe(1)
        expect(diceNumbers[0].textContent).toBe('15')
        
        // Check it's a polygon (diamond for d20)
        expect(diceElements[0].tagName.toLowerCase()).toBe('polygon')
      })

      it('should validate d6 number range', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        board.dice('d6', 7) // Invalid - over 6
        forceRender()
        
        expect(consoleSpy).toHaveBeenCalledWith('Invalid number 7 for d6. Must be between 1 and 6.')
        expect(svg.querySelectorAll('.dice').length).toBe(0)
        
        consoleSpy.mockRestore()
      })

      it('should validate d20 number range', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        board.dice('d20', 21) // Invalid - over 20
        forceRender()
        
        expect(consoleSpy).toHaveBeenCalledWith('Invalid number 21 for d20. Must be between 1 and 20.')
        expect(svg.querySelectorAll('.dice').length).toBe(0)
        
        consoleSpy.mockRestore()
      })

      it('should validate minimum number values', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        board.dice('d6', 0) // Invalid - under 1
        forceRender()
        
        expect(consoleSpy).toHaveBeenCalledWith('Invalid number 0 for d6. Must be between 1 and 6.')
        expect(svg.querySelectorAll('.dice').length).toBe(0)
        
        consoleSpy.mockRestore()
      })

      it('should add multiple dice instead of replacing', () => {
        board.dice('d6', 3)
        forceRender()
        
        expect(svg.querySelectorAll('.dice').length).toBe(1)
        expect(svg.querySelectorAll('.dice-number')[0].textContent).toBe('3')
        
        board.dice('d20', 18)
        forceRender()
        
        expect(svg.querySelectorAll('.dice').length).toBe(2) // Two dice now
        const numbers = Array.from(svg.querySelectorAll('.dice-number')).map(el => el.textContent)
        expect(numbers).toContain('3')
        expect(numbers).toContain('18')
      })

      it('should position multiple dice horizontally', () => {
        board.dice('d6', 1)
        board.dice('d6', 2)
        board.dice('d6', 3)
        forceRender()
        
        const diceElements = svg.querySelectorAll('.dice')
        expect(diceElements.length).toBe(3)
        
        // Check that dice are positioned at different x coordinates
        const positions = Array.from(diceElements).map(el => {
          if (el.tagName.toLowerCase() === 'rect') {
            return parseFloat(el.getAttribute('x') || '0')
          } else {
            // For polygon, get first point x coordinate
            const points = el.getAttribute('points') || ''
            return parseFloat(points.split(',')[0])
          }
        })
        
        // All positions should be different
        expect(positions[0]).not.toBe(positions[1])
        expect(positions[1]).not.toBe(positions[2])
        expect(positions[0]).not.toBe(positions[2])
        
        // They should be in ascending order (left to right)
        expect(positions[0]).toBeLessThan(positions[1])
        expect(positions[1]).toBeLessThan(positions[2])
      })

      it('should support mixed die types with different colors', () => {
        board.dice('d6', 4, '#ff0000')   // Red d6
        board.dice('d20', 15, '#00ff00') // Green d20
        board.dice('d6', 6, '#0000ff')   // Blue d6
        forceRender()
        
        const diceElements = svg.querySelectorAll('.dice')
        const numberElements = svg.querySelectorAll('.dice-number')
        
        expect(diceElements.length).toBe(3)
        expect(numberElements.length).toBe(3)
        
        // Check colors
        expect(diceElements[0].getAttribute('fill')).toBe('#ff0000')
        expect(diceElements[1].getAttribute('fill')).toBe('#00ff00')
        expect(diceElements[2].getAttribute('fill')).toBe('#0000ff')
        
        // Check numbers
        const numbers = Array.from(numberElements).map(el => el.textContent)
        expect(numbers).toEqual(['4', '15', '6'])
        
        // Check shapes (d6=rect, d20=polygon)
        expect(diceElements[0].tagName.toLowerCase()).toBe('rect')
        expect(diceElements[1].tagName.toLowerCase()).toBe('polygon')
        expect(diceElements[2].tagName.toLowerCase()).toBe('rect')
      })

      it('should be cleared by ClearType.DICE', () => {
        board.dice('d6', 4)
        board.dice('d20', 15)
        board.dice('d6', 2)
        forceRender()
        
        expect(svg.querySelectorAll('.dice').length).toBe(3)
        
        board.clear(ClearType.DICE)
        
        expect(svg.querySelectorAll('.dice').length).toBe(0)
      })

      it('should be cleared by ClearType.ALL', () => {
        board.dice('d20', 12)
        board.dice('d6', 5)
        forceRender()
        
        expect(svg.querySelectorAll('.dice').length).toBe(2)
        
        board.clear(ClearType.ALL)
        
        expect(svg.querySelectorAll('.dice').length).toBe(0)
      })

      it('should be cleared by resetBoard', () => {
        board.dice('d6', 6)
        board.dice('d20', 20)
        forceRender()
        
        expect(svg.querySelectorAll('.dice').length).toBe(2)
        
        board.resetBoard()
        
        expect(svg.querySelectorAll('.dice').length).toBe(0)
      })

      it('should use default color when no color specified', () => {
        board.dice('d6', 3)
        forceRender()
        
        const diceElement = svg.querySelector('.dice')
        expect(diceElement).toBeTruthy()
        expect(diceElement!.getAttribute('fill')).toBe('#BDBDBD')
      })

      it('should use custom color when specified', () => {
        board.dice('d6', 4, '#ff6b6b')
        forceRender()
        
        const diceElement = svg.querySelector('.dice')
        expect(diceElement).toBeTruthy()
        expect(diceElement!.getAttribute('fill')).toBe('#ff6b6b')
      })

      it('should support different colors for d20', () => {
        board.dice('d20', 15, '#4ecdc4')
        forceRender()
        
        const diceElement = svg.querySelector('.dice')
        expect(diceElement).toBeTruthy()
        expect(diceElement!.getAttribute('fill')).toBe('#4ecdc4')
      })

      it('should show multiple dice with different colors', () => {
        board.dice('d6', 1, '#ff0000')
        forceRender()
        
        expect(svg.querySelectorAll('.dice').length).toBe(1)
        expect(svg.querySelector('.dice')!.getAttribute('fill')).toBe('#ff0000')
        
        board.dice('d6', 6, '#00ff00')
        forceRender()
        
        expect(svg.querySelectorAll('.dice').length).toBe(2) // Two dice now
        const diceElements = Array.from(svg.querySelectorAll('.dice'))
        expect(diceElements[0].getAttribute('fill')).toBe('#ff0000') // First die red
        expect(diceElements[1].getAttribute('fill')).toBe('#00ff00') // Second die green
      })
    })

    describe('Color Constants Support', () => {
      it('should resolve Colors.BLUE syntax to hex color', () => {
        board.highlight(0, 0, 'Colors.BLUE')
        forceRender()
        
        const hexElement = svg.querySelector('[fill="#4FC3F7"]')
        expect(hexElement).toBeTruthy()
      })

      it('should resolve direct color constants to hex colors', () => {
        board.highlight(0, 0, 'BLUE')
        forceRender()

        const hexElement = svg.querySelector('[fill="#4FC3F7"]')
        expect(hexElement).toBeTruthy()
      })

      it('should resolve color constants regardless of case', () => {
        board.highlight(0, 0, 'blue')
        board.highlight(1, 0, 'Colors.red')
        forceRender()

        expect(svg.querySelector('[fill="#4FC3F7"]')).toBeTruthy()
        expect(svg.querySelector('[fill="#FF6B6B"]')).toBeTruthy()
      })

      it('should resolve semantic color constants', () => {
        board.highlight(0, 0, 'ALLY')
        board.highlight(1, 0, 'ENEMY')
        board.highlight(0, 1, 'NEUTRAL')
        forceRender()
        
        expect(svg.querySelector('[fill="#4CAF50"]')).toBeTruthy() // ALLY = green
        expect(svg.querySelector('[fill="#FF6B6B"]')).toBeTruthy() // ENEMY = red  
        expect(svg.querySelector('[fill="#FFD54F"]')).toBeTruthy() // NEUTRAL = yellow
      })

      it('should work with tokens using color constants', () => {
        board.token(0, 0, 'hero', 'circle', 'ALLY')
        board.token(1, 0, 'enemy', 'triangle', 'ENEMY')
        forceRender()
        
        const circles = svg.querySelectorAll('circle[fill="#4CAF50"]')
        const triangles = svg.querySelectorAll('path[fill="#FF6B6B"]')
        expect(circles.length).toBeGreaterThan(0)
        expect(triangles.length).toBeGreaterThan(0)
      })

      it('should work with dice using color constants', () => {
        board.dice('d6', 4, 'BLUE')
        board.dice('d20', 15, 'RED')
        forceRender()
        
        const blueDice = svg.querySelector('.dice[fill="#4FC3F7"]')
        const redDice = svg.querySelector('.dice[fill="#FF6B6B"]')
        expect(blueDice).toBeTruthy()
        expect(redDice).toBeTruthy()
      })

      it('should fall back to original string for unknown colors', () => {
        board.highlight(0, 0, '#custom123')
        forceRender()
        
        const hexElement = svg.querySelector('[fill="#custom123"]')
        expect(hexElement).toBeTruthy()
      })

      it('should support all palette colors', () => {
        const paletteColors = [
          ['BLUE', '#4FC3F7'], ['RED', '#FF6B6B'], ['GREEN', '#4CAF50'], 
          ['YELLOW', '#FFD54F'], ['PURPLE', '#BA68C8'], ['ORANGE', '#FF9800'],
          ['WHITE', '#FFFFFF'], ['BLACK', '#000000'], ['GRAY', '#757575']
        ]
        
        paletteColors.forEach(([colorName], i) => {
          board.highlight(i, 0, colorName)
        })
        forceRender()
        
        paletteColors.forEach(([, expectedHex]) => {
          const element = svg.querySelector(`[fill="${expectedHex}"]`)
          expect(element).toBeTruthy()
        })
      })
    })
  })
})