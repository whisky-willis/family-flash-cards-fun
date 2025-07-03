import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    setPosition(initialPosition);
  }, [initialPosition]);

  const stableOnPositionChange = useCallback(onPositionChange, [onPositionChange]);

  useEffect(() => {
    stableOnPositionChange(position);
  }, [position, stableOnPositionChange]);

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition(prev => ({
      ...prev,
      x: Math.max(-100, Math.min(100, newX)),
      y: Math.max(-100, Math.min(100, newY))
    }));
  }, [isDragging, dragStart]);

  const handleGlobalMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleGlobalMouseMove, handleGlobalMouseUp]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleScaleChange = (delta: number) => {
    setPosition(prev => ({
      ...prev,
      scale: Math.max(0.3, Math.min(3, prev.scale + delta))
    }));
  };

  const handleReset = () => {
    setPosition({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div className="space-y-3">
      <div 
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border-4 border-white shadow-md cursor-move bg-gray-50"
        style={{ 
          height: '180px',
          background: '#f8f9fa'
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          className="w-full h-full pointer-events-none select-none"
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: `${100 * position.scale}%`,
            backgroundPosition: `${50 + (position.x / 3.6)}% ${50 + (position.y / 3.6)}%`,
            backgroundRepeat: 'no-repeat',
            transition: isDragging ? 'none' : 'background-position 0.1s ease-out, background-size 0.1s ease-out'
          }}
        />
        {isDragging && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <Move className="h-8 w-8 text-white" />
          </div>
        )}
        {!isDragging && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            Drag to reposition
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
