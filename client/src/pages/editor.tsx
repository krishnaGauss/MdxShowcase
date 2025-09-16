import { useState, useCallback, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MdxDocument } from "@shared/schema";
import MdxEditor from "@/components/mdx-editor";
import MdxPreview from "@/components/mdx-preview";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Code, 
  Download, 
  Share, 
  Settings, 
  Undo, 
  Redo, 
  Search,
  Expand,
  Smartphone,
  Tablet,
  ChevronDown
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { processMdx } from "@/lib/mdx-processor";

export default function Editor() {
  const [, params] = useRoute("/editor/:id");
  const documentId = params?.id || "default";
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const { toast } = useToast();

  // Fetch document
  const { data: document, isLoading } = useQuery<MdxDocument>({
    queryKey: ["/api/documents", documentId],
    enabled: !!documentId,
  });

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { title?: string; content?: string }) => {
      const response = await apiRequest("PUT", `/api/documents/${documentId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (!document) return;
    
    const timer = setTimeout(() => {
      if (content !== document.content || title !== document.title) {
        updateMutation.mutate({ content, title });
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [content, title, document, updateMutation]);

  // Initialize content when document loads
  useEffect(() => {
    if (document) {
      setContent(document.content);
      setTitle(document.title);
    }
  }, [document]);

  // Panel resizing
  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || typeof window === 'undefined') return;
    
    const container = window.document.getElementById("editor-container");
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left - 256) / (containerRect.width - 256)) * 100; // Account for sidebar width
    setLeftPanelWidth(Math.max(20, Math.min(80, newWidth)));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing && typeof window !== 'undefined') {
      window.document.addEventListener("mousemove", handleMouseMove);
      window.document.addEventListener("mouseup", handleMouseUp);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.document.removeEventListener("mousemove", handleMouseMove);
        window.document.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleExportMDX = () => {
    if (typeof window === 'undefined') return;
    
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${title || "document"}.mdx`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Your MDX file has been downloaded.",
    });
  };

  const handleExportHTML = () => {
    if (typeof window === 'undefined') return;
    
    // Process MDX to HTML
    const processedHTML = processMdx(content, {}, documentId);
    
    // Create a complete HTML document
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "MDX Document"}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
    .interactive-section-highlight { background: linear-gradient(90deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05)); border-left: 3px solid #22c55e; padding: 1.5rem; border-radius: 0.5rem; margin: 1.5rem 0; }
    .yesno-question-component { background: #1f2937; border: 1px solid #22c55e; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
    button { background: #22c55e; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; margin: 0 0.5rem 0 0; cursor: pointer; }
    button:hover { background: #16a34a; }
    h1 { font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem; }
    h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; }
    p { margin-bottom: 1rem; }
    strong { font-weight: 600; }
    em { font-style: italic; }
    code { background: #374151; color: #fbbf24; padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem; }
    a { color: #22c55e; }
    a:hover { text-decoration: underline; }
    ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 2rem; }
    li { margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  ${processedHTML}
</body>
</html>`;
    
    const blob = new Blob([fullHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${title || "document"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Your HTML file has been downloaded.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Code className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg">Loading MDX editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="editor-page">
      {/* Header */}
      <header className="bg-card border-b border-border" data-testid="header">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code className="text-primary text-xl" />
              <h1 className="text-xl font-bold">MDX Interactive Platform</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">Live Preview</span>
              <span className="bg-accent/20 text-accent px-2 py-1 rounded text-xs">Auto-save</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  data-testid="button-export"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportMDX} data-testid="menu-export-mdx">
                  <Download className="w-4 h-4 mr-2" />
                  Export as MDX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportHTML} data-testid="menu-export-html">
                  <Download className="w-4 h-4 mr-2" />
                  Export as HTML
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              size="sm"
              onClick={handleShare}
              data-testid="button-share"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button variant="ghost" size="sm" data-testid="button-settings">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex h-screen" id="editor-container">
        {/* Sidebar */}
        <Sidebar documentId={documentId} />

        {/* Editor and Preview Container */}
        <div className="flex-1 flex">
          {/* Editor Panel */}
          <div 
            className="flex flex-col"
            style={{ width: `${leftPanelWidth}%` }}
            data-testid="editor-panel"
          >
            {/* Editor Toolbar */}
            <div className="bg-secondary/30 border-b border-border px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium"
                  placeholder="Document title..."
                  data-testid="input-title"
                />
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" data-testid="button-undo">
                  <Undo className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" data-testid="button-redo">
                  <Redo className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" data-testid="button-search">
                  <Search className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Code Editor */}
            <div className="flex-1">
              <MdxEditor
                content={content}
                onChange={setContent}
                data-testid="mdx-editor"
              />
            </div>
          </div>
          
          {/* Resizer */}
          <div 
            className="resizer" 
            onMouseDown={handleMouseDown}
            data-testid="resizer"
          />
          
          {/* Preview Panel */}
          <div 
            className="flex flex-col"
            style={{ width: `${100 - leftPanelWidth}%` }}
            data-testid="preview-panel"
          >
            {/* Preview Toolbar */}
            <div className="bg-secondary/30 border-b border-border px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Live Preview</span>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  <span className="text-xs text-muted-foreground">Updating</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" data-testid="button-expand">
                  <Expand className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" data-testid="button-mobile">
                  <Smartphone className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" data-testid="button-tablet">
                  <Tablet className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="flex-1 overflow-auto">
              <MdxPreview
                content={content}
                documentId={documentId}
                data-testid="mdx-preview"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-secondary border-t border-border px-6 py-2 flex items-center justify-between text-xs" data-testid="status-bar">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span>Connected</span>
          </span>
          <span className="text-muted-foreground">Lines: {content.split('\n').length}</span>
          <span className="text-muted-foreground">Characters: {content.length}</span>
          <span className="text-muted-foreground">
            Shortcodes: {(content.match(/\[(yesno-question|interactivesection)\]/g) || []).length}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-muted-foreground">
            Last saved: {updateMutation.isPending ? "Saving..." : "Auto-saved"}
          </span>
          <span className="text-muted-foreground">MDX v2.3.0</span>
        </div>
      </div>
    </div>
  );
}
