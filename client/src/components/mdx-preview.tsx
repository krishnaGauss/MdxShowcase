import { useMemo } from "react";
import { processMdx } from "@/lib/mdx-processor";
import YesNoQuestion from "@/components/shortcodes/yesno-question";
import InteractiveSection from "@/components/shortcodes/interactive-section";

interface MdxPreviewProps {
  content: string;
  documentId: string;
}

export default function MdxPreview({ content, documentId }: MdxPreviewProps) {
  const processedContent = useMemo(() => {
    return processMdx(content, {
      'yesno-question': YesNoQuestion,
      'interactivesection': InteractiveSection,
    }, documentId);
  }, [content, documentId]);

  return (
    <div className="p-6 bg-background overflow-auto scroll-smooth" data-testid="mdx-preview-content">
      <div className="max-w-4xl mx-auto prose prose-invert">
        <div dangerouslySetInnerHTML={{ __html: processedContent }} />
      </div>
    </div>
  );
}
