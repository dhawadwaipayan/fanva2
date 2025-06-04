
import { Undo, Redo, Pencil, Eraser, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DrawingTool } from '@/types/drawing';

interface DrawingToolbarProps {
  activeDrawingTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const DrawingToolbar = ({
  activeDrawingTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: DrawingToolbarProps) => {
  return (
    <div className="flex gap-2 justify-center">
      <Button
        variant="secondary"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="bg-gray-600 text-gray-200 disabled:opacity-50"
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
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
  );
};
