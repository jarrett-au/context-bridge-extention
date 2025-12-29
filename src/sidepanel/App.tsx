import { useState } from 'react';
import { Header } from './components/Header';
import { StagingArea } from './components/StagingArea';
import { SynthesisZone } from './components/SynthesisZone';
import { ArchiveArea } from './components/ArchiveArea';
import { useClips } from './hooks/useClips';

import type { ClipItem } from '../types';

function App() {
  const { clips, deleteClip, deleteClips, updateClipStatus, reorderClips } = useClips();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const stagingItems = clips.filter(i => i.status === 'staging');
  const archivedItems = clips.filter(i => i.status === 'archived');

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
    if (confirm(`Delete ${selectedIds.size} items?`)) {
        await deleteClips(Array.from(selectedIds));
        setSelectedIds(new Set());
    }
  };

  const handleBatchArchive = async () => {
      await updateClipStatus(Array.from(selectedIds), 'archived');
      setSelectedIds(new Set());
  };

  const handleRestore = async (id: string) => {
    await updateClipStatus([id], 'staging');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />
      <div className="flex-1 flex flex-col min-h-0">
        <StagingArea 
            items={stagingItems} 
            selectedIds={selectedIds}
            onToggleSelection={handleToggleSelection}
            onDelete={deleteClip} 
            onReorder={handleReorderStaging} 
            onBatchDelete={handleBatchDelete}
            onBatchArchive={handleBatchArchive}
        />
        <SynthesisZone stagingItems={stagingItems} />
        <ArchiveArea items={archivedItems} onRestore={handleRestore} onDelete={deleteClip} />
      </div>
    </div>
  );
}

export default App;
