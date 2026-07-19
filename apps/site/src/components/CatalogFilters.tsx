import { useState } from "react";

const paths = ["Cycles", "Stations", "Stakeholder guides", "Resources"];

export default function CatalogFilters() {
  const [activePath, setActivePath] = useState(paths[0]);

  return (
    <nav aria-label="Catalog sections" className="catalog-filters">
      {paths.map((path) => (
        <button
          aria-pressed={activePath === path}
          key={path}
          onClick={() => setActivePath(path)}
          type="button"
        >
          {path}
        </button>
      ))}
      <span aria-live="polite">Showing {activePath.toLowerCase()}</span>
    </nav>
  );
}
