
import { useRef, useEffect, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useDrawingHistory } from '@/hooks/useDrawingHistory';
import { useTextElements } from '@/hooks/useTextElements';
import { useCanvasDrawing } from '@/hooks/useCanvasDrawing';
import { DrawingToolbar } from '@/components/DrawingToolbar';
import { TextOverlay } from '@/components/TextOverlay';
import { DrawingTool } from '@/types/drawing';

interface DrawingCanvasProps {
  className?: string;
  onImageChange?: (image: string | null) => void;
  activeDrawingTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
}

export const DrawingCanvas = ({ 
  className, 
  onImageChange, 
  activeDrawingTool,
  onToolChange
}: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { 
    history, 
    historyIndex, 
    saveToHistory, 
    handleUndo, 
    handleRedo, 
    initializeHistory 
  } = useDrawingHistory();

  const {
    textElements,
    setTextElements,
    addTextElement,
    handleTextChange,
    handleTextFinishEditing,
    handleTextMouseDown,
    handleTextMouseMove,
    handleTextMouseUp,
    handleTextDoubleClick
  } = useTextElements();

  const {
    backgroundImageRef,
    redrawCanvas,
    handleCanvasMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useCanvasDrawing(activeDrawingTool);

  const wrappedSaveToHistory = useCallback(() => {
    saveToHistory(canvasRef, textElements);
  }, [saveToHistory, textElements]);

  const wrappedHandleUndo = useCallback(() => {
    handleUndo(canvasRef, setTextElements);
  }, [handleUndo, setTextElements]);

  const wrappedHandleRedo = useCallback(() => {
    handleRedo(canvasRef, setTextElements);
  }, [handleRedo, setTextElements]);

  const wrappedHandleTextFinishEditing = useCallback((textId: string) => {
    handleTextFinishEditing(textId, wrappedSaveToHistory);
  }, [handleTextFinishEditing, wrappedSaveToHistory]);

  const wrappedHandleTextMouseUp = useCallback(() => {
    handleTextMouseUp(wrappedSaveToHistory);
  }, [handleTextMouseUp, wrappedSaveToHistory]);

  const wrappedHandleMouseUp = useCallback(() => {
    handleMouseUp(wrappedSaveToHistory);
  }, [handleMouseUp, wrappedSaveToHistory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    redrawCanvas(canvas);
    
    initializeHistory(canvasRef);
  }, [redrawCanvas, initializeHistory]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          onImageChange?.(imageData);
          
          const img = new Image();
          img.onload = () => {
            backgroundImageRef.current = img;
            if (canvasRef.current) {
              redrawCanvas(canvasRef.current);
              setTimeout(() => wrappedSaveToHistory(), 100);
            }
          };
          img.src = imageData;
          
          toast({
            title: "Image uploaded",
            description: "Your flat sketch has been added to the canvas",
          });
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    backgroundImageRef.current = null;
    setTextElements([]);
    onImageChange?.(null);
    if (canvasRef.current) {
      redrawCanvas(canvasRef.current);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Image removed",
      description: "The sketch has been removed from the canvas",
    });
  };

  const getContainerPos = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    
    const rect = container.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (activeDrawingTool === 'text' && e.target === containerRef.current) {
      const pos = getContainerPos(e);
      addTextElement(pos.x, pos.y);
    }
  };

  const handleTextMouseMoveWrapper = (e: React.MouseEvent) => {
    const containerPos = getContainerPos(e);
    handleTextMouseMove(containerPos);
  };

  const handleCanvasMouseDownWrapper = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      handleCanvasMouseDown(e, canvas);
    }
  };

  const handleMouseMoveWrapper = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      handleMouseMove(e, canvas);
    }
  };

  const hasUploadedImage = backgroundImageRef.current !== null;

  return (
    <div className="flex flex-col gap-4 h-full">
      <DrawingToolbar
        activeDrawingTool={activeDrawingTool}
        onToolChange={onToolChange}
        onUndo={wrappedHandleUndo}
        onRedo={wrappedHandleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      <Card className={`bg-gray-800 border-gray-700 flex items-center justify-center relative overflow-hidden flex-1 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800"></div>
        
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        <div 
          ref={containerRef} 
          className="relative z-10 w-full h-full flex items-center justify-center p-8"
          onClick={handleContainerClick}
          onMouseMove={handleTextMouseMoveWrapper}
          onMouseUp={wrappedHandleTextMouseUp}
        >
          {hasUploadedImage ? (
            <div className="relative w-full h-full">
              <canvas
                ref={canvasRef}
                className={`w-full h-full object-contain rounded-lg shadow-2xl bg-white ${
                  activeDrawingTool === 'text' ? 'cursor-crosshair' : 
                  activeDrawingTool === 'erase' ? 'cursor-cell' : 'cursor-crosshair'
                }`}
                onMouseDown={handleCanvasMouseDownWrapper}
                onMouseMove={handleMouseMoveWrapper}
                onMouseUp={wrappedHandleMouseUp}
                onMouseLeave={wrappedHandleMouseUp}
              />
              
              <TextOverlay
                textElements={textElements}
                onTextChange={handleTextChange}
                onTextFinishEditing={wrappedHandleTextFinishEditing}
                onTextMouseDown={handleTextMouseDown}
                onTextDoubleClick={handleTextDoubleClick}
              />

              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div 
              className="bg-gray-300 w-64 h-64 rounded-lg flex flex-col items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300 cursor-pointer border-2 border-dashed border-gray-400"
              onClick={handleUploadClick}
            >
              <Upload className="w-12 h-12 text-gray-600 mb-4" />
              <span className="text-gray-600 font-semibold text-lg mb-2">Upload Flat Sketch</span>
              <span className="text-gray-500 text-sm text-center px-4">
                Click to upload an image of your flat sketch
              </span>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </Card>
    </div>
  );
};
