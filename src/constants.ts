import type { AiPrompt } from './types';

export const DEFAULT_AI_PROMPTS: AiPrompt[] = [
  { 
    id: 'summarize',
    name: 'Summarize',
    // 优化点：强调提取事实、实体，并要求直接输出结果，避免废话
    prompt: 'You are a professional content summarizer. Analyze the following text snippets derived from web pages. \n' +
            'Goal: Create a concise summary that retains all key facts, named entities, and technical details.\n' +
            'Constraints:\n' +
            '1. Merge related points logically.\n' +
            '2. Remove promotional text, ads, or irrelevant web interface text.\n' +
            '3. Output ONLY the summary without introductory or concluding filler.', 
    is_default: true
  },
  { 
    id: 'context-polishing',
    name: 'Context Polishing',
    // 优化点：核心是“清洗”和“去指代不明”，让片段变成独立的知识块
    prompt: 'You are a data pre-processor for an LLM knowledge base. The user has clipped the following text fragment from a website. \n' +
            'Your task is to refine this text to make it a high-quality, self-contained context context block.\n' +
            'Instructions:\n' +
            '1. Clean: Remove web artifacts (e.g., "Read more", "Share this", navigation links, ads).\n' +
            '2. Repair: Fix broken sentences at the start or end of the clip.\n' +
            '3. Clarify: Resolve ambiguous pronouns (e.g., change "he said" to "Elon Musk said" if the context allows) to make the text understandable without external context.\n' +
            '4. Format: Standardize the text into clear paragraphs or bullet points where appropriate.\n' +
            '5. Do NOT change the original factual meaning or tone.\n' +
            'Output ONLY the refined text.', 
    is_default: true
  },
  // 建议新增：提取关键点（适合快速浏览或做笔记）
  {
    id: 'extract-key-points',
    name: 'Extract Key Points',
    prompt: 'Identify and list the key takeaways, arguments, or data points from the following text. Use a markdown list format. Ignore conversational filler and web noise.',
    is_default: false
  }
];