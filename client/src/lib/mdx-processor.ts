import { parseShortcodes } from "./shortcode-parser";

interface ComponentMap {
  [key: string]: React.ComponentType<any>;
}

export function processMdx(content: string, components: ComponentMap, documentId: string): string {
  // First, parse shortcodes and replace them with component placeholders
  const processedContent = parseShortcodes(content, documentId);
  
  // Convert markdown to HTML (basic implementation)
  let html = processedContent
    // Headers
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    
    // Code
    .replace(/`(.+?)`/g, '<code class="bg-secondary px-2 py-1 rounded text-accent text-sm">$1</code>')
    
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
    
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*<\/li>)/g, '<ul class="list-disc pl-6 space-y-2 mb-8">$1</ul>')
    
    // Paragraphs (simple implementation)
    .split('\n\n')
    .map(paragraph => {
      if (paragraph.trim() === '') return '';
      if (paragraph.includes('<h') || paragraph.includes('<ul') || paragraph.includes('COMPONENT:')) {
        return paragraph;
      }
      return `<p class="mb-4 text-foreground">${paragraph.trim()}</p>`;
    })
    .join('\n');

  return html;
}
