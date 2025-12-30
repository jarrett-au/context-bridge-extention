export interface ClipItem {
  id: string;              // UUID
  type: 'text' | 'code' | 'page_content' | 'ai_response';
  content: string;         // 清洗后的 Markdown
  raw_html?: string;       // 可选，保留原始 HTML 以备重新解析
  metadata: {
    source_url: string;
    source_title: string;
    timestamp: number;
    favicon: string;
  };
  status: 'staging' | 'archived' | 'synthesis'; // 当前处于哪个区域
  token_estimate: number;  // 简单的估算值 (字符数 / 4)
}

export interface SynthesisItem extends ClipItem {
  is_synthesized: true;
  parent_ids: string[];    // 关联的原始碎片 ID，用于溯源
  template_used: string;   // 使用的模板类型
}

export interface AiPrompt {
  id: string;
  name: string;
  prompt: string;
  is_default?: boolean;
}
