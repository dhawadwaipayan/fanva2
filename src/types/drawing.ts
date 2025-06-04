
export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  isEditing: boolean;
  isDragging: boolean;
}

export interface HistoryState {
  canvasData: string;
  textElements: TextElement[];
}

export type DrawingTool = 'draw' | 'erase' | 'text';
