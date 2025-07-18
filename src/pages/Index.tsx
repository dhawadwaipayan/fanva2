import { useState, useRef } from 'react';
import { Undo, Redo, Upload, X, Loader2, Search, Download, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { SketchCanvas } from '@/components/SketchCanvas';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { GenerationSettings } from '@/components/GenerationSettings';
import { generateRealisticGarment } from '@/services/imageGeneration';
import { MaterialSettings } from '@/components/MaterialSettings';
import { UserMenu } from '@/components/UserMenu';

const Index = () => {
  const [activeMode, setActiveMode] = useState<'sketch' | 'render'>('sketch');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'render' | 'colorways' | 'material'>('render');
  const [sketchImage, setSketchImage] = useState<string | null>(null);
  const [renderImage, setRenderImage] = useState<string | null>(null);
  const [annotatedSketchImage, setAnnotatedSketchImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [sketchGeneratedImage, setSketchGeneratedImage] = useState<string | null>(null);
  const [hasTransferredToRender, setHasTransferredToRender] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [materialTexture, setMaterialTexture] = useState<string | null>(null);

  // Sketch mode states
  const [activeDrawingTool, setActiveDrawingTool] = useState<'draw' | 'erase' | 'text'>('draw');

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

    let imageToUse: string | null = null;
    
    if (activeMode === 'sketch') {
      // Use annotated image if available, otherwise use the original sketch
      imageToUse = annotatedSketchImage || sketchImage;
    } else {
      // In render mode, use the render image (could be transferred from sketch or uploaded)
      imageToUse = renderImage;
    }
    
    if (!imageToUse) {
      toast({
        title: "Image Required",
        description: activeMode === 'sketch' ? "Please upload a flat sketch first" : "Please upload an image or transfer from sketch mode",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      toast({
        title: "Generation Started",
        description: activeMode === 'sketch' 
          ? "AI is redoing your flat sketch with annotations..." 
          : "AI is creating your realistic garment..."
      });
      
      const generatedUrl = await generateRealisticGarment({
        flatSketch: imageToUse,
        materialImage: activeMode === 'render' ? materialTexture : undefined, // Only use material in render mode
        apiKey: apiKey,
        isSketchMode: activeMode === 'sketch'
      });
      
      if (activeMode === 'sketch') {
        setSketchGeneratedImage(generatedUrl);
        setHasTransferredToRender(false); // Reset transfer flag when new sketch is generated
      } else {
        setGeneratedImage(generatedUrl);
      }
      
      toast({
        title: "Generation Complete!",
        description: activeMode === 'sketch' 
          ? "Your flat sketch with annotations has been redone" 
          : "Your realistic garment has been generated"
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

  // Handle mode switching - transfer sketch generated image to render canvas
  const handleModeSwitch = (mode: 'sketch' | 'render') => {
    if (mode === 'render' && activeMode === 'sketch' && sketchGeneratedImage && !hasTransferredToRender) {
      // Transfer the generated sketch image to the render canvas
      setRenderImage(sketchGeneratedImage);
      setHasTransferredToRender(true);
      toast({
        title: "Image transferred",
        description: "Your generated sketch has been moved to the render canvas"
      });
    }
    setActiveMode(mode);
  };

  // Handle render image removal
  const handleRenderImageRemove = () => {
    setRenderImage(null);
    setGeneratedImage(null);
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
        <UserMenu />
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center p-6">
        <div className="bg-gray-700 rounded-lg p-1 flex border border-gray-600">
          <button
            onClick={() => handleModeSwitch('sketch')}
            className={`px-6 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
              activeMode === 'sketch'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Sketch
          </button>
          <button
            onClick={() => handleModeSwitch('render')}
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
          {/* Center Canvas Area */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-700 rounded-lg border border-gray-600 p-4 flex-1">
              <DrawingCanvas
                className="h-full rounded-lg bg-[#1B1B1B]"
                onImageChange={setSketchImage}
                onAnnotatedImageChange={setAnnotatedSketchImage}
                activeDrawingTool={activeDrawingTool}
                onToolChange={setActiveDrawingTool}
                generatedImage={sketchGeneratedImage}
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
                onClick={() => handleModeSwitch('render')}
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

          {/* Right Sidebar for Sketch Mode */}
          <div className="w-80 bg-gray-700 border border-gray-600 rounded-lg flex flex-col overflow-hidden">
            {/* Sidebar Content */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Generation Settings */}
              <GenerationSettings apiKey={apiKey} onApiKeyChange={setApiKey} />
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
                onImageChange={setRenderImage}
                onImageRemove={handleRenderImageRemove}
                generatedImage={generatedImage}
                uploadedImage={renderImage}
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
                { key: 'render', label: 'API' },
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
              {activeSidebarTab === 'render' && (
                <GenerationSettings apiKey={apiKey} onApiKeyChange={setApiKey} />
              )}
              {activeSidebarTab === 'colorways' && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Colorways</h3>
                  <p className="text-gray-400">Colorway options coming soon...</p>
                </div>
              )}
              {activeSidebarTab === 'material' && (
                <MaterialSettings onMaterialChange={setMaterialTexture} />
              )}
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
    </div>
  );
};

export default Index;
