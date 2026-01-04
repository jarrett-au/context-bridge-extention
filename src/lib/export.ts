import type { ClipItem } from '../types';

export function formatClipsToMarkdown(clips: ClipItem[]): string {
  return clips.map(clip => {
    return `## [${clip.metadata.source_title}](${clip.metadata.source_url})

${clip.content}

---
*Captured at ${new Date(clip.metadata.timestamp).toLocaleString()}*
`;
  }).join('\n\n');
}

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
