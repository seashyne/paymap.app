"use client";
import { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon ? <div className="empty-state__icon">{icon}</div> : null}
      <div className="text-lg font-bold">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-3)]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
