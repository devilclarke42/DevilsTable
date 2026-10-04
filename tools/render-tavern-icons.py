"""Original smoking-pipe vector master in the module's existing muted icon style.
Optional build dependencies: Inkscape and Pillow. Only the 256x256 WebP is shipped.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
SVG='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<rect width="256" height="256" rx="28" fill="#27211e"/>
<g stroke="#d9bd8e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
<path d="M88 151 C128 171 161 146 208 114 L219 125 C169 166 126 192 85 170 Z" fill="#b68157"/>
<path d="M39 88 L52 158 Q73 190 101 157 L112 88 Z" fill="#bb9066"/>
<ellipse cx="75" cy="88" rx="37" ry="15" fill="#6d4932"/>
<ellipse cx="75" cy="88" rx="24" ry="7" fill="#30251e" stroke="none"/>
<path d="M52 110 L62 146" fill="none"/>
</g></svg>'''
with TemporaryDirectory(prefix='devils-table-pipe-') as work:
 source=Path(work)/'pipe.svg';target=Path(work)/'pipe.png';source.write_text(SVG)
 subprocess.run(['inkscape',str(source),'--export-type=png',f'--export-filename={target}','--export-width=256','--export-height=256'],check=True,capture_output=True)
 with Image.open(target) as image:image.convert('RGBA').save(ROOT/'assets/icons/smoking-pipe.webp','WEBP',quality=90,method=6)
