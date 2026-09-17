export function ClientPlaceholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="mt-2 h-px w-16 bg-hud-gold/60" />
      <p className="mt-4 text-hud-muted">{note}</p>
    </div>
  );
}

export function AdminPlaceholder({ title, note }: { title: string; note: string }) {
  return (
    <div>
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="mt-1.5 h-px w-12 bg-hud-gold/60" />
      <p className="mt-3 text-sm text-hud-muted">{note}</p>
    </div>
  );
}
