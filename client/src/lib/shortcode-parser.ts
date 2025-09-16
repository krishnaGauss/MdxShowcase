export interface ShortcodeMatch {
  type: string;
  attributes: Record<string, string>;
  content?: string;
  fullMatch: string;
  index: number;
}

export function parseShortcodes(content: string, documentId: string): string {
  let processedContent = content;
  let questionCounter = 0;

  // Handle [interactivesection] shortcodes
  processedContent = processedContent.replace(
    /\[interactivesection\]([\s\S]*?)\[\/interactivesection\]/g,
    (match, sectionContent) => {
      const processedSectionContent = sectionContent
        .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mb-4">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-6">$1</h1>')
        .split('\n\n')
        .map((paragraph: string) => {
          if (paragraph.trim() === '' || paragraph.includes('<h')) return paragraph;
          return `<p class="mb-4">${paragraph.trim()}</p>`;
        })
        .join('\n');

      return `<div class="interactive-section-highlight p-6 rounded-lg my-6" data-testid="interactive-section">
        ${processedSectionContent}
      </div>`;
    }
  );

  // Handle [yesno-question] shortcodes
  processedContent = processedContent.replace(
    /\[yesno-question\s+question="([^"]+)"\]/g,
    (match, question) => {
      questionCounter++;
      const questionId = `q${questionCounter}`;
      
      return `<div class="yesno-question-component" data-testid="yesno-question-${questionId}">
        <p class="font-medium mb-4">${question}</p>
        <div class="flex space-x-3 mb-3">
          <button 
            class="bg-primary hover:bg-primary/80 text-primary-foreground px-4 py-2 rounded-md transition-colors flex items-center"
            onclick="handleYesNoResponse('${documentId}', '${questionId}', 'yes')"
            data-testid="button-yes-${questionId}"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            Yes
          </button>
          <button 
            class="bg-destructive hover:bg-destructive/80 text-destructive-foreground px-4 py-2 rounded-md transition-colors flex items-center"
            onclick="handleYesNoResponse('${documentId}', '${questionId}', 'no')"
            data-testid="button-no-${questionId}"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
            No
          </button>
        </div>
        <div class="text-sm text-muted-foreground">
          <span id="response-count-${questionId}">Loading responses...</span>
        </div>
      </div>
      
      <script>
        (function() {
          fetch('/api/responses/${documentId}/${questionId}/counts')
            .then(res => res.json())
            .then(data => {
              const total = data.yes + data.no;
              document.getElementById('response-count-${questionId}').textContent = total + ' responses so far';
            })
            .catch(() => {
              document.getElementById('response-count-${questionId}').textContent = '0 responses so far';
            });
        })();
      </script>`;
    }
  );

  // Add global script for handling yes/no responses
  if (processedContent.includes('yesno-question-component')) {
    processedContent += `
      <script>
        if (!window.handleYesNoResponse) {
          window.handleYesNoResponse = function(documentId, questionId, response) {
            const sessionId = sessionStorage.getItem('sessionId') || crypto.randomUUID();
            sessionStorage.setItem('sessionId', sessionId);
          
          fetch('/api/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId, questionId, response, sessionId })
          })
          .then(res => res.json())
          .then(() => {
            // Refresh counts
            return fetch('/api/responses/' + documentId + '/' + questionId + '/counts');
          })
          .then(res => res.json())
          .then(data => {
            const total = data.yes + data.no;
            const countElement = document.getElementById('response-count-' + questionId);
            if (countElement) {
              countElement.textContent = total + ' responses so far · You answered: ' + response;
            }
            
            // Disable buttons
            const yesBtn = document.querySelector('[data-testid="button-yes-' + questionId + '"]');
            const noBtn = document.querySelector('[data-testid="button-no-' + questionId + '"]');
            if (yesBtn) yesBtn.disabled = true;
            if (noBtn) noBtn.disabled = true;
          })
          .catch(err => {
            console.error('Failed to record response:', err);
          });
          };
        }
      </script>
    `;
  }

  return processedContent;
}

export function extractShortcodes(content: string): ShortcodeMatch[] {
  const shortcodes: ShortcodeMatch[] = [];
  
  // Match [yesno-question] shortcodes
  const yesnoRegex = /\[yesno-question\s+question="([^"]+)"\]/g;
  let match;
  
  while ((match = yesnoRegex.exec(content)) !== null) {
    shortcodes.push({
      type: 'yesno-question',
      attributes: { question: match[1] },
      fullMatch: match[0],
      index: match.index,
    });
  }
  
  // Match [interactivesection] shortcodes
  const sectionRegex = /\[interactivesection\]([\s\S]*?)\[\/interactivesection\]/g;
  
  while ((match = sectionRegex.exec(content)) !== null) {
    shortcodes.push({
      type: 'interactivesection',
      attributes: {},
      content: match[1],
      fullMatch: match[0],
      index: match.index,
    });
  }
  
  return shortcodes.sort((a, b) => a.index - b.index);
}
