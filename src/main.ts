import * as d3 from 'd3';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  id: number;
}

class ParticleAnimation {
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private width: number = 800;
  private height: number = 600;
  private isRunning: boolean = false;

  constructor() {
    this.svg = d3.select('#chart');
    this.initializeParticles();
    this.setupEventListeners();
  }

  private initializeParticles(): void {
    const particleCount = 50;
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: Math.random() * 8 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        id: i
      });
    }
  }

  private updateParticles(): void {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off walls
      if (particle.x <= particle.radius || particle.x >= this.width - particle.radius) {
        particle.vx *= -0.8;
        particle.x = Math.max(particle.radius, Math.min(this.width - particle.radius, particle.x));
      }
      if (particle.y <= particle.radius || particle.y >= this.height - particle.radius) {
        particle.vy *= -0.8;
        particle.y = Math.max(particle.radius, Math.min(this.height - particle.radius, particle.y));
      }

      // Add gravity effect
      particle.vy += 0.1;

      // Add air resistance
      particle.vx *= 0.999;
      particle.vy *= 0.999;
    });
  }

  private render(): void {
    const circles = this.svg.selectAll<SVGCircleElement, Particle>('circle')
      .data(this.particles, d => d.id.toString());

    // Enter new circles
    circles.enter()
      .append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .merge(circles)
      .transition()
      .duration(16)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    circles.exit().remove();
  }

  private animate = (): void => {
    if (!this.isRunning) return;

    this.updateParticles();
    this.render();
    this.animationId = requestAnimationFrame(this.animate);
  };

  public start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public reset(): void {
    this.stop();
    this.svg.selectAll('circle').remove();
    this.particles = [];
    this.initializeParticles();
  }

  private setupEventListeners(): void {
    const startBtn = document.getElementById('start-animation');
    const stopBtn = document.getElementById('stop-animation');
    const resetBtn = document.getElementById('reset-animation');

    startBtn?.addEventListener('click', () => this.start());
    stopBtn?.addEventListener('click', () => this.stop());
    resetBtn?.addEventListener('click', () => this.reset());

    // Add mouse interaction
    this.svg.on('mousemove', (event) => {
      const [mouseX, mouseY] = d3.pointer(event);
      
      this.particles.forEach(particle => {
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100 * 0.5;
          particle.vx += dx / distance * force;
          particle.vy += dy / distance * force;
        }
      });
    });
  }
}

// Initialize the animation when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const animation = new ParticleAnimation();
  console.log('Boardcast animation initialized!');
});