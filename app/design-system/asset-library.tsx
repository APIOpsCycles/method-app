"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { MaterialIcon } from "../material-icon";
import type { AssetColor, AssetItem } from "./assets";

const categories = ["All", "Material icon", "Method icon", "Journey glyph", "Human pose", "Human story", "Brand glyph"];
const colors = ["All", "strategy", "product", "architecture", "engineering", "operations", "community", "neutral"];

const assetAccentByColor: Record<AssetColor, string> = {
  strategy: "var(--apiops-accent-strategy)",
  product: "var(--apiops-accent-product)",
  architecture: "var(--apiops-accent-architecture)",
  engineering: "var(--apiops-accent-engineering)",
  operations: "var(--apiops-accent-operations)",
  community: "var(--apiops-accent-community)",
  neutral: "var(--color-neutral-stone)",
};

function SvgSpritePreview({ item }: { item: AssetItem }) {
  const accent = assetAccentByColor[item.color] ?? "var(--apiops-accent-product)";
  const style = { "--apiops-accent": accent } as CSSProperties;
  const viewBox = item.viewBox ?? "0 0 96 96";

  return item.materialIcon ? (
    <MaterialIcon className="ds-asset-symbol" name={item.materialIcon} />
  ) : item.symbolId ? (
    <svg aria-hidden="true" className="ds-asset-symbol" style={style} viewBox={viewBox}>
      <use href={`${item.source}#${item.symbolId}`} />
    </svg>
  ) : (
    <img alt="" className="ds-asset-image" src={item.source} />
  );
}

function parseSizes(sizes: string) {
  return sizes
    .split(",")
    .map((size) => Number.parseInt(size.trim(), 10))
    .filter((size) => Number.isFinite(size) && size > 0);
}

function AssetSizePreview({ item, sizes }: { item: AssetItem; sizes: number[] }) {
  const accent = assetAccentByColor[item.color] ?? "var(--apiops-accent-product)";
  const viewBox = item.viewBox ?? "0 0 96 96";

  return (
    <div className="ds-asset-size-preview" aria-label={`Recommended rendered sizes for ${item.title}`}>
      {sizes.map((size) => {
        const style = {
          "--apiops-accent": accent,
          height: `${size}px`,
          width: `${size}px`,
        } as CSSProperties;
        return (
          <figure key={size}>
            {item.materialIcon ? (
              <MaterialIcon className="ds-asset-size-symbol" name={item.materialIcon} style={style} />
            ) : item.symbolId ? (
              <svg aria-hidden="true" className="ds-asset-size-symbol" style={style} viewBox={viewBox}>
                <use href={`${item.source}#${item.symbolId}`} />
              </svg>
            ) : (
              <img alt="" className="ds-asset-size-image" src={item.source} style={style} />
            )}
            <figcaption>{size}px</figcaption>
          </figure>
        );
      })}
    </div>
  );
}

export default function AssetLibrary({ assets }: { assets: AssetItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [color, setColor] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesQuery =
        !normalized ||
        [asset.id, asset.title, asset.category, asset.semantic].some((value) =>
          value.toLowerCase().includes(normalized),
        );
      const matchesCategory = category === "All" || asset.category === category;
      const matchesColor = color === "All" || asset.color === color;
      return matchesQuery && matchesCategory && matchesColor;
    });
  }, [assets, category, color, query]);

  async function copySnippet(id: string, snippet: string) {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1600);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <section className="ds-section" id="asset-library">
      <div className="ds-section__head">
        <p className="section-kicker">Asset Library</p>
        <h2>Search icons, glyphs, and human figures</h2>
        <p>
          Previews reference the existing sprite files. Use the symbol ID and source path in product UI instead of
          duplicating SVG geometry. Recommended sizes are rendered dimensions; the SVG viewBox stays the same.
        </p>
      </div>
      <div className="ds-filterbar" role="search">
        <label>
          <span>Search</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assets" />
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Color</span>
          <select value={color} onChange={(event) => setColor(event.target.value)}>
            {colors.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="ds-asset-grid" aria-live="polite">
        {filtered.map((asset) => {
          const accent = assetAccentByColor[asset.color] ?? "var(--apiops-accent-product)";
          const sizes = parseSizes(asset.sizes);
          const defaultSize = sizes[0] ?? 32;
          const viewBox = asset.viewBox ?? "0 0 96 96";
          const snippet = asset.materialIcon
            ? `<MaterialIcon name="${asset.materialIcon}" aria-hidden="true" />`
            : asset.symbolId
            ? `<svg width="${defaultSize}" height="${defaultSize}" style="--apiops-accent: ${accent}" viewBox="${viewBox}" aria-hidden="true"><use href="${asset.source}#${asset.symbolId}" /></svg>`
            : `<img src="${asset.source}" width="${defaultSize}" height="${defaultSize}" alt="" />`;
          return (
            <article className="ds-asset-card" key={asset.id}>
              <div className="ds-asset-preview">
                <SvgSpritePreview item={asset} />
              </div>
              <div>
                <h3>{asset.title}</h3>
                <p>{asset.semantic}</p>
              </div>
              <dl>
                <div>
                  <dt>Status</dt>
                  <dd>{asset.status}</dd>
                </div>
                <div>
                  <dt>ID</dt>
                  <dd>{asset.symbolId ?? asset.id}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{asset.category}</dd>
                </div>
                <div>
                  <dt>Source</dt>
                  <dd>{asset.source}</dd>
                </div>
                <div>
                  <dt>Use</dt>
                  <dd>{asset.recommendedUse}</dd>
                </div>
                <div>
                  <dt>Sizes</dt>
                  <dd>{asset.sizes}px</dd>
                </div>
              </dl>
              {sizes.length ? <AssetSizePreview item={asset} sizes={sizes} /> : null}
              <details className="ds-asset-code">
                <summary>Usage snippet</summary>
                <pre className="ds-usage-snippet">{snippet}</pre>
              </details>
              <pre className="ds-usage-snippet ds-usage-snippet--print">{snippet}</pre>
              <button className="ds-copy-button" type="button" onClick={() => copySnippet(asset.id, snippet)}>
                {copiedId === asset.id ? "Copied" : "Copy snippet"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
