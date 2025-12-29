import { useState, useEffect } from 'react';
import { Sparkles, Copy, X, Settings } from 'lucide-react';
import type { ClipItem } from '../../types';

interface SynthesisZoneProps {
  stagingItems: ClipItem[];
}

interface Template {
    id: string;
    name: string;
    content: string;
}

export function SynthesisZone({ stagingItems }: SynthesisZoneProps) {
  const [expanded, setExpanded] = useState(false);
  const [synthesizedContent, setSynthesizedContent] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');

  useEffect(() => {
      chrome.storage.local.get(['templates'], (result) => {
          const storedTemplates = result.templates as Template[] | undefined;
          if (storedTemplates && storedTemplates.length > 0) {
              setTemplates(storedTemplates);
              setSelectedTemplateId(storedTemplates[0].id);
          } else {
              // Fallback default
              setTemplates([{
                  id: 'default',
                  name: 'Default',
                  content: '### Source: {{source_title}}\nURL: {{source_url}}\n\n{{content}}'
              }]);
          }
      });
  }, []);

  const handleSynthesize = () => {
    if (stagingItems.length === 0) return;

    const template = templates.find(t => t.id === selectedTemplateId) || templates[0];

    const content = stagingItems.map(item => {
        let text = template.content;
        text = text.replace(/{{source_title}}/g, item.metadata.source_title);
        text = text.replace(/{{source_url}}/g, item.metadata.source_url);
        text = text.replace(/{{content}}/g, item.content);
        return text;
    }).join('\n\n---\n\n');

    setSynthesizedContent(content);
    setExpanded(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(synthesizedContent).catch(console.error);
  };

  const openOptions = () => {
      chrome.runtime.openOptionsPage();
  };

  return (
    <div className="border-t border-b border-gray-200 bg-white">
        {!expanded ? (
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <select 
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="flex-1 text-sm border rounded p-1.5 bg-gray-50 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    <button onClick={openOptions} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Manage Templates">
                        <Settings size={16} />
                    </button>
                </div>
                <button 
                    onClick={handleSynthesize}
                    disabled={stagingItems.length === 0}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <Sparkles size={16} />
                    <span>Synthesize ({stagingItems.length})</span>
                </button>
            </div>
        ) : (
            <div className="flex flex-col h-64 transition-all duration-300 ease-in-out">
                <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                        <Sparkles size={12} className="text-blue-500" /> Result
                    </span>
                    <div className="flex space-x-1">
                        <button onClick={handleCopy} className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Copy"><Copy size={14} /></button>
                        <button onClick={() => setExpanded(false)} className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Close"><X size={14} /></button>
                    </div>
                </div>
                <textarea 
                    className="flex-1 w-full p-3 text-sm font-mono text-gray-700 resize-none focus:outline-none"
                    value={synthesizedContent}
                    onChange={(e) => setSynthesizedContent(e.target.value)}
                />
            </div>
        )}
    </div>
  );
}
