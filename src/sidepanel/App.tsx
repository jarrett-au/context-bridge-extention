import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StagingArea } from './components/StagingArea';
import { SynthesisZone } from './components/SynthesisZone';
import { ArchiveArea } from './components/ArchiveArea';
import { Onboarding } from './components/Onboarding';
import { useClips } from './hooks/useClips';
import { toast } from 'sonner';

import type { ClipItem } from '../types';
import { estimateTokens } from '../lib/tokenizer';

import { ResizeHandle } from './components/ui/ResizeHandle';

function App() {
  const { clips, deleteClip, deleteClips, updateClipStatus, reorderClips, synthesizeAndArchive, updateClipContent } = useClips();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Layout state
  const [stagingHeight, setStagingHeight] = useState(300);
  const [initialStagingHeight, setInitialStagingHeight] = useState(300); // For smoother resizing
  const [isStagingCollapsed, setIsStagingCollapsed] = useState(false);
  const [isArchiveCollapsed, setIsArchiveCollapsed] = useState(false);

  useEffect(() => {
    chrome.storage.local.get('onboardingComplete', (res) => {
        if (!res.onboardingComplete) {
            setShowOnboarding(true);
        }
    });

    // Notify background that side panel is open
    const port = chrome.runtime.connect({ name: 'sidepanel' });
    return () => {
      port.disconnect();
    };
  }, []);

  const handleOnboardingComplete = () => {
    chrome.storage.local.set({ onboardingComplete: true });
    setShowOnboarding(false);
  };

  const stagingItems = clips.filter(i => i.status === 'staging');
  const archivedItems = clips.filter(i => i.status === 'archived');

  const itemsToSynthesize = selectedIds.size > 0 
    ? stagingItems.filter(i => selectedIds.has(i.id))
    : stagingItems;

  const handleReorderStaging = (newStagingItems: ClipItem[]) => {
    const otherItems = clips.filter(i => i.status !== 'staging');
    reorderClips([...newStagingItems, ...otherItems]);
  };

  const handleToggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBatchDelete = async () => {
    // Improved UX: No native confirm, use Toast with potential undo (not implemented yet) or just notify
    if (selectedIds.size === 0) return;
    
    // Simple confirm for now until we have Undo
    if (window.confirm(`Delete ${selectedIds.size} items?`)) {
        await deleteClips(Array.from(selectedIds));
        setSelectedIds(new Set());
        toast.success('Items deleted');
    }
  };

  const handleBatchArchive = async () => {
      await updateClipStatus(Array.from(selectedIds), 'archived');
      setSelectedIds(new Set());
      toast.success('Items archived');
  };

  const handleRestore = async (id: string) => {
    await updateClipStatus([id], 'staging');
  };

  const handleConfirmSynthesis = async (content: string, sourceItemIds: string[]) => {
    // 1. Create new item
    const newItem: ClipItem = {
        id: crypto.randomUUID(),
        type: 'text',
        content: content,
        metadata: {
            source_url: 'context-bridge://synthesis',
            source_title: 'Synthesized Content',
            timestamp: Date.now(),
            favicon: ''
        },
        status: 'staging',
        token_estimate: estimateTokens(content)
    };
    
    // 2. Atomic update: Add new item AND archive source items
    await synthesizeAndArchive(newItem, sourceItemIds);
    
    // 3. Clear selection
    setSelectedIds(new Set());
  };

  const handleResizeStart = () => {
    setInitialStagingHeight(stagingHeight);
  };

  const handleStagingResize = (deltaY: number) => {
    // Staging height = initial + delta
    setStagingHeight(Math.max(100, Math.min(window.innerHeight - 200, initialStagingHeight + deltaY)));
  };

  const handleArchiveResize = (deltaY: number) => {
    // Archive resizing moves the bottom of Synthesis zone / top of Archive
    // Moving down (positive delta) -> Archive shrinks, Staging grows
    // Moving up (negative delta) -> Archive grows, Staging shrinks
    setStagingHeight(Math.max(100, Math.min(window.innerHeight - 200, initialStagingHeight + deltaY)));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 relative overflow-hidden">
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <Header />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <StagingArea 
            items={stagingItems} 
            selectedIds={selectedIds}
            onToggleSelection={handleToggleSelection}
            onDelete={deleteClip} 
            onReorder={handleReorderStaging} 
            onBatchDelete={handleBatchDelete}
            onBatchArchive={handleBatchArchive}
            onUpdateContent={updateClipContent}
            isCollapsed={isStagingCollapsed}
            onToggleCollapse={() => setIsStagingCollapsed(!isStagingCollapsed)}
            style={{ 
                height: isArchiveCollapsed ? 'auto' : (isStagingCollapsed ? 'auto' : `${stagingHeight}px`),
                flex: isArchiveCollapsed ? '1 1 0' : (isStagingCollapsed ? '0 0 auto' : 'none'),
                flexShrink: 0,
                maxHeight: (isStagingCollapsed || isArchiveCollapsed) ? undefined : '70vh'
            }}
        />
        
        {!isStagingCollapsed && !isArchiveCollapsed && (
            <ResizeHandle onResize={handleStagingResize} onResizeStart={handleResizeStart} />
        )}

        <div className="flex-shrink-0">
            <SynthesisZone items={itemsToSynthesize} onConfirm={handleConfirmSynthesis} />
        </div>

        {!isStagingCollapsed && !isArchiveCollapsed && (
            <ResizeHandle onResize={handleArchiveResize} onResizeStart={handleResizeStart} />
        )}

        <ArchiveArea 
            items={archivedItems} 
            onRestore={handleRestore} 
            onDelete={deleteClip} 
            isCollapsed={isArchiveCollapsed}
            onToggleCollapse={() => setIsArchiveCollapsed(!isArchiveCollapsed)}
            style={{
                flex: isArchiveCollapsed ? '0 0 auto' : '1 1 0',
                minHeight: isArchiveCollapsed ? undefined : '0',
                height: isArchiveCollapsed ? 'auto' : undefined
            }}
        />
      </div>
    </div>
  );
}

export default App;
