import { useState, useRef } from 'react';
import { Undo, Redo, Upload, X, Loader2, Search } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Top Navigation */}
      <div className="flex justify-between items-center p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-gray-600 rounded grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-gray-400 rounded-sm"></div>
              ))}
            </div>
          </div>
          <h1 className="text-2xl font-medium text-white">Design Studio</h1>
        </div>
        <Search className="w-5 h-5 text-gray-400" />
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center p-6">
        <div className="bg-gray-800 rounded-lg p-1 flex border border-gray-700">
          <button
            onClick={() => setActiveMode('sketch')}
            className={`px-6 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
              activeMode === 'sketch'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Sketch
          </button>
          <button
            onClick={() => setActiveMode('render')}
            className={`px-6 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
              activeMode === 'render'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
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
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700"
            >
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRedo}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700"
            >
              <Redo className="w-4 h-4 mr-2" />
              Redo
            </Button>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <SketchCanvas 
              className="h-[calc(100vh-280px)] rounded-lg bg-gray-900" 
              onImageChange={setSketchImage}
              generatedImage={generatedImage}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-gray-800 border border-gray-700 rounded-lg flex flex-col overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="flex bg-gray-850 border-b border-gray-700">
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
                    ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
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
            <Card className="bg-gray-750 border-gray-600 p-6">
              <div className="text-center">
                {materialImage ? (
                  <div className="relative">
                    <img 
                      src={materialImage} 
                      alt="Material reference" 
                      className="w-16 h-16 object-cover rounded-lg mx-auto mb-4"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveMaterialImage}
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-600 hover:bg-red-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="w-16 h-16 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors border border-gray-600"
                    onClick={handleMaterialUploadClick}
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Add Material</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {materialImage ? 'Material reference added' : 'Click to add material reference image'}
                </p>
                {!materialImage && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleMaterialUploadClick}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
                  >
                    Upload Image
                  </Button>
                )}
              </div>
            </Card>

            {/* Text Section */}
            <Card className="bg-gray-750 border-gray-600 p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Text</h3>
                <p className="text-gray-400 text-sm">Add and customize text elements</p>
              </div>
            </Card>
          </div>

          {/* Bottom Controls */}
          <div className="p-6 border-t border-gray-700 bg-gray-850 space-y-3">
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
              >
                Sides
              </Button>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
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
