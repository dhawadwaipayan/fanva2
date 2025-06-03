import { useState } from 'react';
import { Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { SketchCanvas } from '@/components/SketchCanvas';

const Index = () => {
  const [activeMode, setActiveMode] = useState<'sketch' | 'render'>('sketch');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'render' | 'colorways' | 'material'>('render');

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

  const handleGenerate = () => {
    toast({
      title: "Generate",
      description: "Starting generation process...",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Navigation */}
      <div className="flex justify-center p-4">
        <div className="bg-gray-700 rounded-lg p-1 flex">
          <button
            onClick={() => setActiveMode('sketch')}
            className={`px-6 py-2 rounded-md transition-all duration-200 font-medium ${
              activeMode === 'sketch'
                ? 'bg-gray-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            Sketch
          </button>
          <button
            onClick={() => setActiveMode('render')}
            className={`px-6 py-2 rounded-md transition-all duration-200 font-medium ${
              activeMode === 'render'
                ? 'bg-gray-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            Render
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Panel with Canvas */}
        <div className="flex-1 p-4">
          {/* Undo/Redo Controls */}
          <div className="flex gap-2 mb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUndo}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRedo}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              <Redo className="w-4 h-4 mr-2" />
              Redo
            </Button>
          </div>

          {/* Canvas Area */}
          <SketchCanvas className="h-[calc(100vh-200px)]" />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Sidebar Tabs */}
          <div className="flex bg-gray-700 border-b border-gray-600">
            {[
              { key: 'render', label: 'Render' },
              { key: 'colorways', label: 'Colorways' },
              { key: 'material', label: 'Material' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSidebarTab(tab.key as any)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                  activeSidebarTab === tab.key
                    ? 'bg-gray-600 text-white border-b-2 border-blue-500'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 p-4 space-y-4">
            {/* Add Material Section */}
            <Card className="bg-gray-700 border-gray-600 p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-500 rounded"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Add Material</h3>
                <p className="text-gray-400 text-sm">Click to add new materials to your design</p>
              </div>
            </Card>

            {/* Text Section */}
            <Card className="bg-gray-700 border-gray-600 p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Text</h3>
                <p className="text-gray-400 text-sm">Add and customize text elements</p>
              </div>
            </Card>
          </div>

          {/* Bottom Controls */}
          <div className="p-4 border-t border-gray-700 space-y-2">
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              >
                Sides
              </Button>
              <Button 
                onClick={handleGenerate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
