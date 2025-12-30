import { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  content: string;
}

export default function App() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');

  useEffect(() => {
    chrome.storage.local.get(['templates', 'openai_api_key', 'openai_base_url', 'openai_model'], (result) => {
      if (result.templates) {
        setTemplates(result.templates as Template[]);
      } else {
        // Default templates
        const defaults: Template[] = [
          {
            id: 'default',
            name: 'Default',
            content: '### Source: {{source_title}}\nURL: {{source_url}}\n\n{{content}}'
          },
          {
            id: 'qa',
            name: 'Q&A Format',
            content: '### Question\n(From {{source_title}})\n\n### Answer\n{{content}}'
          }
        ];
        setTemplates(defaults);
        chrome.storage.local.set({ templates: defaults });
      }

      if (result.openai_api_key) setApiKey(result.openai_api_key as string);
      if (result.openai_base_url) setBaseUrl(result.openai_base_url as string);
      if (result.openai_model) setModel(result.openai_model as string);
    });
  }, []);

  const saveSettings = () => {
    chrome.storage.local.set({ 
        openai_api_key: apiKey,
        openai_base_url: baseUrl,
        openai_model: model
    }, () => {
      alert('Settings saved');
    });
  };

  const saveTemplate = () => {
    if (!newTemplateName || !newTemplateContent) return;

    const newTemplate: Template = {
      id: crypto.randomUUID(),
      name: newTemplateName,
      content: newTemplateContent
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    chrome.storage.local.set({ templates: updatedTemplates });

    setNewTemplateName('');
    setNewTemplateContent('');
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(t => t.id !== id);
    setTemplates(updatedTemplates);
    chrome.storage.local.set({ templates: updatedTemplates });
  };

  return (
    <div className="max-w-3xl mx-auto p-8 text-gray-800">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
            <img src="/vite.svg" className="w-8 h-8" />
            Context Bridge Settings
        </h1>
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">OpenAI Compatible Settings</h2>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
          
          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base URL (Optional)</label>
            <input 
              type="text" 
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="https://api.openai.com/v1"
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty for default OpenAI URL</p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="sk-..."
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model (Optional)</label>
            <input 
              type="text" 
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="gpt-3.5-turbo"
            />
             <p className="text-xs text-gray-400 mt-1">Default: gpt-3.5-turbo</p>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              onClick={saveSettings}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} /> Save Settings
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2 border-t pt-4">
            Your settings are stored locally in your browser. Compatible with OpenAI, DeepSeek, Moonshot, etc.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Synthesis Templates</h2>
        <p className="text-gray-500 mb-4 text-sm">
          Use variables: <code className="bg-gray-100 px-1 rounded">{'{{source_title}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{source_url}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{content}}'}</code>
        </p>

        <div className="grid gap-4 mb-6">
          {templates.map(template => (
            <div key={template.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{template.name}</h3>
                {template.id !== 'default' && (
                  <button onClick={() => deleteTemplate(template.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto font-mono text-gray-600">
                {template.content}
              </pre>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Plus size={18} /> Add New Template
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <input 
                type="text" 
                value={newTemplateName}
                onChange={e => setNewTemplateName(e.target.value)}
                className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., Summary Format"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Content</label>
              <textarea 
                value={newTemplateContent}
                onChange={e => setNewTemplateContent(e.target.value)}
                className="w-full border rounded p-2 h-32 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter markdown template..."
              />
            </div>
            <button 
              onClick={saveTemplate}
              disabled={!newTemplateName || !newTemplateContent}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <Save size={18} /> Save Template
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">About</h2>
        <p className="text-gray-600">
          Context Bridge is an open-source extension for building LLM context from web content.
        </p>
      </section>
    </div>
  );
}
