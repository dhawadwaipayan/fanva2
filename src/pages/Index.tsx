import { useState, useRef } from 'react';
import { Undo, Redo, Upload, X, Loader2, Search, Download, ZoomIn, ZoomOut, Move } from 'lucide-react';
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
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  
  // Sketch mode states
  const [activeDrawingTool, setActiveDrawingTool] = useState<'draw' | 'erase' | 'size'>('draw');
  
  const materialFileInputRef = useRef<HTMLInputElement>(null);

  const handleUndo = () => {
    toast({
      title: "Undo",
      description: "Last action has been undone"
    });
  };

  const handleRedo = () => {
    toast({
      title: "Redo",
      description: "Action has been redone"
    });
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to generate images",
        variant: "destructive"
      });
      return;
    }
    if (!sketchImage) {
      toast({
        title: "Sketch Required",
        description: "Please upload a flat sketch first",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    try {
      toast({
        title: "Generation Started",
        description: "AI is creating your realistic garment..."
      });
      const generatedUrl = await generateRealisticGarment({
        flatSketch: sketchImage,
        materialImage: materialImage || undefined,
        apiKey: apiKey
      });
      setGeneratedImage(generatedUrl);
      toast({
        title: "Generation Complete!",
        description: "Your realistic garment has been generated"
      });
    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage) {
      toast({
        title: "No image to download",
        description: "Please generate an image first",
        variant: "destructive"
      });
      return;
    }
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-garment-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Download started",
      description: "Your generated image is being downloaded"
    });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleTogglePan = () => {
    setIsPanning(prev => !prev);
  };

  const handleMaterialImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          setMaterialImage(e.target?.result as string);
          toast({
            title: "Material image uploaded",
            description: "Reference material has been added"
          });
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
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
      description: "The material reference has been removed"
    });
  };

  const handleSketchUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          setSketchImage(imageData);
          toast({
            title: "Sketch uploaded",
            description: "Your sketch has been added"
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-gray-100 flex flex-col">
      {/* Top Navigation */}
      <div className="flex justify-between items-center p-6 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-gray-500 rounded grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-gray-300 rounded-sm"></div>
              ))}
            </div>
          </div>
          <h1 className="text-2xl font-medium text-white">Fanva v1.0</h1>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center p-6">
        <div className="bg-gray-700 rounded-lg p-1 flex border border-gray-600">
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

      {/* Main Content - Conditional based on active mode */}
      {activeMode === 'sketch' ? (
        /* Sketch Mode Layout */
        <div className="flex flex-1 gap-6 px-6 pb-6">
          {/* Left Drawing Tools */}
          <div className="w-48 flex flex-col gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUndo}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600 justify-start"
            >
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRedo}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600 justify-start"
            >
              <Redo className="w-4 h-4 mr-2" />
              Redo
            </Button>
            
            <div className="mt-4 space-y-2">
              <Button
                variant={activeDrawingTool === 'draw' ? 'default' : 'secondary'}
                onClick={() => setActiveDrawingTool('draw')}
                className={`w-full justify-start ${
                  activeDrawingTool === 'draw'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
                }`}
              >
                Draw
              </Button>
              <Button
                variant={activeDrawingTool === 'erase' ? 'default' : 'secondary'}
                onClick={() => setActiveDrawingTool('erase')}
                className={`w-full justify-start ${
                  activeDrawingTool === 'erase'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
                }`}
              >
                Erase
              </Button>
              <Button
                variant={activeDrawingTool === 'size' ? 'default' : 'secondary'}
                onClick={() => setActiveDrawingTool('size')}
                className={`w-full justify-start ${
                  activeDrawingTool === 'size'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
                }`}
              >
                Size
              </Button>
            </div>
          </div>

          {/* Center Canvas Area */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-700 rounded-lg border border-gray-600 p-4 flex-1">
              <SketchCanvas
                className="h-full rounded-lg bg-[#1B1B1B]"
                onImageChange={setSketchImage}
                generatedImage={generatedImage}
                zoom={zoom}
                isPanning={isPanning}
              />
            </div>
            
            {/* Bottom Action Buttons */}
            <div className="flex gap-4 mt-6 justify-center">
              <Button
                variant="secondary"
                onClick={handleSketchUploadClick}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600 px-8"
              >
                Upload
              </Button>
              <Button
                variant="secondary"
                onClick={() => setActiveMode('render')}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600 px-8"
              >
                Render
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 px-8"
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
      ) : (
        /* Render Mode Layout - Original layout with sidebar */
        <div className="flex flex-1 gap-6 px-6 pb-6">
          {/* Left Panel with Canvas */}
          <div className="flex-1">
            <div className="flex gap-3 mb-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUndo}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
              >
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRedo}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
              >
                <Redo className="w-4 h-4 mr-2" />
                Redo
              </Button>
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleZoomOut}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleZoomIn}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleTogglePan}
                  className={`border-gray-600 ${
                    isPanning
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  <Move className="w-4 h-4" />
                </Button>
                {generatedImage && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownloadImage}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
              <SketchCanvas
                className="h-[calc(100vh-280px)] rounded-lg bg-[#1B1B1B]"
                onImageChange={setSketchImage}
                generatedImage={generatedImage}
                zoom={zoom}
                isPanning={isPanning}
              />
            </div>
          </div>

          {/* Right Sidebar - Only in Render Mode */}
          <div className="w-80 bg-gray-700 border border-gray-600 rounded-lg flex flex-col overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="flex bg-gray-800 border-b border-gray-600">
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
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Generation Settings */}
              <GenerationSettings apiKey={apiKey} onApiKeyChange={setApiKey} />

              {/* Add Material Section */}
              <Card className="bg-gray-600 border-gray-500 p-6">
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
                      className="w-16 h-16 bg-gray-500 rounded-lg mx-auto mb-4 flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors border border-gray-400"
                      onClick={handleMaterialUploadClick}
                    >
                      <Upload className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">Add Material</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {materialImage
                      ? 'Material reference added'
                      : 'Click to add material reference image'}
                  </p>
                  {!materialImage && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleMaterialUploadClick}
                      className="bg-gray-500 hover:bg-gray-400 text-gray-200 border-gray-400"
                    >
                      Upload Image
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 border-t border-gray-600 bg-gray-800 space-y-3">
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-gray-200 border-gray-500"
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
      )}

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
