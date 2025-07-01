
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Move, RotateCcw } from "lucide-react";

interface ImagePositionAdjusterProps {
  imageSrc: string;
  alt: string;
  onPositionChange: (position: { x: number; y: number; scale: number }) => void;
  initialPosition?: { x: number; y: number; scale: number };
}

export const ImagePositionAdjuster = ({ 
  imageSrc, 
  alt, 
  onPositionChange, 
  initialPosition = { x: 0, y: 0, scale: 1 } 
}: ImagePositionAdjusterProps) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onPositionChange(position);
  }, [position, onPositionChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition(prev => ({
      ...prev,
      x: Math.max(-100, Math.min(100, newX)),
      y: Math.max(-100, Math.min(100, newY))
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (delta: number) => {
    setPosition(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(2, prev.scale + delta))
    }));
  };

  const handleReset = () => {
    setPosition({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div className="space-y-3">
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border-4 border-white shadow-md cursor-move"
        style={{ height: '180px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
          src={imageSrc} 
          alt={alt}
          className="w-full h-full object-cover pointer-events-none select-none"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          draggable={false}
        />
        {isDragging && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <Move className="h-8 w-8 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex space-x-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleScaleChange(-0.1)}
            className="h-7 px-2"
          >
            -
          </Button>
          <span className="px-2 py-1 bg-gray-100 rounded text-center min-w-16">
            {Math.round(position.scale * 100)}%
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleScaleChange(0.1)}
            className="h-7 px-2"
          >
            +
          </Button>
        </div>
        
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="h-7 px-2"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
