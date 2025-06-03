
import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface SketchCanvasProps {
  className?: string;
}

export const SketchCanvas = ({ className }: SketchCanvasProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Image removed",
      description: "The sketch has been removed from the canvas",
    });
  };

  return (
    <Card className={`bg-gray-800 border-gray-700 flex items-center justify-center relative overflow-hidden ${className}`}>
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
        {uploadedImage ? (
          <div className="relative max-w-full max-h-full">
            <img 
              src={uploadedImage} 
              alt="Uploaded sketch" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
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
