import * as d3 from 'd3';

interface HexCell {
  q: number; // axial coordinate
  r: number; // axial coordinate
  x: number; // screen x position
  y: number; // screen y position
  id: string;
  highlighted: boolean;
}

interface GamePiece {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  currentHex: { q: number; r: number };
}

class BoardcastHexBoard {
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  private hexCells: HexCell[] = [];
  private gamePieces: GamePiece[] = [];
  private width: number = 1000;
  private height: number = 700;
  private hexRadius: number = 25;
  private coordinatesVisible: boolean = false;
  private isAnimating: boolean = false;

  constructor() {
    this.svg = d3.select('#chart');
    this.initializeBoard();
    this.setupEventListeners();
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
            highlighted: false
          });
        }
      }
    }

    // Create a game piece
    const startHex = this.hexCells.find(cell => cell.q === 0 && cell.r === 0);
    if (startHex) {
      this.gamePieces.push({
        id: 'piece-1',
        x: startHex.x,
        y: startHex.y,
        color: '#ff4444',
        size: 12,
        currentHex: { q: 0, r: 0 }
      });
    }
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
      .attr('fill', d => d.highlighted ? '#4fc3f7' : '#2a2a2a')
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
        .attr('y', d => d.y - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .text(d => `${d.q},${d.r}`);

      this.svg.selectAll<SVGTextElement, HexCell>('text.coordinate-s')
        .data(this.hexCells, d => d.id)
        .enter()
        .append('text')
        .attr('class', 'coordinate-s')
        .attr('x', d => d.x)
        .attr('y', d => d.y + 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#aaa')
        .attr('font-size', '8px')
        .attr('font-family', 'monospace')
        .text(d => `s:${-d.q - d.r}`);
    }

    // Render game pieces
    const pieces = this.svg.selectAll<SVGCircleElement, GamePiece>('circle.piece')
      .data(this.gamePieces, d => d.id);

    pieces.enter()
      .append('circle')
      .attr('class', 'piece')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);
  }

  public showCoordinates(): void {
    this.coordinatesVisible = true;
    this.render();
  }

  public hideCoordinates(): void {
    this.coordinatesVisible = false;
    this.render();
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
    this.hexCells.forEach(cell => cell.highlighted = false);
    
    // Reset piece to center
    const piece = this.gamePieces[0];
    const centerHex = this.hexCells.find(cell => cell.q === 0 && cell.r === 0);
    if (piece && centerHex) {
      piece.x = centerHex.x;
      piece.y = centerHex.y;
      piece.currentHex = { q: 0, r: 0 };
    }
    
    this.render();
  }

  private setupEventListeners(): void {
    const showCoordBtn = document.getElementById('show-coordinates');
    const hideCoordBtn = document.getElementById('hide-coordinates');
    const startMovementBtn = document.getElementById('start-movement');
    const resetBtn = document.getElementById('reset-board');

    showCoordBtn?.addEventListener('click', () => this.showCoordinates());
    hideCoordBtn?.addEventListener('click', () => this.hideCoordinates());
    startMovementBtn?.addEventListener('click', () => {
      // Demo movement: move to three different hexes
      this.movePiece('piece-1', [
        { q: 2, r: -1 },  // Move to hex (2, -1)
        { q: -1, r: 2 },  // Move to hex (-1, 2)
        { q: 0, r: 0 }    // Return to center
      ]);
    });
    resetBtn?.addEventListener('click', () => this.resetBoard());
  }
}

// Initialize the boardcast library when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BoardcastHexBoard();
  console.log('Boardcast hex board library initialized!');
});