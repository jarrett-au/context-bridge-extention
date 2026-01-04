import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Copy, FileText, GripVertical, Pencil, Check, X } from 'lucide-react';
import type { ClipItem } from '../../types';
import { useState, useRef, useEffect } from 'react';

interface SortableClipItemProps {
  item: ClipItem;
  selected: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
  onUpdateContent: (id: string, content: string) => void;
}

export function SortableClipItem({ item, selected, onToggle, onDelete, onCopy, onUpdateContent }: SortableClipItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
  };

  useEffect(() => {
    setEditContent(item.content);
  }, [item.content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editContent.trim() !== item.content) {
      onUpdateContent(item.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(item.content);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
          handleSave();
      } else if (e.key === 'Escape') {
          handleCancel();
      }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white p-3 rounded-lg shadow-sm border transition-shadow group ${isDragging ? 'shadow-xl ring-2 ring-blue-500' : ''} ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:shadow-md'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2 overflow-hidden">
           {/* Drag Handle */}
           <button 
             {...attributes} 
             {...listeners} 
             className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none outline-none"
             title="Drag to reorder"
           >
             <GripVertical size={14} />
           </button>
           
           {/* Checkbox */}
           <input 
             type="checkbox" 
             checked={selected} 
             onChange={() => onToggle(item.id)}
             className="cursor-pointer w-3.5 h-3.5 accent-blue-500 rounded border-gray-300"
           />
          
          <img src={item.metadata.favicon} alt="" className="w-4 h-4 rounded-sm flex-shrink-0" onError={(e) => (e.currentTarget.src = '/vite.svg')} />
          <span className="text-xs text-gray-500 truncate" title={item.metadata.source_title}>{item.metadata.source_title}</span>
        </div>
        <div className="flex space-x-1 flex-shrink-0">
          {!isEditing ? (
            <>
              <button className="text-gray-400 hover:text-blue-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setIsEditing(true)} title="Edit"><Pencil size={14} /></button>
              <button className="text-gray-400 hover:text-blue-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onCopy(item.content)} title="Copy Markdown"><Copy size={14} /></button>
              <button className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onDelete(item.id)} title="Delete"><Trash2 size={14} /></button>
            </>
          ) : (
             <>
               <button className="text-green-600 hover:text-green-700 p-1" onClick={handleSave} title="Save (Ctrl+Enter)"><Check size={14} /></button>
               <button className="text-gray-400 hover:text-gray-600 p-1" onClick={handleCancel} title="Cancel (Esc)"><X size={14} /></button>
             </>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => {
                setEditContent(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={handleKeyDown}
            className="mt-2 w-full text-sm font-mono bg-white border border-blue-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none overflow-hidden"
            rows={3}
        />
      ) : (
        <div 
            className="mt-2 text-sm text-gray-800 line-clamp-3 font-mono bg-gray-50 p-1 rounded select-text cursor-text hover:bg-gray-100 transition-colors"
            onDoubleClick={() => setIsEditing(true)}
            title="Double click to edit"
        >
            {item.content}
        </div>
      )}

      <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
        <span className="flex items-center gap-1"><FileText size={10} /> {item.token_estimate} tokens</span>
        <span>{new Date(item.metadata.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
