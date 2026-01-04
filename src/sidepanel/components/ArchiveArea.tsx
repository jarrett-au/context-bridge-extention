import type { ClipItem } from '../../types';
import { Archive, RotateCcw, Trash2, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ArchiveAreaProps {
  items: ClipItem[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  style?: React.CSSProperties;
}

export function ArchiveArea({ 
    items, 
    onRestore, 
    onDelete,
    isCollapsed = false,
    onToggleCollapse,
    style 
}: ArchiveAreaProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.content.toLowerCase().includes(query) ||
      item.metadata.source_title.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col overflow-hidden bg-gray-100 transition-[height] duration-200 ease-in-out" style={style}>
      <div 
        className="flex items-center justify-between p-4 pb-3 cursor-pointer hover:bg-gray-200/50 transition-colors select-none"
        onClick={onToggleCollapse}
      >
        <h2 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
            {onToggleCollapse && (
                <button className="text-gray-400 hover:text-gray-600">
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>
            )}
            <Archive size={14} /> Archive
        </h2>
        <span className="text-xs text-gray-400">{items.length} total</span>
      </div>
      
      {!isCollapsed && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {items.length > 0 && (
                <div className="mb-3 relative group">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search history..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white transition-all"
                    />
                </div>
            )}
            
            {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    {searchQuery ? (
                        <>
                            <p className="text-sm text-gray-500 font-medium">No matches found</p>
                            <p className="text-xs text-gray-400 mt-1">Try a different keyword</p>
                        </>
                    ) : (
                        <>
                            <div className="bg-gray-200/50 p-3 rounded-full mb-2">
                                <Archive className="w-5 h-5 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">No archived items</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                <AnimatePresence mode='popLayout'>
                    {filteredItems.map((item) => (
                    <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                        className="group bg-white/50 p-2 rounded border border-gray-200 text-sm text-gray-600 flex flex-col hover:bg-white transition-colors gap-2"
                    >
                        <div className="flex justify-between items-start">
                            <div className="truncate flex-1 pr-2 flex items-center gap-2">
                                <img src={item.metadata.favicon} alt="" className="w-3 h-3 opacity-50" onError={(e) => (e.currentTarget.src = '/vite.svg')} />
                                <span className="font-medium text-gray-700">{item.metadata.source_title}</span>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button onClick={() => onRestore(item.id)} className="text-blue-400 hover:text-blue-600 p-1" title="Restore to Staging"><RotateCcw size={12} /></button>
                            <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-600 p-1" title="Delete Forever"><Trash2 size={12} /></button>
                            </div>
                        </div>
                        
                        {/* Preview content if searching */}
                        {searchQuery && (
                            <div className="text-xs text-gray-400 line-clamp-2 bg-gray-50 p-1 rounded">
                                {item.content}
                            </div>
                        )}
                    </motion.div>
                    ))}
                </AnimatePresence>
                </div>
            )}
          </div>
      )}
    </div>
  );
}
