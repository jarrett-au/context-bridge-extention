import { useState, useEffect } from 'react';
import { Sparkles, Copy, X, Settings, Check, Loader2, Link, Bot } from 'lucide-react';
import type { ClipItem, AiPrompt } from '../../types';
import { synthesizeWithAI } from '../../lib/ai';
import { DEFAULT_AI_PROMPTS } from '../../constants';
import { toast } from 'sonner';

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
  
  // Tab State: 'join' | 'ai'
  const [activeTab, setActiveTab] = useState<'join' | 'ai'>('join');

  // Join Mode State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');

  // AI Mode State
  const [aiPrompts, setAiPrompts] = useState<AiPrompt[]>([]);
  const [selectedAiPromptId, setSelectedAiPromptId] = useState<string>('summarize');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  
  // Settings
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');

  useEffect(() => {
      chrome.storage.local.get(['templates', 'ai_prompts', 'openai_api_key', 'openai_base_url', 'openai_model'], (result) => {
          // Load Join Templates
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

          // Load AI Prompts
          const storedPrompts = result.ai_prompts as AiPrompt[] | undefined;
          if (storedPrompts && storedPrompts.length > 0) {
              setAiPrompts(storedPrompts);
              // If current selected ID is not in new list and not custom, reset to first
              if (selectedAiPromptId !== 'custom' && !storedPrompts.find(p => p.id === selectedAiPromptId)) {
                  setSelectedAiPromptId(storedPrompts[0].id);
              }
          } else {
              setAiPrompts(DEFAULT_AI_PROMPTS);
              if (selectedAiPromptId !== 'custom') {
                  setSelectedAiPromptId(DEFAULT_AI_PROMPTS[0].id);
              }
          }

          if (result.openai_api_key) setApiKey(result.openai_api_key as string);
          if (result.openai_base_url) setBaseUrl(result.openai_base_url as string);
          if (result.openai_model) setModel(result.openai_model as string);
      });
  }, [expanded]); // Reload when expanded to ensure fresh settings

  const handleJoin = () => {
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
    toast.success('Joined successfully');
  };

  const handleAISynthesize = async () => {
      if (!apiKey) {
          toast.error('Please set your OpenAI API Key in Settings first.');
          chrome.runtime.openOptionsPage();
          return;
      }
      
      setIsSynthesizing(true);
      setExpanded(true); // Show area immediately to show loading state
      
      try {
          // Prepare context
          const context = items.map(item => 
              `Title: ${item.metadata.source_title}\nURL: ${item.metadata.source_url}\nContent:\n${item.content}`
          ).join('\n\n---\n\n');

          // Determine prompt
          let promptInstruction = '';
          if (selectedAiPromptId === 'custom') {
              promptInstruction = customPrompt;
          } else {
              promptInstruction = aiPrompts.find(p => p.id === selectedAiPromptId)?.prompt || '';
          }

          if (!promptInstruction) {
              setSynthesizedContent('Error: Please enter a custom instruction.');
              setIsSynthesizing(false);
              return;
          }

          const result = await synthesizeWithAI({
              apiKey,
              baseURL: baseUrl || undefined,
              model: model || undefined,
              prompt: promptInstruction,
              content: context
          });

          setSynthesizedContent(result);
          toast.success('Synthesis complete');
      } catch (error) {
          console.error(error);
          toast.error('Synthesis failed. Check your API Key and network.');
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
            <div className="flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button 
                        onClick={() => setActiveTab('join')}
                        className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'join' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Link size={14} />
                        Join
                    </button>
                    <button 
                        onClick={() => setActiveTab('ai')}
                        className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Bot size={14} />
                        AI Refine
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    {activeTab === 'join' ? (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500">Format:</span>
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
                                onClick={handleJoin}
                                disabled={items.length === 0}
                                className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 border border-blue-200 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Link size={16} />
                                <span>Preview Join</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-500">Goal:</span>
                                    <select 
                                        value={selectedAiPromptId}
                                        onChange={(e) => setSelectedAiPromptId(e.target.value)}
                                        className="flex-1 text-sm border rounded p-1.5 bg-gray-50 focus:ring-1 focus:ring-purple-500 outline-none"
                                    >
                                        {aiPrompts.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                        <option value="custom">Custom Instruction</option>
                                    </select>
                                    <button onClick={openOptions} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Settings">
                                        <Settings size={16} />
                                    </button>
                                </div>
                                {selectedAiPromptId === 'custom' && (
                                    <textarea 
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        placeholder="Enter your instruction..."
                                        className="w-full text-sm border rounded p-2 h-20 resize-none focus:ring-1 focus:ring-purple-500 outline-none"
                                    />
                                )}
                            </div>
                            <button 
                                onClick={handleAISynthesize}
                                disabled={items.length === 0 || !apiKey}
                                className={`w-full flex items-center justify-center space-x-2 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${!apiKey ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
                                title={!apiKey ? "Set API Key in Settings to enable AI" : "Synthesize with AI"}
                            >
                                <Sparkles size={16} />
                                <span>AI Generate</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        ) : (
            <div className="flex flex-col h-64 transition-all duration-300 ease-in-out relative">
                {isSynthesizing && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 flex-col gap-2">
                        <Loader2 className="animate-spin text-purple-600" size={32} />
                        <span className="text-sm text-purple-600 font-medium">Synthesizing...</span>
                    </div>
                )}
                <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-100">
                    <span className={`text-xs font-semibold uppercase flex items-center gap-1 ${activeTab === 'ai' ? 'text-purple-600' : 'text-blue-600'}`}>
                        {activeTab === 'ai' ? <Sparkles size={12} /> : <Link size={12} />}
                        {activeTab === 'ai' ? 'AI Result' : 'Join Result'}
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
