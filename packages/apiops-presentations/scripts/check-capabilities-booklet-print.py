"""Check physical boxes and actual font streams, without claiming PDF/X conformance."""
from pathlib import Path
from pypdf import PdfReader
import json
import sys

root = Path(__file__).resolve().parents[1]
name = sys.argv[1] if len(sys.argv) > 1 else 'apiops-cycles-capabilities-booklet-a5'
report = {'formats': [], 'fonts': {}, 'color': 'RGB, no printer-specific ICC conversion', 'physical_proof': 'Not performed'}
model = json.loads((root / f'output/{name}.resolved.json').read_text(encoding='utf-8'))
width_mm, height_mm = (round(model['layouts']['canvas'][key] * 25.4 / 96, 3) for key in ['width', 'height'])
if 'a5' in name:
    assert (width_mm, height_mm) == (148, 210), 'A5 output must be 148 x 210 mm'

def fonts(resources):
    for reference in resources.get('/Font', {}).values():
        font = reference.get_object()
        descendants = font.get('/DescendantFonts', [font])
        for descendant in descendants:
            descendant = descendant.get_object()
            descriptor = descendant.get('/FontDescriptor')
            assert descriptor, f'Missing font descriptor: {font.get("/BaseFont")}'
            descriptor = descriptor.get_object()
            stream = next((descriptor[k] for k in ['/FontFile', '/FontFile2', '/FontFile3'] if k in descriptor), None)
            assert stream and len(stream.get_object().get_data()) > 0, f'Unembedded font: {font.get("/BaseFont")}'
            report['fonts'][str(font['/BaseFont'])] = 'embedded'
    for xobject in resources.get('/XObject', {}).values():
        obj = xobject.get_object()
        if obj.get('/Subtype') == '/Form' and obj.get('/Resources'):
            fonts(obj['/Resources'])

for suffix, dimensions in [('', (width_mm, height_mm)), ('-print', (width_mm+6, height_mm+6))]:
    reader = PdfReader(root / f'output/{name}{suffix}.pdf')
    assert len(reader.pages) == 12
    for page in reader.pages:
        actual = (float(page.mediabox.width) * 25.4 / 72, float(page.mediabox.height) * 25.4 / 72)
        assert all(abs(x-y) < 0.001 for x, y in zip(actual, dimensions))
        fonts(page['/Resources'])
        if suffix:
            assert abs(float(page.trimbox.left) * 25.4 / 72 - 3) < 0.001
            assert abs(float(page.trimbox.bottom) * 25.4 / 72 - 3) < 0.001
            assert abs(float(page.trimbox.width) * 25.4 / 72 - width_mm) < 0.001
            assert abs(float(page.trimbox.height) * 25.4 / 72 - height_mm) < 0.001
    tagged = bool(reader.trailer['/Root'].get('/StructTreeRoot'))
    if not suffix:
        assert tagged, 'Reading PDF must retain structural tags'
    report['formats'].append({'file': name+suffix+'.pdf', 'pages': 12, 'mediaMm': dimensions, 'tagged': tagged})

(root / f'output/{name}-previews/print-check.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
