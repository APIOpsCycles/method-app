"""Set exact source-size media/trim boxes after Chromium's fractional-pixel rounding."""
from pathlib import Path
import sys
import json
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject, NameObject, TextStringObject

name = sys.argv[1] if len(sys.argv) > 1 else 'apiops-cycles-capabilities-booklet-a5'
if not all(c.isalnum() or c == '-' for c in name):
    raise ValueError('Use a simple output name')
target = Path(__file__).resolve().parents[1] / f'output/{name}.pdf'
model = json.loads(target.with_suffix('.resolved.json').read_text(encoding='utf-8'))
title = model['deck']['title']
canvas = model['layouts']['canvas']
width_mm, height_mm = (round(canvas[key] * 25.4 / 96, 3) for key in ['width', 'height'])
paper = {(148, 210): 'A5', (105, 148): 'A6'}.get((width_mm, height_mm), 'portrait')
content_margin = model['layouts']['title']['x'] * 25.4 / 96
qr_mm = model['layouts']['slides']['capabilities-booklet-12']['qr']['w'] * 25.4 / 96
reader = PdfReader(target)
assert len(reader.pages) == 12
writer = PdfWriter()
writer.clone_document_from_reader(reader)
writer.pdf_header = '%PDF-1.7'
for page in writer.pages:
    size = RectangleObject((0, 0, width_mm * 72 / 25.4, height_mm * 72 / 25.4))
    page.mediabox = size
    page.cropbox = RectangleObject(size)
    page.trimbox = RectangleObject(size)
writer.root_object[NameObject('/Lang')] = TextStringObject('en')
writer.add_metadata({'/Title':title,'/Author':'APIOps Cycles / Osaango Ltd'})
with target.open('wb') as stream:
    writer.write(stream)
digital = PdfReader(target)
assert digital.trailer['/Root'].get('/StructTreeRoot'), 'Digital PDF structure lost'
print_writer = PdfWriter()
print_writer.pdf_header = '%PDF-1.7'
mm = 72 / 25.4
for page in digital.pages:
    sheet = print_writer.add_blank_page(width=(width_mm + 6) * mm, height=(height_mm + 6) * mm)
    sheet.merge_translated_page(page, 3 * mm, 3 * mm)
    sheet.trimbox = RectangleObject((3 * mm, 3 * mm, (width_mm + 3) * mm, (height_mm + 3) * mm))
    sheet.bleedbox = RectangleObject((0, 0, (width_mm + 6) * mm, (height_mm + 6) * mm))
print_writer.add_metadata({'/Title':title+' - 3 mm bleed', '/Author':'APIOps Cycles / Osaango Ltd'})
with target.with_name(name + '-print.pdf').open('wb') as stream:
    print_writer.write(stream)
target.with_name(name + '-production-notes.txt').write_text(title.upper()+f''' - PRODUCTION HANDOFF

12 pages in normal reading order. Finished size: {width_mm:g} x {height_mm:g} mm ({paper} portrait).
Print PDF media: {width_mm+6:g} x {height_mm+6:g} mm, including 3 mm white bleed on every edge.
TrimBox: {width_mm:g} x {height_mm:g} mm, inset by 3 mm. No crop marks or imposition.
All page backgrounds are white, so the bleed extends that white background.
Interior reading-order spreads are 2-3, 4-5, 6-7, 8-9 and 10-11.
For the current mirrored layout, the main content has {content_margin:.1f} mm side
margins; all furniture is at least 5 mm from trim and 7 mm from binding.
Small method marks and page numbers alternate to the outside of each spread.
Fonts are embedded. Artwork remains vector in PDF where supplied as SVG.
The separate PowerPoint uses embedded high-resolution PNGs for compatibility.

This is an RGB production draft, not a certified PDF/X file. Confirm the
printer's ICC profile, required PDF standard, stock, binding and imposition
before production. Avoid an arbitrary CMYK conversion without that profile.
The 12-page count supports saddle stitching; the printer should impose pages.
Print at 100 percent / actual size for an {paper} proof. Do not use fit-to-page.

The {qr_mm:.1f} mm QR was decoded from {paper} rasterizations at 100, 150 and 300 dpi.
This is a digital decode check, not a physical print proof. Check the printed
proof's QR and small logo details before committing the print run.

For digital distribution, use the {paper} reading PDF or self-contained reading
HTML. The reading PDF retains structural tags; PDF/UA compliance has not
been independently certified. The HTML provides real headings, navigation,
descriptive alternatives, keyboard links and a responsive reading order.

Before public distribution, deploy the repository's /resources directory and
metro SVG export changes. Generating this booklet does not deploy the website.
''', encoding='utf-8')
print(f'Finalized tagged {paper} reading PDF and {width_mm+6:g} x {height_mm+6:g} mm print PDF with {paper} TrimBox and 3 mm white bleed.')
