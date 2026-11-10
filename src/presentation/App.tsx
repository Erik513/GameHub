const layers = ["Presentation", "Business", "Data", "Infrastructure"] as const;

export function App() {
  return (
    <main className="app-shell">
      <section className="foundation-card" aria-labelledby="gamehub-title">
        <p className="eyebrow">Project foundation</p>
        <h1 id="gamehub-title">GameHub</h1>
        <p className="intro">One place for party games.</p>
        <ul className="layer-list" aria-label="Architecture layers">
          {layers.map((layer) => (
            <li key={layer}>{layer}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
