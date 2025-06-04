
import { useState, useCallback } from 'react';
import { TextElement } from '@/types/drawing';

export const useTextElements = () => {
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const addTextElement = useCallback((x: number, y: number) => {
    const newTextId = Date.now().toString();
    const newText: TextElement = {
      id: newTextId,
      text: '',
      x,
      y,
      isEditing: true,
      isDragging: false
    };
    
    setTextElements(prev => [...prev.map(text => ({ ...text, isEditing: false })), newText]);
  }, []);

  const handleTextChange = useCallback((textId: string, newText: string) => {
    setTextElements(prev => prev.map(text => 
      text.id === textId ? { ...text, text: newText } : text
    ));
  }, []);

  const handleTextFinishEditing = useCallback((textId: string, saveToHistory: () => void) => {
    const textElement = textElements.find(t => t.id === textId);
    
    if (textElement) {
      if (textElement.text.trim() === '') {
        setTextElements(prev => prev.filter(text => text.id !== textId));
      } else {
        setTextElements(prev => prev.map(text => 
          text.id === textId ? { ...text, isEditing: false } : text
        ));
      }
      setTimeout(() => saveToHistory(), 50);
    }
  }, [textElements]);

  const handleTextMouseDown = useCallback((textId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const textElement = textElements.find(t => t.id === textId);
    if (!textElement || textElement.isEditing) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setTextElements(prev => prev.map(text => 
      text.id === textId ? { ...text, isDragging: true } : text
    ));
  }, [textElements]);

  const handleTextMouseMove = useCallback((containerPos: { x: number; y: number }) => {
    const draggingText = textElements.find(t => t.isDragging);
    if (!draggingText) return;

    const newX = containerPos.x - dragOffset.x;
    const newY = containerPos.y - dragOffset.y;

    setTextElements(prev => prev.map(text => 
      text.id === draggingText.id ? { ...text, x: newX, y: newY } : text
    ));
  }, [textElements, dragOffset]);

  const handleTextMouseUp = useCallback((saveToHistory: () => void) => {
    const draggingText = textElements.find(t => t.isDragging);
    if (draggingText) {
      setTextElements(prev => prev.map(text => 
        text.id === draggingText.id ? { ...text, isDragging: false } : text
      ));
      setTimeout(() => saveToHistory(), 50);
    }
  }, [textElements]);

  const handleTextDoubleClick = useCallback((textId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTextElements(prev => prev.map(text => 
      text.id === textId ? { ...text, isEditing: true } : { ...text, isEditing: false }
    ));
  }, []);

  return {
    textElements,
    setTextElements,
    addTextElement,
    handleTextChange,
    handleTextFinishEditing,
    handleTextMouseDown,
    handleTextMouseMove,
    handleTextMouseUp,
    handleTextDoubleClick
  };
};
