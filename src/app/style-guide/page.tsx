export default function StyleGuide() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <header className="space-y-2">
        <div className="typ-eyebrow">Style Guide</div>
        <h1 className="typ-h1">Design Tokens & Components</h1>
        <p className="text-muted max-w-2xl">Quick preview of the theme: palette, typography, buttons, inputs, cards, and badges. Dark theme is default.</p>
      </header>

      {/* Palette */}
      <section>
        <div className="typ-eyebrow mb-3">Palette</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: 'Background', var: '--background' },
            { name: 'Surface', var: '--surface' },
            { name: 'Surface 2', var: '--surface-2' },
            { name: 'Surface 3', var: '--surface-3' },
            { name: 'Foreground', var: '--foreground' },
            { name: 'Primary', var: '--primary' },
            { name: 'Accent', var: '--accent' },
            { name: 'Border', var: '--border' },
            { name: 'Muted', var: '--muted' },
          ].map((t) => (
            <div key={t.name} className="card shadow-card-sm p-4">
              <div className="h-12 w-full rounded border" style={{ background: `var(${t.var})`, borderColor: 'var(--border)' }} />
              <div className="mt-2 text-sm font-medium">{t.name}</div>
              <div className="text-xs text-muted">var({t.var})</div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-3">
        <div className="typ-eyebrow">Typography</div>
        <div className="typ-display">Display – Bold athletic headline</div>
        <div className="typ-h1">H1 – Section headline</div>
        <div className="typ-h2">H2 – Subsection headline</div>
        <div className="typ-h3">H3 – Widget title</div>
        <div className="typ-h4">H4 – Minor title</div>
        <div className="typ-overline">OVERLINE – micro label</div>
        <p className="text-muted max-w-2xl">Body – Secondary copy uses reduced contrast for readability on dark.</p>
      </section>

      {/* Buttons */}
      <section className="space-y-3">
        <div className="typ-eyebrow">Buttons</div>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-ghost">Ghost</button>
          <button className="btn btn-destructive">Destructive</button>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-3">
        <div className="typ-eyebrow">Inputs</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="input" placeholder="Text input" />
          <select className="input">
            <option>Option A</option>
            <option>Option B</option>
          </select>
        </div>
      </section>

      {/* Cards & Badges */}
      <section className="space-y-3">
        <div className="typ-eyebrow">Cards & Badges</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="card shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="typ-h4">Card Title</div>
              <span className="badge badge-primary">Primary</span>
            </div>
            <p className="text-muted">This card uses the theme surfaces, borders, and shadows.</p>
          </div>
          <div className="card shadow-card-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="typ-h4">Another Card</div>
              <span className="badge badge-accent">Accent</span>
            </div>
            <p className="text-muted">A heavier elevation for emphasis or modals.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
