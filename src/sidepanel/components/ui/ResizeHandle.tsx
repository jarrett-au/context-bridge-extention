import React, { useCallback, useEffect, useState, useRef } from 'react';

interface ResizeHandleProps {
  onResize: (deltaY: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  className?: string;
}

export function ResizeHandle({ onResize, onResizeStart, onResizeEnd, className = '' }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.clientY;
    onResizeStart?.();
    
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [onResizeStart]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame for smoother updates if needed, 
      // but React state updates are usually fast enough for simple layouts.
      // Passing total delta from start
      onResize(e.clientY - startY.current);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onResizeEnd?.();
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onResize, onResizeEnd]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`h-2 w-full cursor-row-resize hover:bg-blue-200 transition-colors z-10 flex items-center justify-center group ${className}`}
    >
        <div className="h-1 w-8 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors"></div>
    </div>
  );
}
