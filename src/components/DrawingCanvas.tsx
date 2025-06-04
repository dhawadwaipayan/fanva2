
import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, Type, Eraser, Pencil, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface DrawingCanvasProps {
  className?: string;
  onImageChange?: (image: string | null) => void;
  activeDrawingTool: 'draw' | 'erase' | 'text';
  onToolChange: (tool: 'draw' | 'erase' | 'text') => void;
  generatedImage?: string | null;
}

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  isEditing: boolean;
}

interface HistoryState {
  canvasData: string;
  textElements: TextElement[];
}

export const DrawingCanvas = ({ 
  className, 
  onImageChange, 
  activeDrawingTool,
  onToolChange,
  generatedImage
}: DrawingCanvasProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update canvas state and notify parent whenever canvas changes
  const updateCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get the complete canvas as image data (including annotations)
    const canvasImageData = canvas.toDataURL();
    onImageChange?.(canvasImageData);
  }, [onImageChange]);

  // Update the displayed image when a new one is generated
  useEffect(() => {
    if (generatedImage) {
      setUploadedImage(generatedImage);
      
      // Create image element for canvas drawing
      const img = new Image();
      img.onload = () => {
        backgroundImageRef.current = img;
        redrawCanvas();
        // Save state after image update
        setTimeout(() => {
          saveToHistory();
          updateCanvasState();
        }, 100);
      };
      img.src = generatedImage;
    }
  }, [generatedImage, updateCanvasState]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasData = canvas.toDataURL();
    const newState: HistoryState = {
      canvasData,
      textElements: [...textElements]
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    if (newHistory.length > 20) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }
    
    setHistory(newHistory);
  }, [history, historyIndex, textElements]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevState = history[prevIndex];
      
      if (prevState) {
        setHistoryIndex(prevIndex);
        setTextElements(prevState.textElements);
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            updateCanvasState();
          };
          img.src = prevState.canvasData;
        }
        
        toast({
          title: "Undo",
          description: "Last action has been undone"
        });
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      
      if (nextState) {
        setHistoryIndex(nextIndex);
        setTextElements(nextState.textElements);
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            updateCanvasState();
          };
          img.src = nextState.canvasData;
        }
        
        toast({
          title: "Redo",
          description: "Action has been redone"
        });
      }
    }
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image if exists
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    redrawCanvas();
    
    if (history.length === 0) {
      setTimeout(() => {
        const canvasData = canvas.toDataURL();
        const initialState: HistoryState = {
          canvasData,
          textElements: []
        };
        setHistory([initialState]);
        setHistoryIndex(0);
        updateCanvasState();
      }, 100);
    }
  }, [uploadedImage, redrawCanvas, updateCanvasState]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          setUploadedImage(imageData);
          
          // Create image element for canvas drawing
          const img = new Image();
          img.onload = () => {
            backgroundImageRef.current = img;
            redrawCanvas();
            // Save state after image upload
            setTimeout(() => {
              saveToHistory();
              updateCanvasState();
            }, 100);
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
    setUploadedImage(null);
    backgroundImageRef.current = null;
    setTextElements([]);
    onImageChange?.(null);
    redrawCanvas();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Image removed",
      description: "The sketch has been removed from the canvas",
    });
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeDrawingTool === 'text') {
      const pos = getMousePos(e);
      
      // Create new text element
      const newTextId = Date.now().toString();
      const newText: TextElement = {
        id: newTextId,
        text: 'New Text',
        x: pos.x,
        y: pos.y,
        isEditing: true
      };
      
      // Stop editing any existing text and add new one
      setTextElements(prev => [
        ...prev.map(text => ({ ...text, isEditing: false })),
        newText
      ]);
      
      return;
    }

    if (activeDrawingTool === 'draw' || activeDrawingTool === 'erase') {
      setIsDrawing(true);
      draw(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && (activeDrawingTool === 'draw' || activeDrawingTool === 'erase')) {
      draw(e);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setTimeout(() => {
        saveToHistory();
        updateCanvasState();
      }, 50);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);
    
    ctx.lineWidth = activeDrawingTool === 'erase' ? 20 : 2;
    ctx.lineCap = 'round';
    
    if (activeDrawingTool === 'draw') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#000000';
    } else if (activeDrawingTool === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
    }

    if (!isDrawing) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const handleTextChange = (textId: string, newText: string) => {
    setTextElements(prev => prev.map(text => 
      text.id === textId ? { ...text, text: newText } : text
    ));
  };

  const handleTextFinishEditing = (textId: string) => {
    setTextElements(prev => prev.map(text => 
      text.id === textId ? { ...text, isEditing: false } : text
    ));
    setTimeout(() => {
      saveToHistory();
      updateCanvasState();
    }, 50);
  };

  const handleTextDoubleClick = (textId: string) => {
    setTextElements(prev => prev.map(text => 
      text.id === textId ? { ...text, isEditing: true } : { ...text, isEditing: false }
    ));
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Tools Bar */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="bg-gray-600 text-gray-200 disabled:opacity-50"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          className="bg-gray-600 text-gray-200 disabled:opacity-50"
        >
          <Redo className="w-4 h-4" />
        </Button>
        <Button
          variant={activeDrawingTool === 'draw' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onToolChange('draw')}
          className={activeDrawingTool === 'draw' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-200'}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant={activeDrawingTool === 'erase' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onToolChange('erase')}
          className={activeDrawingTool === 'erase' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-200'}
        >
          <Eraser className="w-4 h-4" />
        </Button>
        <Button
          variant={activeDrawingTool === 'text' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onToolChange('text')}
          className={activeDrawingTool === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-200'}
        >
          <Type className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas Container */}
      <Card className={`bg-gray-800 border-gray-700 flex items-center justify-center relative overflow-hidden flex-1 ${className}`}>
        {/* Background gradient and grid pattern */}
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

        {/* Content */}
        <div 
          ref={containerRef} 
          className="relative z-10 w-full h-full flex items-center justify-center p-8"
        >
          {uploadedImage ? (
            <div className="relative w-full h-full">
              <canvas
                ref={canvasRef}
                className={`w-full h-full object-contain rounded-lg shadow-2xl bg-white ${
                  activeDrawingTool === 'text' ? 'cursor-crosshair' : 
                  activeDrawingTool === 'erase' ? 'cursor-cell' : 'cursor-crosshair'
                }`}
                onMouseDown={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              
              {/* Text elements overlay */}
              {textElements.map((textElement) => (
                <div
                  key={textElement.id}
                  className="absolute"
                  style={{
                    left: textElement.x,
                    top: textElement.y,
                    transform: 'translate(-50%, -50%)',
                    minWidth: '100px'
                  }}
                  onDoubleClick={() => handleTextDoubleClick(textElement.id)}
                >
                  {textElement.isEditing ? (
                    <input
                      type="text"
                      value={textElement.text}
                      onChange={(e) => handleTextChange(textElement.id, e.target.value)}
                      onBlur={() => handleTextFinishEditing(textElement.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTextFinishEditing(textElement.id);
                        }
                      }}
                      className="bg-white border-2 border-blue-500 outline-none text-black font-bold text-lg px-2 py-1 rounded text-center min-w-[80px]"
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="bg-white/90 border border-gray-300 text-black font-bold text-lg px-2 py-1 rounded cursor-pointer hover:bg-white transition-all text-center"
                    >
                      {textElement.text}
                    </div>
                  )}
                </div>
              ))}

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
