import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Copy, FileText, GripVertical } from 'lucide-react';
import type { ClipItem } from '../../types';

interface SortableClipItemProps {
  item: ClipItem;
  selected: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
}

export function SortableClipItem({ item, selected, onToggle, onDelete, onCopy }: SortableClipItemProps) {
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
          <button className="text-gray-400 hover:text-blue-500 p-1" onClick={() => onCopy(item.content)} title="Copy Markdown"><Copy size={14} /></button>
          <button className="text-gray-400 hover:text-red-500 p-1" onClick={() => onDelete(item.id)} title="Delete"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-800 line-clamp-3 font-mono bg-gray-50 p-1 rounded select-text">
        {item.content}
      </div>
      <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
        <span className="flex items-center gap-1"><FileText size={10} /> {item.token_estimate} tokens</span>
        <span>{new Date(item.metadata.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
