// Renderer for the same JSON model used by the editable PPTX exporter.
// No dependency on the partner's private template or preview packages.
#let render-deck(model) = {
  let t = model.theme
  let l = model.layouts
  let px = 0.75pt
  let col(key) = rgb(t.colors.at(key))
  set page(width: l.canvas.width * px, height: l.canvas.height * px,
    margin: 0pt, fill: col("background"))
  set text(font: (t.font, "Arial"), fill: col("body"), hyphenate: false, lang: model.deck.language)
  set par(leading: 0.28em, spacing: 0pt)
  let put(b, body) = place(top + left, dx: b.x * px, dy: b.y * px,
    block(width: b.w * px, height: b.h * px, clip: false, body))
  let words(value, font: t.font) = {
    for (i, line) in value.split("\n").enumerate() {
      if i > 0 { linebreak() }
      text(font: (font, "Arial"), line)
    }
  }
  for (i, s) in model.slides.enumerate() {
    if i > 0 { pagebreak() }
    put(l.logo, image("../" + t.logo, width: l.logo.w * px, height: l.logo.h * px, fit: "contain"))
    put(l.pageNumber, text(size: l.pageNumber.fontSize * px, fill: col("muted"), str(i + 1)))
    if s.title != "" { put(l.title, text(size: l.title.fontSize * px, weight: "bold", fill: col("heading"), words(s.title))) }
    for e in s.elements {
      let b = l.slides.at(s.id).at(e.id)
      let body = if e.type == "image" {
        image("../assets/" + e.asset, width: b.w * px, height: b.h * px,
          fit: if e.fit == "cover" { "cover" } else { "contain" })
      } else if e.type == "table" {
        set text(size: b.fontSize * px)
        table(columns: b.columnWidths.map(w => w * px),
          rows: (b.h / e.rows.len() * px,) * e.rows.len(),
          inset: (x: 7.5pt, y: 5.25pt),
          stroke: 0.75pt + col("tableBorder"),
          ..e.rows.enumerate().map(((r, row)) => row.enumerate().map(((c, value)) => {
            let bold = (e.header and r == 0) or (e.emphasizeFirstColumn and c == 0)
            table.cell(fill: col(if e.header and r == 0 { "tableHeader" } else if calc.odd(r) { "tableAlternate" } else { "background" }),
              text(weight: if bold { "bold" } else { "regular" }, words(value)))
          })).flatten())
      } else if e.type == "numbered" or e.type == "bullets" {
        set text(size: b.fontSize * px, fill: col(b.color))
        let items = e.items.map(words)
        if e.type == "numbered" {
          enum(numbering: "1.", indent: 0pt, body-indent: 18pt, tight: false, spacing: b.spaceAfter * 1pt, ..items)
        } else {
          list(indent: 0pt, body-indent: 18pt, tight: false, spacing: b.spaceAfter * 1pt, ..items)
        }
      } else {
        text(font: if e.type == "code" { t.codeFont } else { t.font },
          size: b.fontSize * px, weight: if b.bold { "bold" } else { "regular" },
          fill: col(b.color), words(e.text, font: if e.type == "code" { t.codeFont } else { t.font }))
      }
      put(b, body)
    }
    put((x: 64, y: 704, w: 1100, h: 14), text(size: 9pt, fill: col("muted"), t.footer))
    // Speaker notes remain in *.notes.md and native PPTX notes; they are not audience content.
    // Occupy exactly one page even though all content is positioned.
    box(width: 1pt, height: 1pt)
  }
}
