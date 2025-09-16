interface InteractiveSectionProps {
  children: string;
}

export default function InteractiveSection({ children }: InteractiveSectionProps) {
  return (
    <div 
      className="interactive-section-highlight p-6 rounded-lg my-6"
      data-testid="interactive-section"
    >
      <div dangerouslySetInnerHTML={{ __html: children }} />
    </div>
  );
}
