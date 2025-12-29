import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Power, PanelRightOpen } from 'lucide-react'
import '../index.css'

function Popup() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(['extensionEnabled'], (result) => {
      if (result.extensionEnabled !== undefined) {
        setEnabled(!!result.extensionEnabled);
      }
    });
  }, []);

  const toggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    chrome.storage.local.set({ extensionEnabled: newState });
  };

  const openSidePanel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id && tabs[0].windowId) {
            // @ts-ignore
            chrome.sidePanel.open({ windowId: tabs[0].windowId }).catch((err) => {
                console.error('Failed to open side panel:', err);
                // Fallback instructions if needed
            });
            window.close();
        }
    });
  };

  return (
    <div className="w-[250px] p-4 bg-white text-gray-900">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold flex items-center gap-2">
           <img src="/vite.svg" className="w-5 h-5" />
           Context Bridge
        </h1>
        <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
      </div>

      <div className="space-y-3">
          <button 
            onClick={toggle}
            className={`w-full flex items-center justify-center gap-2 p-2 rounded-md font-medium transition-colors cursor-pointer ${enabled ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
          >
            <Power size={18} />
            {enabled ? 'Disable Capture' : 'Enable Capture'}
          </button>

          <button 
            onClick={openSidePanel}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium cursor-pointer"
          >
            <PanelRightOpen size={18} />
            Open Side Panel
          </button>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-center text-gray-400">
        v1.0.0
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
)
