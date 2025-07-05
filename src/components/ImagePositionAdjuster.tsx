import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  const stableOnPositionChange = useCallback(onPositionChange, [onPositionChange]);

  useEffect(() => {
    stableOnPositionChange(position);
  }, [position, stableOnPositionChange]);

  const handlePositionChange = (deltaX: number, deltaY: number) => {
    setPosition(prev => {
      // Scale-aware bounds - higher zoom levels get more movement range
      const maxBound = Math.min(150, 100 * prev.scale);
      const moveStep = 10; // pixels to move per click
      
      return {
        ...prev,
        x: Math.max(-maxBound, Math.min(maxBound, prev.x + (deltaX * moveStep))),
        y: Math.max(-maxBound, Math.min(maxBound, prev.y + (deltaY * moveStep)))
      };
    });
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
        className="relative overflow-hidden rounded-lg border-4 border-white shadow-md bg-gray-50"
        style={{ 
          height: '286px',
          background: '#f8f9fa'
        }}
      >
        <div
          className="w-full h-full pointer-events-none select-none"
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: `${100 * position.scale}%`,
            backgroundPosition: `${50 + (position.x / (3.6 * position.scale))}% ${50 + (position.y / (3.6 * position.scale))}%`,
            backgroundRepeat: 'no-repeat',
            transition: 'background-position 0.1s ease-out, background-size 0.1s ease-out'
          }}
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Use arrows to reposition
        </div>
      </div>
      
      {/* Arrow Controls */}
      <div className="flex items-center justify-center">
        <div className="grid grid-cols-3 gap-1">
          <div></div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handlePositionChange(0, -1)}
            className="h-8 w-8 p-0"
            title="Move up"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <div></div>
          
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handlePositionChange(-1, 0)}
            className="h-8 w-8 p-0"
            title="Move left"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="h-8 w-8 p-0"
            title="Reset position"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handlePositionChange(1, 0)}
            className="h-8 w-8 p-0"
            title="Move right"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <div></div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handlePositionChange(0, 1)}
            className="h-8 w-8 p-0"
            title="Move down"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <div></div>
        </div>
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
      </div>
    </div>
  );
};
