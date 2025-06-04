
import { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface SketchCanvasProps {
  className?: string;
  onImageChange?: (image: string | null) => void;
  onImageRemove?: () => void;
  generatedImage?: string | null;
  uploadedImage?: string | null;
  zoom?: number;
  isPanning?: boolean;
}

export const SketchCanvas = ({ 
  className, 
  onImageChange, 
  onImageRemove,
  generatedImage,
  uploadedImage: externalUploadedImage,
  zoom = 1,
  isPanning = false 
}: SketchCanvasProps) => {
  const [internalUploadedImage, setInternalUploadedImage] = useState<string | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use external uploaded image if provided, otherwise use internal state
  const displayedImage = externalUploadedImage || internalUploadedImage;

  // Update the displayed image when a new one is generated
  useEffect(() => {
    if (generatedImage) {
      setInternalUploadedImage(generatedImage);
      onImageChange?.(generatedImage);
    }
  }, [generatedImage, onImageChange]);

  // Update internal state when external image changes
  useEffect(() => {
    if (externalUploadedImage !== undefined) {
      setInternalUploadedImage(externalUploadedImage);
    }
  }, [externalUploadedImage]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          setInternalUploadedImage(imageData);
          onImageChange?.(imageData);
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
    if (!isPanning) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = () => {
    setInternalUploadedImage(null);
    onImageChange?.(null);
    onImageRemove?.();
    setPanOffset({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Image removed",
      description: "The sketch has been removed from the canvas",
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanning && displayedImage) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isPanning) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <Card 
      ref={containerRef}
      className={`bg-gray-800 border-gray-700 flex items-center justify-center relative overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isPanning && displayedImage ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800"></div>
      
      {/* Grid pattern overlay */}
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
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
        {displayedImage ? (
          <div className="relative max-w-full max-h-full">
            <div
              style={{
                transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.2s ease'
              }}
            >
              <img 
                src={displayedImage} 
                alt="Uploaded sketch" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                draggable={false}
              />
            </div>
            {!isPanning && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </Card>
  );
};
