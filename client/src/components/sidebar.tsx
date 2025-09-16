import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Sparkles, Code, BookOpen, FileText, Lightbulb, ExternalLink } from "lucide-react";

interface SidebarProps {
  documentId: string;
}

export default function Sidebar({ documentId }: SidebarProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [syntaxHighlighting, setSyntaxHighlighting] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(false);

  const shortcodes = [
    {
      name: "Yes/No Question",
      key: "yesno-question",
      icon: HelpCircle,
      description: "Interactive binary choice component",
      template: '[yesno-question question="Your question here?"]',
    },
    {
      name: "Interactive Section",
      key: "interactivesection",
      icon: Sparkles,
      description: "Highlighted content area with animations",
      template: '[interactivesection]\nYour content here\n[/interactivesection]',
    },
  ];

  const insertShortcode = (template: string) => {
    // This would typically integrate with the Monaco editor
    // For now, we'll just copy to clipboard
    navigator.clipboard.writeText(template);
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      {/* Shortcode Library */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold mb-3" data-testid="shortcode-library-title">Shortcode Library</h3>
        <div className="space-y-2">
          {shortcodes.map((shortcode) => (
            <Card 
              key={shortcode.key}
              className="p-3 bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => insertShortcode(shortcode.template)}
              data-testid={`shortcode-${shortcode.key}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{shortcode.name}</span>
                <shortcode.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {shortcode.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Preview Settings */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold mb-3" data-testid="preview-settings-title">Preview Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={(checked) => setAutoRefresh(checked === true)}
              data-testid="checkbox-auto-refresh"
            />
            <label 
              htmlFor="auto-refresh" 
              className="text-sm cursor-pointer"
            >
              Auto-refresh preview
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="syntax-highlighting"
              checked={syntaxHighlighting}
              onCheckedChange={(checked) => setSyntaxHighlighting(checked === true)}
              data-testid="checkbox-syntax-highlighting"
            />
            <label 
              htmlFor="syntax-highlighting" 
              className="text-sm cursor-pointer"
            >
              Syntax highlighting
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="line-numbers"
              checked={lineNumbers}
              onCheckedChange={(checked) => setLineNumbers(checked === true)}
              data-testid="checkbox-line-numbers"
            />
            <label 
              htmlFor="line-numbers" 
              className="text-sm cursor-pointer"
            >
              Show line numbers
            </label>
          </div>
        </div>
      </div>
      
      {/* Documentation */}
      <div className="flex-1 p-4">
        <h3 className="font-semibold mb-3" data-testid="documentation-title">Documentation</h3>
        <div className="space-y-2 text-sm">
          <Button 
            variant="ghost" 
            className="w-full justify-start h-auto p-2 text-left"
            data-testid="link-getting-started"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Getting Started
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start h-auto p-2 text-left text-muted-foreground hover:text-foreground"
            data-testid="link-shortcode-reference"
          >
            <Code className="w-4 h-4 mr-2" />
            Shortcode Reference
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start h-auto p-2 text-left text-muted-foreground hover:text-foreground"
            data-testid="link-api-docs"
          >
            <FileText className="w-4 h-4 mr-2" />
            API Documentation
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start h-auto p-2 text-left text-muted-foreground hover:text-foreground"
            data-testid="link-examples"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Examples
          </Button>
        </div>
      </div>
    </div>
  );
}
