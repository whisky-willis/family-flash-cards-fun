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

  const handleGlobalTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    
    console.log('Touch move detected');
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    console.log('New touch position calculated:', newX, newY);
    
    setPosition(prev => {
      // Scale-aware bounds - higher zoom levels get more movement range
      const maxBound = Math.min(150, 100 * prev.scale);
      
      const result = {
        ...prev,
        x: Math.max(-maxBound, Math.min(maxBound, newX)),
        y: Math.max(-maxBound, Math.min(maxBound, newY))
      };
      console.log('Touch position updated:', result);
      return result;
    });
  }, [isDragging, dragStart]);

  const handleGlobalTouchEnd = useCallback(() => {
    console.log('Touch end detected');
    setIsDragging(false);
  }, []);

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    console.log('Mouse move detected', e.clientX, e.clientY);
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    console.log('New position calculated:', newX, newY);
    
    setPosition(prev => {
      // Scale-aware bounds - higher zoom levels get more movement range
      const maxBound = Math.min(150, 100 * prev.scale);
      
      const result = {
        ...prev,
        x: Math.max(-maxBound, Math.min(maxBound, newX)),
        y: Math.max(-maxBound, Math.min(maxBound, newY))
      };
      console.log('Position updated:', result);
      return result;
    });
  }, [isDragging, dragStart]);

  const handleGlobalMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove);
      document.addEventListener('touchend', handleGlobalTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('touchmove', handleGlobalTouchMove);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDragging, handleGlobalMouseMove, handleGlobalMouseUp, handleGlobalTouchMove, handleGlobalTouchEnd]);

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('Mouse down detected', e.clientX, e.clientY);
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    console.log('Drag started, isDragging set to true');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    console.log('Touch start detected');
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
    console.log('Touch drag started, isDragging set to true');
  };

  const handleScaleChange = (delta: number) => {
    setPosition(prev => {
      const newScale = prev.scale + delta;
      const clampedScale = Math.max(0.3, Math.min(3, newScale));
      
      // Adjust position bounds based on scale - higher scales need more movement range
      const maxBound = Math.min(150, 100 * clampedScale);
      
      return {
        ...prev,
        scale: clampedScale,
        // Keep position within scale-appropriate bounds
        x: Math.max(-maxBound, Math.min(maxBound, prev.x)),
        y: Math.max(-maxBound, Math.min(maxBound, prev.y))
      };
    });
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
        onTouchStart={handleTouchStart}
      >
        <div
          className="w-full h-full pointer-events-none select-none"
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: `${100 * position.scale}%`,
            backgroundPosition: `${50 + (position.x / (3.6 * position.scale))}% ${50 + (position.y / (3.6 * position.scale))}%`,
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
            onClick={() => handleScaleChange(-0.2)}
            className="h-7 px-1 text-xs"
            title="Zoom out (large step)"
          >
            --
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleScaleChange(-0.05)}
            className="h-7 px-2"
            title="Zoom out (small step)"
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
            onClick={() => handleScaleChange(0.05)}
            className="h-7 px-2"
            title="Zoom in (small step)"
          >
            +
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleScaleChange(0.2)}
            className="h-7 px-1 text-xs"
            title="Zoom in (large step)"
          >
            ++
          </Button>
        </div>
        
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="h-7 px-2"
          title="Reset position and scale"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
