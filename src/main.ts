import * as d3 from 'd3';

interface HexCell {
  q: number; // axial coordinate
  r: number; // axial coordinate
  x: number; // screen x position
  y: number; // screen y position
  id: string;
  highlighted: boolean;
  highlightColor?: string;
  isBlinking: boolean;
  blinkColor?: string;
  blinkPhase: number;
  isPulsing: boolean;
  pulseColor?: string;
  pulsePhase: number;
  originalColor: string;
}

interface GamePiece {
  id: string;
  tokenName?: string;
  x: number;
  y: number;
  color: string;
  size: number;
  shape: 'circle' | 'rect' | 'triangle' | 'star';
  currentHex: { q: number; r: number };
  label?: string;
}

class BoardcastHexBoard {
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  private hexCells: HexCell[] = [];
  private gamePieces: GamePiece[] = [];
  private tokenRegistry: Map<string, GamePiece> = new Map();
  private width: number = 1000;
  private height: number = 700;
  private hexRadius: number = 25;
  private coordinatesVisible: boolean = false;
  private isAnimating: boolean = false;
  private time: number = 0;

  constructor() {
    this.svg = d3.select('#chart');
    this.initializeBoard();
    this.setupEventListeners();
    this.startAnimationLoop();
    this.render();
  }

  private axialToPixel(q: number, r: number): { x: number; y: number } {
    const size = this.hexRadius;
    const x = size * (3/2 * q);
    const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
    return { x: x + this.width/2, y: y + this.height/2 };
  }

  private initializeBoard(): void {
    const gridRadius = 8; // Smaller board for tabletop games
    
    for (let q = -gridRadius; q <= gridRadius; q++) {
      const r1 = Math.max(-gridRadius, -q - gridRadius);
      const r2 = Math.min(gridRadius, -q + gridRadius);
      
      for (let r = r1; r <= r2; r++) {
        const pixel = this.axialToPixel(q, r);
        
        // Only include hexagons that fit within the viewport
        if (pixel.x >= 50 && pixel.x <= this.width - 50 && 
            pixel.y >= 50 && pixel.y <= this.height - 50) {
          
          this.hexCells.push({
            q,
            r,
            x: pixel.x,
            y: pixel.y,
            id: `hex-${q}-${r}`,
            highlighted: false,
            isBlinking: false,
            blinkPhase: 0,
            isPulsing: false,
            pulsePhase: 0,
            originalColor: '#2a2a2a'
          });
        }
      }
    }

    // Remove the default game piece - tokens will be created via API calls
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

  private render(): void {
    // Clear existing content
    this.svg.selectAll('*').remove();

    // Render hexagons
    const hexagons = this.svg.selectAll<SVGPathElement, HexCell>('path.hex')
      .data(this.hexCells, d => d.id);

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
        .data(this.hexCells, d => d.id);

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
      this.hexCells.forEach(cell => {
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
  public highlight(q: number, r: number, colour: string = '#4fc3f7'): void {
    const cell = this.hexCells.find(hex => hex.q === q && hex.r === r);
    if (cell) {
      cell.highlighted = true;
      cell.highlightColor = colour;
      cell.isBlinking = false; // Stop blinking if it was blinking
    }
  }

  public blink(q: number, r: number, colour: string = '#4fc3f7'): void {
    const cell = this.hexCells.find(hex => hex.q === q && hex.r === r);
    if (cell) {
      cell.isBlinking = true;
      cell.blinkColor = colour;
      cell.highlighted = false; // Stop static highlight if it was highlighted
      cell.isPulsing = false; // Stop pulsing if it was pulsing
      cell.blinkPhase = this.time * 3;
    }
  }

  public pulse(q: number, r: number, colour: string = '#4fc3f7'): void {
    const cell = this.hexCells.find(hex => hex.q === q && hex.r === r);
    if (cell) {
      cell.isPulsing = true;
      cell.pulseColor = colour;
      cell.highlighted = false; // Stop static highlight if it was highlighted
      cell.isBlinking = false; // Stop blinking if it was blinking
      cell.pulsePhase = this.time * 0.8; // Slower than blink for gradual transition
    }
  }

  public token(q: number, r: number, tokenName: string, shape: 'rect' | 'circle' | 'triangle' | 'star', colour: string, label?: string): void {
    const targetCell = this.hexCells.find(cell => cell.q === q && cell.r === r);
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
      color: colour,
      size: 12,
      shape,
      currentHex: { q, r },
      label
    };

    this.gamePieces.push(newToken);
    this.tokenRegistry.set(tokenName, newToken);
  }

  public async move(tokenName: string, q: number, r: number): Promise<void> {
    const token = this.tokenRegistry.get(tokenName);
    if (!token || this.isAnimating) return;

    const targetCell = this.hexCells.find(cell => cell.q === q && cell.r === r);
    if (!targetCell) return;

    this.isAnimating = true;

    // Highlight target hex
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
          targetCell.highlighted = false;
          this.isAnimating = false;
          resolve();
        }
      };
      
      animate();
    });
  }

  public async movePiece(pieceId: string, targetHexes: { q: number; r: number }[]): Promise<void> {
    const piece = this.gamePieces.find(p => p.id === pieceId);
    if (!piece || this.isAnimating) return;

    this.isAnimating = true;

    for (const targetHex of targetHexes) {
      const targetCell = this.hexCells.find(cell => cell.q === targetHex.q && cell.r === targetHex.r);
      if (!targetCell) continue;

      // Highlight target hex
      targetCell.highlighted = true;
      this.render();

      // Animate piece movement
      await new Promise<void>((resolve) => {
        const startX = piece.x;
        const startY = piece.y;
        const duration = 1000; // 1 second
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function for smooth movement
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          
          piece.x = startX + (targetCell.x - startX) * easeProgress;
          piece.y = startY + (targetCell.y - startY) * easeProgress;
          
          this.render();
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            piece.currentHex = { q: targetHex.q, r: targetHex.r };
            targetCell.highlighted = false;
            this.render();
            resolve();
          }
        };
        
        animate();
      });

      // Wait a bit before next move
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.isAnimating = false;
  }

  public resetBoard(): void {
    this.hexCells.forEach(cell => {
      cell.highlighted = false;
      cell.isBlinking = false;
      cell.isPulsing = false;
      cell.highlightColor = undefined;
      cell.blinkColor = undefined;
      cell.pulseColor = undefined;
    });
    
    // Clear all tokens
    this.gamePieces = [];
    this.tokenRegistry.clear();
    
    this.render();
  }

  private setupEventListeners(): void {
    const showCoordBtn = document.getElementById('show-coordinates');
    const hideCoordBtn = document.getElementById('hide-coordinates');
    const demoHighlightBtn = document.getElementById('demo-highlight');
    const demoBlinkBtn = document.getElementById('demo-blink');
    const demoPulseBtn = document.getElementById('demo-pulse');
    const demoTokensBtn = document.getElementById('demo-tokens');
    const demoMovementBtn = document.getElementById('demo-movement');
    const resetBtn = document.getElementById('reset-board');

    showCoordBtn?.addEventListener('click', () => this.showCoordinates());
    hideCoordBtn?.addEventListener('click', () => this.hideCoordinates());
    
    demoHighlightBtn?.addEventListener('click', () => {
      this.resetBoard();
      this.highlight(1, 0, '#ff6b6b');
      this.highlight(-1, 1, '#4ecdc4');
      this.highlight(0, -1, '#feca57');
    });

    demoBlinkBtn?.addEventListener('click', () => {
      this.resetBoard();
      this.blink(2, -1, '#ff6b6b');
      this.blink(-2, 1, '#4ecdc4');
      this.blink(1, 1, '#feca57');
    });

    demoPulseBtn?.addEventListener('click', () => {
      this.resetBoard();
      this.pulse(1, -1, '#ff6b6b');
      this.pulse(-1, 0, '#4ecdc4');
      this.pulse(0, 1, '#feca57');
    });

    demoTokensBtn?.addEventListener('click', () => {
      this.resetBoard();
      this.token(0, 0, 'center', 'circle', '#ff4444', 'Player');
      this.token(1, 0, 'right', 'rect', '#44ff44', 'Guard');
      this.token(-1, 1, 'left', 'triangle', '#4444ff', 'Enemy');
      this.token(0, -1, 'top', 'star', '#ffff44', 'Treasure');
    });

    demoMovementBtn?.addEventListener('click', async () => {
      this.resetBoard();
      this.token(0, 0, 'player', 'circle', '#ff4444', 'Hero');
      
      // Demo movement sequence
      await this.move('player', 2, -1);
      await this.move('player', -1, 2);
      await this.move('player', 0, 0);
    });

    resetBtn?.addEventListener('click', () => this.resetBoard());
  }
}

// Initialize the boardcast library when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BoardcastHexBoard();
  console.log('Boardcast hex board library initialized!');
});