
import { TextElement } from '@/types/drawing';

interface TextOverlayProps {
  textElements: TextElement[];
  onTextChange: (textId: string, newText: string) => void;
  onTextFinishEditing: (textId: string) => void;
  onTextMouseDown: (textId: string, e: React.MouseEvent) => void;
  onTextDoubleClick: (textId: string, e: React.MouseEvent) => void;
}

export const TextOverlay = ({
  textElements,
  onTextChange,
  onTextFinishEditing,
  onTextMouseDown,
  onTextDoubleClick
}: TextOverlayProps) => {
  return (
    <>
      {textElements.map((textElement) => (
        <div
          key={textElement.id}
          className="absolute"
          style={{
            left: textElement.x,
            top: textElement.y,
            zIndex: 20
          }}
        >
          {textElement.isEditing ? (
            <input
              type="text"
              value={textElement.text}
              onChange={(e) => onTextChange(textElement.id, e.target.value)}
              onBlur={() => onTextFinishEditing(textElement.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  onTextFinishEditing(textElement.id);
                }
              }}
              className="bg-white border-2 border-blue-500 outline-none text-black font-medium text-base px-2 py-1 rounded min-w-[120px]"
              placeholder="Type here..."
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div 
              className={`bg-white/95 border border-gray-300 text-black font-medium text-base px-2 py-1 rounded min-w-[120px] select-none ${
                textElement.isDragging ? 'cursor-grabbing shadow-lg' : 'cursor-grab hover:bg-white hover:shadow-md'
              } transition-all`}
              onMouseDown={(e) => onTextMouseDown(textElement.id, e)}
              onDoubleClick={(e) => onTextDoubleClick(textElement.id, e)}
            >
              {textElement.text || 'Empty text'}
            </div>
          )}
        </div>
      ))}
    </>
  );
};
