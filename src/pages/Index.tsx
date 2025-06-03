
import { useState, useRef } from 'react';
import { Undo, Redo, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { SketchCanvas } from '@/components/SketchCanvas';
import { GenerationSettings } from '@/components/GenerationSettings';
import { generateRealisticGarment } from '@/services/imageGeneration';

const Index = () => {
  const [activeMode, setActiveMode] = useState<'sketch' | 'render'>('sketch');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'render' | 'colorways' | 'material'>('render');
  const [materialImage, setMaterialImage] = useState<string | null>(null);
  const [sketchImage, setSketchImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const materialFileInputRef = useRef<HTMLInputElement>(null);

  const handleUndo = () => {
    toast({
      title: "Undo",
      description: "Last action has been undone",
    });
  };

  const handleRedo = () => {
    toast({
      title: "Redo", 
      description: "Action has been redone",
    });
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to generate images",
        variant: "destructive",
      });
      return;
    }

    if (!sketchImage) {
      toast({
        title: "Sketch Required",
        description: "Please upload a flat sketch first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      toast({
        title: "Generation Started",
        description: "AI is creating your realistic garment...",
      });

      const generatedUrl = await generateRealisticGarment({
        flatSketch: sketchImage,
        materialImage: materialImage || undefined,
        apiKey: apiKey
      });

      setGeneratedImage(generatedUrl);
      
      toast({
        title: "Generation Complete!",
        description: "Your realistic garment has been generated",
      });
    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMaterialImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setMaterialImage(e.target?.result as string);
          toast({
            title: "Material image uploaded",
            description: "Reference material has been added",
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

  const handleMaterialUploadClick = () => {
    materialFileInputRef.current?.click();
  };

  const handleRemoveMaterialImage = () => {
    setMaterialImage(null);
    if (materialFileInputRef.current) {
      materialFileInputRef.current.value = '';
    }
    toast({
      title: "Material image removed",
      description: "The material reference has been removed",
    });
  };

  return (
    <div className="min-h-screen bg-[#E8DDD4] text-gray-900 flex flex-col">
      {/* Top Navigation */}
      <div className="flex justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 flex shadow-lg border border-white/20">
          <button
            onClick={() => setActiveMode('sketch')}
            className={`px-8 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
              activeMode === 'sketch'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Sketch
          </button>
          <button
            onClick={() => setActiveMode('render')}
            className={`px-8 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
              activeMode === 'render'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            Render
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-6 px-6 pb-6">
        {/* Left Panel with Canvas */}
        <div className="flex-1">
          <div className="flex gap-3 mb-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUndo}
              className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 border-0 shadow-md rounded-xl font-medium"
            >
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRedo}
              className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 border-0 shadow-md rounded-xl font-medium"
            >
              <Redo className="w-4 h-4 mr-2" />
              Redo
            </Button>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-4">
            <SketchCanvas 
              className="h-[calc(100vh-280px)] rounded-2xl" 
              onImageChange={setSketchImage}
              generatedImage={generatedImage}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl shadow-lg flex flex-col overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="flex bg-gray-50/50 border-b border-gray-200/50">
            {[
              { key: 'render', label: 'Render' },
              { key: 'colorways', label: 'Colorways' },
              { key: 'material', label: 'Material' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSidebarTab(tab.key as any)}
                className={`flex-1 py-4 px-4 text-sm font-medium transition-all duration-200 ${
                  activeSidebarTab === tab.key
                    ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Generation Settings */}
            <GenerationSettings 
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
            />

            {/* Add Material Section */}
            <Card className="bg-white/60 border-white/30 shadow-sm rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-center">
                {materialImage ? (
                  <div className="relative">
                    <img 
                      src={materialImage} 
                      alt="Material reference" 
                      className="w-16 h-16 object-cover rounded-2xl mx-auto mb-4 shadow-md"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveMaterialImage}
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-100 hover:bg-red-200 text-red-600 border-0 shadow-md"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors shadow-sm"
                    onClick={handleMaterialUploadClick}
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Add Material</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {materialImage ? 'Material reference added' : 'Click to add material reference image'}
                </p>
                {!materialImage && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleMaterialUploadClick}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 rounded-xl font-medium shadow-sm"
                  >
                    Upload Image
                  </Button>
                )}
              </div>
            </Card>

            {/* Text Section */}
            <Card className="bg-white/60 border-white/30 shadow-sm rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Text</h3>
                <p className="text-gray-600 text-sm">Add and customize text elements</p>
              </div>
            </Card>
          </div>

          {/* Bottom Controls */}
          <div className="p-6 border-t border-gray-200/50 bg-gray-50/30 space-y-3">
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1 bg-white/80 hover:bg-white text-gray-700 border-0 rounded-xl font-medium shadow-sm backdrop-blur-sm"
              >
                Sides
              </Button>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50 rounded-xl font-medium shadow-md transition-all duration-200"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input for material */}
      <input
        ref={materialFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleMaterialImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default Index;
