"""Generate the booklet's QR locally. Includes a four-module quiet zone."""
from pathlib import Path
from reportlab.graphics.barcode import qrencoder

qr = qrencoder.QRCode(None, qrencoder.QRErrorCorrectLevel.Q)
qr.addData('https://apiopscycles.com/#metro-map-title')
qr.make()
quiet = 4
n = qr.getModuleCount()
side = n + quiet * 2
rects = ''.join(f'<rect x="{c+quiet}" y="{r+quiet}" width="1" height="1"/>'
                for r in range(n) for c in range(n) if qr.isDark(r,c))
svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 {side} {side}"><rect width="{side}" height="{side}" fill="white"/><g fill="black">{rects}</g></svg>'
(Path(__file__).resolve().parents[1] / 'assets/capabilities-booklet-method-qr.svg').write_text(svg, encoding='utf-8')
