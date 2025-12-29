import type { ClipItem } from '../../types';
import { Archive, RotateCcw, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArchiveAreaProps {
  items: ClipItem[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ArchiveArea({ items, onRestore, onDelete }: ArchiveAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-100 min-h-[150px]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
          <Archive size={14} /> Archive
        </h2>
        <span className="text-xs text-gray-400">{items.length} items</span>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center text-gray-400 py-8 text-sm">
          No archived items
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode='popLayout'>
            {items.map((item) => (
               <motion.div 
                 key={item.id} 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 layout
                 className="group bg-white/50 p-2 rounded border border-gray-200 text-sm text-gray-600 flex justify-between items-center hover:bg-white transition-colors"
               >
                 <div className="truncate flex-1 pr-2 flex items-center gap-2">
                    <img src={item.metadata.favicon} alt="" className="w-3 h-3 opacity-50" onError={(e) => (e.currentTarget.src = '/vite.svg')} />
                    <span>{item.metadata.source_title}</span>
                 </div>
                 <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => onRestore(item.id)} className="text-blue-400 hover:text-blue-600 p-1" title="Restore to Staging"><RotateCcw size={12} /></button>
                   <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-600 p-1" title="Delete Forever"><Trash2 size={12} /></button>
                 </div>
               </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
