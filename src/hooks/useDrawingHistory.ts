
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { HistoryState, TextElement } from '@/types/drawing';

export const useDrawingHistory = () => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback((canvasRef: React.RefObject<HTMLCanvasElement>, textElements: TextElement[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasData = canvas.toDataURL();
    const newState: HistoryState = {
      canvasData,
      textElements: [...textElements]
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    if (newHistory.length > 20) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }
    
    setHistory(newHistory);
  }, [history, historyIndex]);

  const handleUndo = useCallback((canvasRef: React.RefObject<HTMLCanvasElement>, setTextElements: (elements: TextElement[]) => void) => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevState = history[prevIndex];
      
      if (prevState) {
        setHistoryIndex(prevIndex);
        setTextElements(prevState.textElements);
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = prevState.canvasData;
        }
        
        toast({
          title: "Undo",
          description: "Last action has been undone"
        });
      }
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback((canvasRef: React.RefObject<HTMLCanvasElement>, setTextElements: (elements: TextElement[]) => void) => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      
      if (nextState) {
        setHistoryIndex(nextIndex);
        setTextElements(nextState.textElements);
        
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = nextState.canvasData;
        }
        
        toast({
          title: "Redo",
          description: "Action has been redone"
        });
      }
    }
  }, [history, historyIndex]);

  const initializeHistory = useCallback((canvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (history.length === 0) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const canvasData = canvas.toDataURL();
          const initialState: HistoryState = {
            canvasData,
            textElements: []
          };
          setHistory([initialState]);
          setHistoryIndex(0);
        }
      }, 100);
    }
  }, [history.length]);

  return {
    history,
    historyIndex,
    saveToHistory,
    handleUndo,
    handleRedo,
    initializeHistory
  };
};
