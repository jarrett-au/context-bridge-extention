import { useState, useEffect } from 'react';
import { Sparkles, Copy, X, Settings, Check, Loader2 } from 'lucide-react';
import type { ClipItem } from '../../types';
import { synthesizeWithAI } from '../../lib/ai';

interface SynthesisZoneProps {
  items: ClipItem[];
  onConfirm: (content: string, sourceItemIds: string[]) => void;
}

interface Template {
    id: string;
    name: string;
    content: string;
}

export function SynthesisZone({ items, onConfirm }: SynthesisZoneProps) {
  const [expanded, setExpanded] = useState(false);
  const [synthesizedContent, setSynthesizedContent] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');

  useEffect(() => {
      chrome.storage.local.get(['templates', 'openai_api_key', 'openai_base_url', 'openai_model'], (result) => {
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

          if (result.openai_api_key) {
              setApiKey(result.openai_api_key as string);
          }
          if (result.openai_base_url) {
              setBaseUrl(result.openai_base_url as string);
          }
          if (result.openai_model) {
              setModel(result.openai_model as string);
          }
      });
  }, []);

  const handleSynthesize = () => {
    if (items.length === 0) return;

    const template = templates.find(t => t.id === selectedTemplateId) || templates[0];

    const content = items.map(item => {
        let text = template.content;
        text = text.replace(/{{source_title}}/g, item.metadata.source_title);
        text = text.replace(/{{source_url}}/g, item.metadata.source_url);
        text = text.replace(/{{content}}/g, item.content);
        return text;
    }).join('\n\n---\n\n');

    setSynthesizedContent(content);
    setExpanded(true);
  };

  const handleAISynthesize = async () => {
      if (!apiKey) {
          alert('Please set your OpenAI API Key in Settings first.');
          chrome.runtime.openOptionsPage();
          return;
      }
      
      setIsSynthesizing(true);
      setExpanded(true); // Show area immediately to show loading state
      
      try {
          const combinedContent = items.map(item => 
              `Title: ${item.metadata.source_title}\nURL: ${item.metadata.source_url}\nContent:\n${item.content}`
          ).join('\n\n---\n\n');

          const prompt = `Please synthesize the following content based on this template/instruction: "${templates.find(t => t.id === selectedTemplateId)?.content || 'Summarize and combine'}". Return only the result in Markdown.`;

          const result = await synthesizeWithAI({
              apiKey,
              baseURL: baseUrl || undefined,
              model: model || undefined,
              prompt,
              content: combinedContent
          });

          setSynthesizedContent(result);
      } catch (error) {
          console.error(error);
          setSynthesizedContent('Error: Failed to synthesize with AI. Please check your API key and network connection.');
      } finally {
          setIsSynthesizing(false);
      }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(synthesizedContent).catch(console.error);
  };

  const handleConfirm = () => {
    const sourceIds = items.map(i => i.id);
    onConfirm(synthesizedContent, sourceIds);
    setExpanded(false);
    setSynthesizedContent('');
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
                <div className="flex gap-2">
                    <button 
                        onClick={handleSynthesize}
                        disabled={items.length === 0}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Template</span>
                    </button>
                    <button 
                        onClick={handleAISynthesize}
                        disabled={items.length === 0 || !apiKey}
                        className={`flex-1 flex items-center justify-center space-x-2 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${!apiKey ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        title={!apiKey ? "Set API Key in Settings to enable AI" : "Synthesize with AI"}
                    >
                        <Sparkles size={16} />
                        <span>AI Merge</span>
                    </button>
                </div>
            </div>
        ) : (
            <div className="flex flex-col h-64 transition-all duration-300 ease-in-out relative">
                {isSynthesizing && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                )}
                <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                        <Sparkles size={12} className="text-blue-500" /> Result
                    </span>
                    <div className="flex space-x-1">
                        <button onClick={handleConfirm} className="p-1 hover:bg-green-100 text-green-600 rounded" title="Confirm & Archive Source"><Check size={14} /></button>
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
