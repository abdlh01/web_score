import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

const Background: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createParticles = () => {
      const particles: Particle[] = [];
      const numParticles = Math.min(window.innerWidth, window.innerHeight) / 15;
      
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.1
        });
      }
      
      particlesRef.current = particles;
    };

    const updateParticles = () => {
      if (!container) return;
      
      // Clear existing particles
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      // Update and render particles
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around screen edges
        if (particle.x < 0) particle.x = window.innerWidth;
        if (particle.x > window.innerWidth) particle.x = 0;
        if (particle.y < 0) particle.y = window.innerHeight;
        if (particle.y > window.innerHeight) particle.y = 0;
        
        // Create particle element
        const particleElement = document.createElement('div');
        particleElement.className = 'particle';
        particleElement.style.width = `${particle.size}px`;
        particleElement.style.height = `${particle.size}px`;
        particleElement.style.left = `${particle.x}px`;
        particleElement.style.top = `${particle.y}px`;
        particleElement.style.opacity = particle.opacity.toString();
        
        container.appendChild(particleElement);
      });
      
      // Continue animation loop
      requestRef.current = requestAnimationFrame(updateParticles);
    };

    const handleResize = () => {
      createParticles();
    };

    createParticles();
    requestRef.current = requestAnimationFrame(updateParticles);
    window.addEventListener('resize', handleResize);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <div 
        className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-950 to-indigo-950" 
      />
      <div 
        ref={containerRef} 
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      />
      <motion.div 
        className="fixed inset-0 -z-10 bg-blue-500/5"
        animate={{ 
          background: [
            'radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 70%)',
            'radial-gradient(circle at 70% 60%, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 70%)',
            'radial-gradient(circle at 50% 40%, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 70%)',
            'radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0) 70%)'
          ] 
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          ease: "linear" 
        }}
      />
    </>
  );
};

export default Background;