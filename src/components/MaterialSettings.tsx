
import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface MaterialSettingsProps {
  onMaterialChange?: (material: string | null) => void;
}

export const MaterialSettings = ({ onMaterialChange }: MaterialSettingsProps) => {
  const [uploadedMaterial, setUploadedMaterial] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMaterialUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          setUploadedMaterial(imageData);
          onMaterialChange?.(imageData);
          toast({
            title: "Material uploaded",
            description: "Your material texture has been added",
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

  const handleRemoveMaterial = () => {
    setUploadedMaterial(null);
    onMaterialChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Material removed",
      description: "The material texture has been removed",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Material Upload</h3>
        <Card className="bg-gray-800 border-gray-600 p-4">
          {uploadedMaterial ? (
            <div className="relative">
              <img 
                src={uploadedMaterial} 
                alt="Material texture" 
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveMaterial}
                className="absolute top-2 right-2 w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div 
              className="bg-gray-700 h-32 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-500 hover:border-gray-400 transition-colors"
              onClick={handleUploadClick}
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-400 text-sm">Upload Material Texture</span>
            </div>
          )}
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Material Presets</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Cotton', color: '#F5F5DC' },
            { name: 'Denim', color: '#4682B4' },
            { name: 'Silk', color: '#DDA0DD' },
            { name: 'Leather', color: '#8B4513' },
            { name: 'Wool', color: '#696969' },
            { name: 'Linen', color: '#FAF0E6' }
          ].map((material) => (
            <Button
              key={material.name}
              variant="outline"
              className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 h-12"
              onClick={() => {
                toast({
                  title: "Material selected",
                  description: `${material.name} material applied`,
                });
              }}
            >
              <div 
                className="w-4 h-4 rounded mr-2 border border-gray-500"
                style={{ backgroundColor: material.color }}
              />
              {material.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleMaterialUpload}
        className="hidden"
      />
    </div>
  );
};
