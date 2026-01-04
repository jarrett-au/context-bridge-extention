import type { ClipItem } from '../../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableClipItem } from './SortableClipItem';
import { toast } from 'sonner';
import { Scissors, Download, Copy as CopyIcon } from 'lucide-react';
import { formatClipsToMarkdown, downloadMarkdown } from '../../lib/export';

interface StagingAreaProps {
  items: ClipItem[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (items: ClipItem[]) => void;
  onBatchDelete?: () => void;
  onBatchArchive?: () => void;
  onUpdateContent: (id: string, content: string) => void;
}

export function StagingArea({ 
    items, 
    selectedIds, 
    onToggleSelection, 
    onDelete, 
    onReorder, 
    onBatchDelete, 
    onBatchArchive, 
    onUpdateContent
}: StagingAreaProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // 防止点击时误触拖拽
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
        toast.success('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy');
    });
  };

  const handleBatchDownload = () => {
    const selectedItems = items.filter(i => selectedIds.has(i.id));
    if (selectedItems.length === 0) return;
    
    const markdown = formatClipsToMarkdown(selectedItems);
    downloadMarkdown(markdown, `context-bridge-export-${Date.now()}.md`);
    toast.success('Downloaded');
  };

  const handleBatchCopy = () => {
    const selectedItems = items.filter(i => selectedIds.has(i.id));
    if (selectedItems.length === 0) return;

    const markdown = formatClipsToMarkdown(selectedItems);
    navigator.clipboard.writeText(markdown).then(() => {
        toast.success('Copied to clipboard');
    }).catch(() => {
        toast.error('Failed to copy');
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase">Staging Area</h2>
        {selectedIds.size > 0 ? (
             <div className="flex items-center space-x-2">
                 <span className="text-xs text-gray-400 font-medium">
                   {items.filter(i => selectedIds.has(i.id)).reduce((acc, curr) => acc + curr.token_estimate, 0).toLocaleString()} tokens
                 </span>
                 
                 <div className="h-3 w-px bg-gray-300 mx-1"></div>
                 
                 <button onClick={handleBatchCopy} className="text-gray-400 hover:text-blue-600 p-1" title="Copy as Markdown"><CopyIcon size={14} /></button>
                 <button onClick={handleBatchDownload} className="text-gray-400 hover:text-blue-600 p-1" title="Download Markdown"><Download size={14} /></button>

                 <div className="h-3 w-px bg-gray-300 mx-1"></div>
                 
                 {onBatchArchive && <button onClick={onBatchArchive} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Archive ({selectedIds.size})</button>}
                 {onBatchDelete && <button onClick={onBatchDelete} className="text-xs text-red-600 hover:text-red-800 font-medium">Delete ({selectedIds.size})</button>}
             </div>
        ) : (
             <span className="text-xs text-gray-400">
               {items.length} items · {items.reduce((acc, curr) => acc + curr.token_estimate, 0).toLocaleString()} tokens
             </span>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-lg mt-2">
            <div className="bg-gray-100 p-3 rounded-full mb-3">
                <Scissors className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No clips yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                Select text on any webpage and look for the capture bubble.
            </p>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.map((item) => (
                <SortableClipItem 
                  key={item.id} 
                  item={item} 
                  selected={selectedIds.has(item.id)}
                  onToggle={onToggleSelection}
                  onDelete={onDelete}
                  onCopy={handleCopy}
                  onUpdateContent={onUpdateContent}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
