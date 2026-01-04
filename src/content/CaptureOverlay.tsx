import { useState, useEffect, useRef } from 'react';
import TurndownService from 'turndown';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function CaptureOverlay() {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedHtml, setSelectedHtml] = useState('');
  const [enabled, setEnabled] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 监听全局开关
    chrome.storage.local.get(['extensionEnabled'], (result) => {
        if (result.extensionEnabled !== undefined) {
            setEnabled(!!result.extensionEnabled);
        }
    });

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
        if (areaName === 'local' && changes.extensionEnabled) {
            setEnabled(!!changes.extensionEnabled.newValue);
        }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  useEffect(() => {
    if (!enabled) {
        setVisible(false);
        return;
    }

    const handleMouseUp = (e: MouseEvent) => {
      // 检查点击是否发生在插件的 Shadow DOM 容器内
      // 注意：由于 Shadow DOM 封装，外部事件的 target 可能是宿主元素
      // 我们可以通过 composedPath() 来检查
      const path = e.composedPath();
      const isClickInside = path.some(node => (node as HTMLElement).id === 'context-bridge-root');
      
      if (isClickInside) {
          console.log('Context Bridge: Click inside overlay, ignoring global mouseup');
          return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setVisible(false);
        return;
      }

      const text = selection.toString().trim();
      if (text.length === 0) {
        setVisible(false);
        return;
      }

      // 获取选区坐标
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // 计算按钮位置 (显示在选区上方)
      setPosition({
        top: rect.top + window.scrollY - 40, // 向上偏移
        left: rect.left + window.scrollX + (rect.width / 2) - 20 // 居中
      });
      
      // 获取 HTML
      const div = document.createElement('div');
      div.appendChild(range.cloneContents());
      setSelectedHtml(div.innerHTML);
      setVisible(true);
      console.log('Context Bridge: Selection detected, showing overlay');
    };

    // 监听全局 mouseup
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled]);

  const handleCapture = async (e: React.MouseEvent) => {
    console.log('Context Bridge: Save button clicked');
    e.stopPropagation();
    e.preventDefault();
    
    if (!selectedHtml) {
        console.warn('Context Bridge: No selected HTML to capture');
        return;
    }

    try {
        const turndownService = new TurndownService();
        const markdown = turndownService.turndown(selectedHtml);

        console.log('Captured Markdown:', markdown);

        const newItem = {
            id: crypto.randomUUID(),
            type: 'text',
            content: markdown,
            raw_html: selectedHtml,
            metadata: {
                source_url: window.location.href,
                source_title: document.title,
                timestamp: Date.now(),
                favicon: getFavicon()
            },
            status: 'staging',
            token_estimate: Math.ceil(markdown.length / 4)
        };

        // 获取现有数据
        const result = await chrome.storage.local.get(['clips']);
        const clips = (result.clips as any[]) || [];
        const newClips = [newItem, ...clips];
        
        await chrome.storage.local.set({ clips: newClips });
        console.log('Context Bridge: Saved to storage', newClips);
        
        // 通知 Side Panel (如果打开)
        chrome.runtime.sendMessage({ type: 'CLIP_ADDED', payload: newItem }).catch(() => {
            // 忽略错误 (例如 Side Panel 未打开)
        });

        toast.success('已采集到 Context Bridge');
        setVisible(false);
        window.getSelection()?.removeAllRanges();
    } catch (err) {
        console.error('Capture failed:', err);
        toast.error('采集失败');
    }
  };

  if (!visible) return null;

  return (
    <div 
      ref={overlayRef}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 2147483647, // Max z-index
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #e5e7eb',
        pointerEvents: 'auto'
      }}
      onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }} // 防止点击气泡时触发 document 的清理逻辑
      onClick={handleCapture}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 600, fontSize: '14px' }}>
        <Download size={16} />
        <span>Save</span>
      </div>
    </div>
  );
}

function getFavicon() {
    const link = document.querySelector("link[rel~='icon']");
    if (!link) return '/vite.svg'; // Fallback
    return (link as HTMLLinkElement).href;
}
