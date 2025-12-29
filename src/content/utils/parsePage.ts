import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';

export async function parsePageContent() {
  // Clone the document to avoid modifying the live page
  const documentClone = document.cloneNode(true) as Document;
  
  // Use Readability to parse the content
  const reader = new Readability(documentClone);
  const article = reader.parse();

  if (!article) {
    throw new Error('Failed to parse page content');
  }

  // Convert HTML to Markdown
  const turndownService = new TurndownService();
  const markdown = turndownService.turndown(article.content || '');

  return {
    title: article.title,
    content: markdown,
    excerpt: article.excerpt,
    byline: article.byline,
    siteName: article.siteName
  };
}
