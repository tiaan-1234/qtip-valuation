import { useCallback, useRef, useState } from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function TextInput({ value, onChange, disabled }: TextInputProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const highlightedHtml = useCallback(() => {
    const escaped = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');

    return escaped.replace(
      new RegExp(EMAIL_REGEX.source, 'g'),
      '<span class="email-highlight" data-pii="email">$&</span>'
    );
  }, [value]);

  const handleBackdropMouseOver = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.dataset.pii === 'email') {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltip({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top - 10,
          visible: true,
        });
      }
    }
  };

  const handleBackdropMouseOut = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.dataset.pii === 'email') {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }
  };

  return (
    <div className="text-input-container" ref={containerRef}>
      <textarea
        className="text-input-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter text containing email addresses..."
        rows={8}
      />
      <div
        className="text-input-backdrop"
        dangerouslySetInnerHTML={{ __html: highlightedHtml() }}
        onMouseOver={handleBackdropMouseOver}
        onMouseOut={handleBackdropMouseOut}
      />
      {tooltip.visible && (
        <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          PII – Email Address
        </div>
      )}
    </div>
  );
}
