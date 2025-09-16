import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

interface MdxEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export default function MdxEditor({ content, onChange }: MdxEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Define MDX language
    monaco.languages.register({ id: 'mdx' });

    // Define syntax highlighting for MDX
    monaco.languages.setMonarchTokensProvider('mdx', {
      tokenizer: {
        root: [
          // Shortcodes
          [/\[(yesno-question|interactivesection)\]/, 'shortcode'],
          [/\[\/?(yesno-question|interactivesection)\]/, 'shortcode'],
          [/\[yesno-question\s+question="[^"]*"\]/, 'shortcode'],
          
          // Markdown headers
          [/^#{1,6}\s.*$/, 'comment'],
          
          // Bold and italic
          [/\*\*.*?\*\*/, 'keyword'],
          [/\*.*?\*/, 'keyword'],
          
          // Code blocks
          [/`.*?`/, 'string'],
          
          // Links
          [/\[.*?\]\(.*?\)/, 'tag'],
          
          // Everything else
          [/.*/, 'text'],
        ],
      },
    });

    // Create editor instance
    const editor = monaco.editor.create(editorRef.current, {
      value: content,
      language: 'mdx',
      theme: 'vs-dark',
      fontSize: 14,
      lineHeight: 1.6,
      fontFamily: 'JetBrains Mono, monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      lineNumbers: 'on',
      folding: true,
      renderWhitespace: 'none',
      tabSize: 2,
      insertSpaces: true,
    });

    monacoEditorRef.current = editor;

    // Listen for content changes
    const disposable = editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      onChange(value);
    });

    return () => {
      disposable.dispose();
      editor.dispose();
    };
  }, []);

  // Update editor content when prop changes
  useEffect(() => {
    if (monacoEditorRef.current && content !== monacoEditorRef.current.getValue()) {
      monacoEditorRef.current.setValue(content);
    }
  }, [content]);

  return (
    <div 
      ref={editorRef} 
      className="h-full w-full editor-font"
      data-testid="monaco-editor"
    />
  );
}
