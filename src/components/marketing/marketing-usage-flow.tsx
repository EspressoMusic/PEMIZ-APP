"use client";

const STEP_ICONS = [
  (
    <svg key="store" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  (
    <svg key="products" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
      <rect x="3" y="3" width="18" height="18" rx="3" />
    </svg>
  ),
  (
    <svg key="share" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  (
    <svg key="orders" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
];

export function MarketingUsageFlow({
  steps,
}: {
  steps: { title: string; body: string }[];
}) {
  return (
    <div className="usage-flow">
      <div className="usage-flow-track" aria-hidden="true">
        <div className="usage-flow-line usage-flow-line--base" />
        <div className="usage-flow-line usage-flow-line--glow" />
        <div className="usage-flow-pulse" />
      </div>

      <ol className="usage-flow-steps">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="usage-step"
            data-reveal="scale"
            style={{ transitionDelay: `${i * 0.12}s` }}
          >
            <div className="usage-step-node">
              <span className="usage-step-ring" aria-hidden="true" />
              <span className="usage-step-num">{i + 1}</span>
              <div className="usage-step-icon">{STEP_ICONS[i]}</div>
            </div>
            <div className="usage-step-copy">
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
