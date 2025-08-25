import * as d3 from 'd3';
import { HexCell, GamePiece, GamePointer, GameCaption, GameDice, GridConfig, ClearType, Colors } from './types.js';

export class BoardcastHexBoard {
  private static readonly MAX_COORDINATE_RANGE = 20; // Fixed coordinate space -20 to +20
  
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  private allHexCells: Map<string, HexCell> = new Map(); // All possible hex cells
  private gamePieces: GamePiece[] = [];
  private gamePointers: GamePointer[] = [];
  private gameCaptions: GameCaption[] = [];
  private gameDice: GameDice[] = [];
  private tokenRegistry: Map<string, GamePiece> = new Map();
  private width: number = 1000;
  private height: number = 700;
  private hexRadius: number = 25;
  private gridRadius: number = 3; // Display viewport radius
  private coordinatesVisible: boolean = true;
  private isAnimating: boolean = false;
  private time: number = 0;
  private onGridExpansion?: (oldRadius: number, newRadius: number, coordinates: Array<{q: number, r: number}>) => void;

  constructor(svgSelector: string, config: GridConfig = {}) {
    this.svg = d3.select(svgSelector);
    this.gridRadius = config.gridRadius ?? 3;
    this.hexRadius = config.hexRadius ?? this.calculateOptimalHexSize(config.gridRadius ?? 3);
    this.width = config.width ?? 1000;
    this.height = config.height ?? 700;
    this.onGridExpansion = config.onGridExpansion;
    
    // Update SVG dimensions if provided
    if (config.width || config.height) {
      this.svg.attr('width', this.width).attr('height', this.height);
    }
    
    this.initializeBoard();
    this.startAnimationLoop();
    this.render();
  }

  /**
   * Resolves color constants (e.g., "Colors.BLUE") to hex color codes.
   * If the input is already a hex color or not a color constant, returns it unchanged.
   */
  private resolveColor(colorInput: string): string {
    // Check if it's a Colors constant (e.g., "Colors.BLUE", "BLUE")
    if (colorInput.startsWith('Colors.')) {
      const colorName = colorInput.slice(7) as keyof typeof Colors;
      return Colors[colorName] || colorInput;
    }
    
    // Check if it's just the color name (e.g., "BLUE")
    if (colorInput in Colors) {
      return Colors[colorInput as keyof typeof Colors];
    }
    
    // Otherwise, assume it's already a hex color or valid CSS color
    return colorInput;
  }

  private axialToPixel(q: number, r: number): { x: number; y: number } {
    const size = this.hexRadius;
    const x = size * (3/2 * q);
    const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
    return { x: x + this.width/2, y: y + this.height/2 };
  }

  private initializeBoard(): void {
    // Only initialize hex cells once - create fixed coordinate space
    if (this.allHexCells.size === 0) {
      this.createFixedCoordinateSpace();
    }
    
    // Update pixel positions for all hex cells based on current hexRadius
    this.updateHexPixelPositions();
  }

  private createFixedCoordinateSpace(): void {
    const range = BoardcastHexBoard.MAX_COORDINATE_RANGE;
    
    for (let q = -range; q <= range; q++) {
      const r1 = Math.max(-range, -q - range);
      const r2 = Math.min(range, -q + range);
      
      for (let r = r1; r <= r2; r++) {
        const hexId = `hex-${q}-${r}`;
        const pixel = this.axialToPixel(q, r);
        
        const hexCell: HexCell = {
          q,
          r,
          x: pixel.x,
          y: pixel.y,
          id: hexId,
          highlighted: false,
          isBlinking: false,
          blinkPhase: 0,
          isPulsing: false,
          pulsePhase: 0,
          originalColor: '#2a2a2a'
        };
        
        this.allHexCells.set(hexId, hexCell);
      }
    }
  }

  private updateHexPixelPositions(): void {
    // Update pixel positions for all hex cells when hexRadius changes
    this.allHexCells.forEach(hexCell => {
      const pixel = this.axialToPixel(hexCell.q, hexCell.r);
      hexCell.x = pixel.x;
      hexCell.y = pixel.y;
    });
    
    // Update token positions
    this.gamePieces.forEach(piece => {
      const pixel = this.axialToPixel(piece.currentHex.q, piece.currentHex.r);
      piece.x = pixel.x;
      piece.y = pixel.y;
    });
    
    // Update pointer positions
    this.gamePointers.forEach(pointer => {
      const targetPixel = this.axialToPixel(pointer.targetQ, pointer.targetR);
      const gridCenter = { x: this.width / 2, y: this.height / 2 };
      const distance = Math.sqrt(Math.pow(targetPixel.x - gridCenter.x, 2) + Math.pow(targetPixel.y - gridCenter.y, 2));
      const arrowLength = Math.min(distance * 0.4, 100);
      const angle = Math.atan2(targetPixel.y - gridCenter.y, targetPixel.x - gridCenter.x);
      
      pointer.x = targetPixel.x;
      pointer.y = targetPixel.y;
      pointer.startX = targetPixel.x - Math.cos(angle) * arrowLength;
      pointer.startY = targetPixel.y - Math.sin(angle) * arrowLength;
    });
  }

  private getVisibleHexCells(): HexCell[] {
    // Return only hex cells within current display viewport
    const visibleCells: HexCell[] = [];
    
    this.allHexCells.forEach(hexCell => {
      const distance = Math.max(Math.abs(hexCell.q), Math.abs(hexCell.r), Math.abs(-hexCell.q - hexCell.r));
      if (distance <= this.gridRadius) {
        // Also check if hex is within screen bounds
        if (hexCell.x >= 50 && hexCell.x <= this.width - 50 && 
            hexCell.y >= 50 && hexCell.y <= this.height - 50) {
          visibleCells.push(hexCell);
        }
      }
    });
    
    return visibleCells;
  }


  private isCoordinateInFixedSpace(q: number, r: number): boolean {
    const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
    return distance <= BoardcastHexBoard.MAX_COORDINATE_RANGE;
  }

  private calculateRequiredGridRadius(coordinates: Array<{q: number, r: number}>): number {
    let maxDistance = this.gridRadius; // Start with current radius
    
    coordinates.forEach(coord => {
      const distance = Math.max(Math.abs(coord.q), Math.abs(coord.r), Math.abs(-coord.q - coord.r));
      maxDistance = Math.max(maxDistance, distance);
    });
    
    return maxDistance;
  }

  private ensureCoordinatesVisible(coordinates: Array<{q: number, r: number}>): boolean {
    // Check if all coordinates are within fixed coordinate space
    const invalidCoords = coordinates.filter(coord => !this.isCoordinateInFixedSpace(coord.q, coord.r));
    if (invalidCoords.length > 0) {
      console.warn(`Coordinates outside fixed coordinate space (±${BoardcastHexBoard.MAX_COORDINATE_RANGE}):`, invalidCoords);
      return false;
    }

    // Calculate required grid radius to show all coordinates
    const requiredRadius = this.calculateRequiredGridRadius(coordinates);
    
    // Expand viewport if needed
    if (requiredRadius > this.gridRadius) {
      const oldRadius = this.gridRadius;
      this.gridRadius = requiredRadius;
      
      const outOfViewCoords = coordinates.filter(coord => {
        const distance = Math.max(Math.abs(coord.q), Math.abs(coord.r), Math.abs(-coord.q - coord.r));
        return distance > oldRadius;
      });
      
      // Call user callback if provided
      if (this.onGridExpansion) {
        this.onGridExpansion(oldRadius, requiredRadius, outOfViewCoords);
      } else {
        // Fallback: log expansion for debugging
        console.log(`Auto-expanded grid from ${oldRadius} to ${requiredRadius} to show coordinates:`, outOfViewCoords);
      }
      
      // Update hex size if needed to keep grid reasonably sized
      const newHexRadius = this.calculateOptimalHexSize(requiredRadius);
      if (newHexRadius !== this.hexRadius) {
        this.hexRadius = newHexRadius;
        this.updateHexPixelPositions();
      }
      
      return true; // Grid was expanded
    }
    
    return false; // No expansion needed
  }

  private createHexagonPath(size: number): string {
    const points: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = size * Math.cos(angle);
      const y = size * Math.sin(angle);
      points.push([x, y]);
    }
    
    return `M ${points[0][0]},${points[0][1]} ` + 
           points.slice(1).map(p => `L ${p[0]},${p[1]}`).join(' ') + ' Z';
  }

  private createRectPath(size: number): string {
    const half = size * 0.8;
    return `M ${-half},${-half} L ${half},${-half} L ${half},${half} L ${-half},${half} Z`;
  }

  private createTrianglePath(size: number): string {
    const height = size * 1.2;
    const width = size;
    return `M 0,${-height/2} L ${width/2},${height/2} L ${-width/2},${height/2} Z`;
  }

  private createStarPath(size: number): string {
    const outerRadius = size;
    const innerRadius = size * 0.4;
    const points: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = radius * Math.cos(angle - Math.PI / 2);
      const y = radius * Math.sin(angle - Math.PI / 2);
      points.push(i === 0 ? `M ${x},${y}` : `L ${x},${y}`);
    }
    
    return points.join(' ') + ' Z';
  }

  private createArrowPath(startX: number, startY: number, endX: number, endY: number): { line: string; head: string } {
    // Calculate arrow head
    const headLength = 15;
    const headWidth = 8;
    
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) {
      return { line: '', head: '' };
    }
    
    // Normalize direction
    const unitX = dx / length;
    const unitY = dy / length;
    
    // Calculate arrow head points
    const headBaseX = endX - headLength * unitX;
    const headBaseY = endY - headLength * unitY;
    
    // Perpendicular vector for head width
    const perpX = -unitY * headWidth;
    const perpY = unitX * headWidth;
    
    const headPoint1X = headBaseX + perpX;
    const headPoint1Y = headBaseY + perpY;
    const headPoint2X = headBaseX - perpX;
    const headPoint2Y = headBaseY - perpY;
    
    // Create line (stop before arrow head)
    const lineEndX = endX - (headLength * 0.7) * unitX;
    const lineEndY = endY - (headLength * 0.7) * unitY;
    const line = `M ${startX},${startY} L ${lineEndX},${lineEndY}`;
    
    // Create arrow head
    const head = `M ${endX},${endY} L ${headPoint1X},${headPoint1Y} L ${headPoint2X},${headPoint2Y} Z`;
    
    return { line, head };
  }

  private render(): void {
    // Clear existing content
    this.svg.selectAll('*').remove();

    // Get visible hex cells for current viewport
    const visibleHexCells = this.getVisibleHexCells();

    // Render hexagons
    const hexagons = this.svg.selectAll<SVGPathElement, HexCell>('path.hex')
      .data(visibleHexCells, d => d.id);

    hexagons.enter()
      .append('path')
      .attr('class', 'hex')
      .attr('d', this.createHexagonPath(this.hexRadius))
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .attr('fill', d => this.getHexFillColor(d))
      .attr('stroke', '#666')
      .attr('stroke-width', 1)
      .attr('opacity', 0.8);

    // Render coordinate labels if enabled
    if (this.coordinatesVisible) {
      const labels = this.svg.selectAll<SVGTextElement, HexCell>('text.coordinate')
        .data(visibleHexCells, d => d.id);

      labels.enter()
        .append('text')
        .attr('class', 'coordinate')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .text(d => `${d.q},${d.r}`);
    }

    // Render game pieces (tokens)
    this.gamePieces.forEach(piece => {
      if (piece.shape === 'circle') {
        this.svg.append('circle')
          .attr('class', 'token')
          .attr('cx', piece.x)
          .attr('cy', piece.y)
          .attr('r', piece.size)
          .attr('fill', piece.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      } else {
        const pathData = this.getShapePath(piece.shape, piece.size);
        this.svg.append('path')
          .attr('class', 'token')
          .attr('d', pathData)
          .attr('transform', `translate(${piece.x},${piece.y})`)
          .attr('fill', piece.color)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
      }

      // Render token label if present
      if (piece.label) {
        this.svg.append('text')
          .attr('class', 'token-label')
          .attr('x', piece.x)
          .attr('y', piece.y + piece.size + 18) // Position below the token
          .attr('text-anchor', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', '12px')
          .attr('font-family', 'sans-serif')
          .attr('font-weight', 'bold')
          .attr('stroke', '#000')
          .attr('stroke-width', 0.5)
          .text(piece.label);
      }
    });

    // Render pointers (arrows)
    this.gamePointers.forEach(pointer => {
      const arrow = this.createArrowPath(pointer.startX, pointer.startY, pointer.x, pointer.y);
      
      // Render arrow line
      if (arrow.line) {
        this.svg.append('path')
          .attr('class', 'pointer-line')
          .attr('d', arrow.line)
          .attr('stroke', pointer.color)
          .attr('stroke-width', 3)
          .attr('fill', 'none')
          .attr('stroke-linecap', 'round');
      }
      
      // Render arrow head
      if (arrow.head) {
        this.svg.append('path')
          .attr('class', 'pointer-head')
          .attr('d', arrow.head)
          .attr('fill', pointer.color)
          .attr('stroke', pointer.color)
          .attr('stroke-width', 1);
      }
      
      // Render pointer label if present
      if (pointer.label) {
        // Position label near the start of the arrow
        const labelX = pointer.startX + (pointer.x - pointer.startX) * 0.2;
        const labelY = pointer.startY + (pointer.y - pointer.startY) * 0.2 - 10;
        
        this.svg.append('text')
          .attr('class', 'pointer-label')
          .attr('x', labelX)
          .attr('y', labelY)
          .attr('text-anchor', 'middle')
          .attr('fill', pointer.color)
          .attr('font-size', '14px')
          .attr('font-family', 'sans-serif')
          .attr('font-weight', 'bold')
          .attr('stroke', '#000')
          .attr('stroke-width', 0.5)
          .text(pointer.label);
      }
    });

    // Render captions (text overlays)
    this.gameCaptions.forEach(caption => {
      if (caption.visible) {
        // Calculate position based on caption.position
        let backgroundY: number;
        let textY: number;
        
        if (caption.position === 'bottom') {
          backgroundY = this.height - 80;
          textY = this.height - 40;
        } else { // center (default)
          backgroundY = this.height / 2 - 40;
          textY = this.height / 2;
        }

        // Create semi-transparent background for better text readability
        this.svg.append('rect')
          .attr('class', 'caption-background')
          .attr('x', 0)
          .attr('y', backgroundY)
          .attr('width', this.width)
          .attr('height', 80)
          .attr('fill', 'rgba(0, 0, 0, 0.7)')
          .attr('stroke', 'none');

        // Render caption text
        this.svg.append('text')
          .attr('class', 'caption-text')
          .attr('x', this.width / 2)
          .attr('y', textY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', '28px')
          .attr('font-family', 'sans-serif')
          .attr('font-weight', 'bold')
          .attr('stroke', '#000')
          .attr('stroke-width', 1)
          .text(caption.text);
      }
    });

    // Render dice
    const visibleDice = this.gameDice.filter(dice => dice.visible);
    
    if (visibleDice.length > 0) {
      const diceSize = 80;
      const spacing = 20;
      const totalWidth = (visibleDice.length * diceSize) + ((visibleDice.length - 1) * spacing);
      const startX = (this.width / 2) - (totalWidth / 2);
      const centerY = this.height / 2;
      
      visibleDice.forEach((dice, index) => {
        const diceX = startX + (index * (diceSize + spacing)) + (diceSize / 2);
        
        // Different styling for d6 vs d20
        const diceColor = dice.color || '#f0f0f0';
        
        if (dice.dieType === 'd6') {
          // Square die for d6
          this.svg.append('rect')
            .attr('class', 'dice')
            .attr('x', diceX - diceSize/2)
            .attr('y', centerY - diceSize/2)
            .attr('width', diceSize)
            .attr('height', diceSize)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('fill', diceColor)
            .attr('stroke', '#333333')
            .attr('stroke-width', 3);
        } else {
          // Diamond shape for d20
          const points = [
            [diceX, centerY - diceSize/2],
            [diceX + diceSize/2, centerY],
            [diceX, centerY + diceSize/2],
            [diceX - diceSize/2, centerY]
          ];
          
          this.svg.append('polygon')
            .attr('class', 'dice')
            .attr('points', points.map(p => `${p[0]},${p[1]}`).join(' '))
            .attr('fill', diceColor)
            .attr('stroke', '#333333')
            .attr('stroke-width', 3);
        }
        
        // Render the number
        this.svg.append('text')
          .attr('class', 'dice-number')
          .attr('x', diceX)
          .attr('y', centerY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#333333')
          .attr('font-size', '36px')
          .attr('font-family', 'sans-serif')
          .attr('font-weight', 'bold')
          .text(dice.displayedNumber.toString());
      });
    }
  }

  private getHexFillColor(cell: HexCell): string {
    if (cell.isPulsing && cell.pulseColor) {
      const pulseIntensity = (Math.sin(cell.pulsePhase) + 1) / 2; // 0 to 1
      return this.interpolateColors(cell.originalColor, cell.pulseColor, pulseIntensity);
    }
    if (cell.isBlinking && cell.blinkColor) {
      const blinkIntensity = (Math.sin(cell.blinkPhase) + 1) / 2;
      return blinkIntensity > 0.5 ? cell.blinkColor : cell.originalColor;
    }
    if (cell.highlighted && cell.highlightColor) {
      return cell.highlightColor;
    }
    return cell.originalColor;
  }

  private interpolateColors(color1: string, color2: string, factor: number): string {
    // Convert hex colors to RGB
    const getRGB = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const rgb1 = getRGB(color1);
    const rgb2 = getRGB(color2);

    // Interpolate between colors
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);

    // Convert back to hex
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  private getShapePath(shape: 'rect' | 'triangle' | 'star', size: number): string {
    switch (shape) {
      case 'rect': return this.createRectPath(size);
      case 'triangle': return this.createTrianglePath(size);
      case 'star': return this.createStarPath(size);
      default: return '';
    }
  }

  private startAnimationLoop(): void {
    const animate = () => {
      this.time += 0.05;
      
      // Update blink and pulse phases
      this.allHexCells.forEach(cell => {
        if (cell.isBlinking) {
          cell.blinkPhase = this.time * 3; // Speed of blinking
        }
        if (cell.isPulsing) {
          cell.pulsePhase = this.time * 0.8; // Slower speed for gradual pulse
        }
      });
      
      this.render();
      requestAnimationFrame(animate);
    };
    animate();
  }

  public showCoordinates(): void {
    this.coordinatesVisible = true;
    this.render();
  }

  public hideCoordinates(): void {
    this.coordinatesVisible = false;
    this.render();
  }

  // Public API methods from README.md
  public highlight(q: number, r: number, colour: string = 'HIGHLIGHT'): void {
    // Ensure coordinate is visible by expanding viewport if needed
    const expanded = this.ensureCoordinatesVisible([{q, r}]);
    
    const resolvedColor = this.resolveColor(colour);
    const cell = this.allHexCells.get(`hex-${q}-${r}`);
    if (cell) {
      cell.highlighted = true;
      cell.highlightColor = resolvedColor;
      cell.isBlinking = false; // Stop blinking if it was blinking
      cell.isPulsing = false; // Stop pulsing if it was pulsing
      
      // Re-render if viewport was expanded
      if (expanded) {
        this.render();
      }
    }
  }

  public blink(q: number, r: number, colour: string = 'HIGHLIGHT'): void {
    // Ensure coordinate is visible by expanding viewport if needed
    const expanded = this.ensureCoordinatesVisible([{q, r}]);
    
    const resolvedColor = this.resolveColor(colour);
    const cell = this.allHexCells.get(`hex-${q}-${r}`);
    if (cell) {
      cell.isBlinking = true;
      cell.blinkColor = resolvedColor;
      cell.highlighted = false; // Stop static highlight if it was highlighted
      cell.isPulsing = false; // Stop pulsing if it was pulsing
      cell.blinkPhase = this.time * 3;
      
      // Re-render if viewport was expanded
      if (expanded) {
        this.render();
      }
    }
  }

  public pulse(q: number, r: number, colour: string = 'ENGAGEMENT'): void {
    // Ensure coordinate is visible by expanding viewport if needed
    const expanded = this.ensureCoordinatesVisible([{q, r}]);
    
    const resolvedColor = this.resolveColor(colour);
    const cell = this.allHexCells.get(`hex-${q}-${r}`);
    if (cell) {
      cell.isPulsing = true;
      cell.pulseColor = resolvedColor;
      cell.highlighted = false; // Stop static highlight if it was highlighted
      cell.isBlinking = false; // Stop blinking if it was blinking
      cell.pulsePhase = this.time * 0.8; // Slower than blink for gradual transition
      
      // Re-render if viewport was expanded
      if (expanded) {
        this.render();
      }
    }
  }

  public point(q: number, r: number, label?: string): void {
    // Ensure coordinate is visible by expanding viewport if needed
    const expanded = this.ensureCoordinatesVisible([{q, r}]);
    
    const targetCell = this.allHexCells.get(`hex-${q}-${r}`);
    if (!targetCell) return;

    // Calculate pointer position (pointing from outside the grid toward the hex)
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // Calculate direction from center to target
    const dx = targetCell.x - centerX;
    const dy = targetCell.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      // If pointing at center, point from top
      const startX = centerX;
      const startY = centerY - 80;
      const endX = targetCell.x;
      const endY = targetCell.y; // Point directly to hex center
      
      this.gamePointers.push({
        id: `pointer-${Date.now()}-${Math.random()}`,
        targetQ: q,
        targetR: r,
        x: endX,
        y: endY,
        startX,
        startY,
        label,
        color: Colors.RED
      });
    } else {
      // Point from outside the grid
      const unitX = dx / distance;
      const unitY = dy / distance;
      
      // Start position outside the grid
      const margin = 100;
      const startDistance = distance + margin;
      const startX = centerX + unitX * startDistance;
      const startY = centerY + unitY * startDistance;
      
      // End position at hex center (not edge)
      const endX = targetCell.x; // Point directly to hex center
      const endY = targetCell.y; // Point directly to hex center
      
      this.gamePointers.push({
        id: `pointer-${Date.now()}-${Math.random()}`,
        targetQ: q,
        targetR: r,
        x: endX,
        y: endY,
        startX,
        startY,
        label,
        color: Colors.RED
      });
    }
    
    // Re-render if viewport was expanded
    if (expanded) {
      this.render();
    }
  }

  public async caption(text: string, duration: number = 2000, position: 'center' | 'bottom' = 'bottom'): Promise<void> {
    const caption: GameCaption = {
      id: `caption-${Date.now()}-${Math.random()}`,
      text,
      startTime: Date.now(),
      duration,
      visible: true,
      position
    };

    this.gameCaptions.push(caption);

    return new Promise<void>((resolve) => {
      // First wait for caption duration, then remove caption
      setTimeout(() => {
        const index = this.gameCaptions.findIndex(c => c.id === caption.id);
        if (index !== -1) {
          this.gameCaptions.splice(index, 1);
        }
        
        // Then wait additional 1 second after caption disappears
        setTimeout(() => {
          resolve();
        }, 1000);
      }, duration);
    });
  }

  public dice(dieType: 'd6' | 'd20', displayedNumber: number, color: string = 'LIGHT_GRAY'): void {
    // Validate the displayedNumber range based on die type
    const maxValue = dieType === 'd6' ? 6 : 20;
    if (displayedNumber < 1 || displayedNumber > maxValue) {
      console.warn(`Invalid number ${displayedNumber} for ${dieType}. Must be between 1 and ${maxValue}.`);
      return;
    }

    const resolvedColor = this.resolveColor(color);
    const dice: GameDice = {
      id: `dice-${Date.now()}-${Math.random()}`,
      dieType,
      displayedNumber,
      visible: true,
      color: resolvedColor
    };

    this.gameDice.push(dice);
    this.render();
  }

  public clear(type: ClearType = ClearType.ALL): void {
    switch (type) {
      case ClearType.ALL:
        this.clearHighlights();
        this.clearBlinks();
        this.clearPulses();
        this.clearPointers();
        this.clearTokens();
        this.clearCaptions();
        this.clearDice();
        break;
      
      case ClearType.HIGHLIGHT:
        this.clearHighlights();
        break;
      
      case ClearType.BLINK:
        this.clearBlinks();
        break;
      
      case ClearType.PULSE:
        this.clearPulses();
        break;
      
      case ClearType.POINT:
        this.clearPointers();
        break;
      
      case ClearType.TOKEN:
        this.clearTokens();
        break;
      
      case ClearType.CAPTION:
        this.clearCaptions();
        break;
      
      case ClearType.DICE:
        this.clearDice();
        break;
    }
    
    this.render();
  }

  private clearHighlights(): void {
    this.allHexCells.forEach(cell => {
      cell.highlighted = false;
      cell.highlightColor = undefined;
    });
  }

  private clearBlinks(): void {
    this.allHexCells.forEach(cell => {
      cell.isBlinking = false;
      cell.blinkColor = undefined;
      cell.blinkPhase = 0;
    });
  }

  private clearPulses(): void {
    this.allHexCells.forEach(cell => {
      cell.isPulsing = false;
      cell.pulseColor = undefined;
      cell.pulsePhase = 0;
    });
  }

  private clearPointers(): void {
    this.gamePointers = [];
  }

  private clearTokens(): void {
    this.gamePieces = [];
    this.tokenRegistry.clear();
  }

  private clearCaptions(): void {
    this.gameCaptions = [];
  }

  private clearDice(): void {
    this.gameDice = [];
  }

  public token(q: number, r: number, tokenName: string, shape: 'rect' | 'circle' | 'triangle' | 'star', colour: string, label?: string): void {
    // Ensure coordinate is visible by expanding viewport if needed
    const expanded = this.ensureCoordinatesVisible([{q, r}]);
    
    const resolvedColor = this.resolveColor(colour);
    const targetCell = this.allHexCells.get(`hex-${q}-${r}`);
    if (!targetCell) return;

    // Remove existing token with same name if it exists
    if (this.tokenRegistry.has(tokenName)) {
      const existingToken = this.tokenRegistry.get(tokenName);
      const index = this.gamePieces.findIndex(p => p.id === existingToken!.id);
      if (index !== -1) {
        this.gamePieces.splice(index, 1);
      }
    }

    const newToken: GamePiece = {
      id: `token-${Date.now()}-${Math.random()}`,
      tokenName,
      x: targetCell.x,
      y: targetCell.y,
      color: resolvedColor,
      size: 12,
      shape,
      currentHex: { q, r },
      label
    };

    this.gamePieces.push(newToken);
    this.tokenRegistry.set(tokenName, newToken);
    
    // Re-render if viewport was expanded
    if (expanded) {
      this.render();
    }
  }

  public async move(tokenName: string, q: number, r: number): Promise<void> {
    const token = this.tokenRegistry.get(tokenName);
    if (!token || this.isAnimating) return;

    // Ensure target coordinate is visible by expanding viewport if needed
    const expanded = this.ensureCoordinatesVisible([{q, r}]);
    if (expanded) {
      this.render();
    }

    const targetCell = this.allHexCells.get(`hex-${q}-${r}`);
    if (!targetCell) return;

    this.isAnimating = true;

    // Store original highlight state
    const originalHighlighted = targetCell.highlighted;
    const originalHighlightColor = targetCell.highlightColor;

    // Highlight target hex (temporarily for movement indication)
    targetCell.highlighted = true;
    targetCell.highlightColor = '#4fc3f7';

    // Animate token movement
    await new Promise<void>((resolve) => {
      const startX = token.x;
      const startY = token.y;
      const duration = 1000; // 1 second
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth movement
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        token.x = startX + (targetCell.x - startX) * easeProgress;
        token.y = startY + (targetCell.y - startY) * easeProgress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          token.currentHex = { q, r };
          // Restore original highlight state
          targetCell.highlighted = originalHighlighted;
          targetCell.highlightColor = originalHighlightColor;
          this.isAnimating = false;
          resolve();
        }
      };
      
      animate();
    });
  }

  public resetBoard(): void {
    this.allHexCells.forEach(cell => {
      cell.highlighted = false;
      cell.isBlinking = false;
      cell.isPulsing = false;
      cell.highlightColor = undefined;
      cell.blinkColor = undefined;
      cell.pulseColor = undefined;
    });
    
    // Clear all tokens, pointers, captions, and dice
    this.gamePieces = [];
    this.gamePointers = [];
    this.gameCaptions = [];
    this.gameDice = [];
    this.tokenRegistry.clear();
    
    this.render();
  }

  public setGridSize(gridRadius: number): void {
    this.gridRadius = gridRadius;
    this.render(); // Only re-render, no data rebuild needed
  }

  public setGridSizeWithScaling(gridRadius: number): void {
    this.gridRadius = gridRadius;
    this.hexRadius = this.calculateOptimalHexSize(gridRadius);
    this.updateHexPixelPositions(); // Update positions for new hex size
    this.render(); // Re-render with new viewport and positions
  }

  private calculateOptimalHexSize(gridRadius: number): number {
    // Calculate the optimal hex size to fill most of the available space
    // Hex grid width = gridRadius * 3 * hexRadius
    // Hex grid height = gridRadius * 2 * sqrt(3) * hexRadius
    // We want to use most of the available canvas while leaving some margin
    
    const margin = 60; // Margin from edges
    const availableWidth = this.width - 2 * margin;
    const availableHeight = this.height - 2 * margin;
    
    // Calculate hex size based on width constraint
    const hexSizeFromWidth = availableWidth / (gridRadius * 3);
    
    // Calculate hex size based on height constraint
    const hexSizeFromHeight = availableHeight / (gridRadius * 2 * Math.sqrt(3));
    
    // Use the smaller of the two to ensure it fits in both dimensions
    const optimalSize = Math.min(hexSizeFromWidth, hexSizeFromHeight);
    
    // Clamp between reasonable bounds
    return Math.max(8, Math.min(40, optimalSize));
  }

  public setHexSize(hexRadius: number): void {
    this.hexRadius = hexRadius;
    this.initializeBoard();
    this.render();
  }

  public configure(config: GridConfig): void {
    if (config.gridRadius !== undefined) this.gridRadius = config.gridRadius;
    if (config.hexRadius !== undefined) this.hexRadius = config.hexRadius;
    if (config.width !== undefined) {
      this.width = config.width;
      this.svg.attr('width', this.width);
    }
    if (config.height !== undefined) {
      this.height = config.height;
      this.svg.attr('height', this.height);
    }
    
    this.initializeBoard();
    this.render();
  }

  public getGridConfig(): GridConfig {
    return {
      gridRadius: this.gridRadius,
      hexRadius: this.hexRadius,
      width: this.width,
      height: this.height
    };
  }

  public setGridExpansionCallback(callback?: (oldRadius: number, newRadius: number, coordinates: Array<{q: number, r: number}>) => void): void {
    this.onGridExpansion = callback;
  }
}