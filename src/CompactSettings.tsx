import { useState, type ReactNode } from 'react';

/** Keep remembered settings visible without making phone players repeat setup. */
export default function CompactSettings({ summary, detail, children }: {
  summary: string; detail: string; children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  return <div className="compact-settings">
    <div className="settings-overview" aria-label="Selected settings"><strong>{summary}</strong><p>{detail}</p></div>
    <details className="setup-settings" open={expanded} onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary>{expanded ? 'Hide settings' : 'Change settings'}</summary>
      {children}
    </details>
  </div>;
}
