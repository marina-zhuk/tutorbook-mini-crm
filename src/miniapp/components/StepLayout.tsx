import type { ReactNode } from "react";

export function StepLayout({
  eyebrow,
  title,
  description,
  children,
  footer
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="step-screen">
      <div className="step-heading">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        <span>{description}</span>
      </div>
      <div className="step-content">{children}</div>
      <div className="step-footer">{footer}</div>
    </div>
  );
}
