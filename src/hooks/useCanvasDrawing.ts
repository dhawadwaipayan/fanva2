
import { useState, useCallback, useRef } from 'react';
import { DrawingTool } from '@/types/drawing';

export const useCanvasDrawing = (activeDrawingTool: DrawingTool) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const redrawCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (backgroundImageRef.current) {
      const img = backgroundImageRef.current;
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;
      
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    }
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    if (activeDrawingTool === 'draw' || activeDrawingTool === 'erase') {
      setIsDrawing(true);
      draw(e, canvas, false);
    }
  }, [activeDrawingTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    if (isDrawing && (activeDrawingTool === 'draw' || activeDrawingTool === 'erase')) {
      draw(e, canvas, true);
    }
  }, [isDrawing, activeDrawingTool]);

  const handleMouseUp = useCallback((saveToHistory: () => void) => {
    if (isDrawing) {
      setIsDrawing(false);
      setTimeout(() => saveToHistory(), 50);
    }
  }, [isDrawing]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement, continuing: boolean) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e, canvas);
    
    ctx.lineWidth = activeDrawingTool === 'erase' ? 20 : 2;
    ctx.lineCap = 'round';
    
    if (activeDrawingTool === 'draw') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#000000';
    } else if (activeDrawingTool === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
    }

    if (!continuing) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }, [activeDrawingTool, getMousePos]);

  return {
    isDrawing,
    backgroundImageRef,
    redrawCanvas,
    handleCanvasMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};
