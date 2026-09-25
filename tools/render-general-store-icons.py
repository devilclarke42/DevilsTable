"""Reproduce the original Sprint 3 icons; optional artwork dependencies: Inkscape and Pillow.

Run from any directory with Python 3. Runtime output is static 256x256 WebP only.
The vector instructions below are editable masters, outside the installed module payload.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
DRAWINGS = {
    "crowbar": '<path d="M75 207 170 63q12-26 29-17l9 11-20 16-10-3-83 145z" fill="#8e9b9b"/><path d="m83 207 11 8-20 14-7-5z" fill="#bbc5bd"/><path d="m98 187 66-103" stroke="#c4cbbd"/>',
    "whetstone": '<path d="m43 132 113-59 58 35-113 66z" fill="#a2a08b"/><path d="m43 132 58 42v30l-58-38z" fill="#5b655f"/><path d="m101 174 113-66v33l-113 63z" fill="#78847c"/><path d="m76 128 77-40m-43 57 75-42" stroke="#c5c3a8"/>',
    "writing-tablet": '<rect x="42" y="43" width="172" height="175" rx="12" fill="#8c623b"/><rect x="57" y="60" width="142" height="141" rx="4" fill="#657369"/><path d="m75 96 107-1m-107 25h94m-94 25h106m-106 25h66" stroke="#d8ccaa" stroke-width="4"/><path d="m205 70-50 148 8 3 49-148z" fill="#d4ba85"/>',
    "comb": '<path d="M42 91q88-45 172 0v27H42z" fill="#d2bd94"/><path d="M44 118v69m17-69v69m17-69v69m17-69v69m17-69v69m17-69v69m17-69v69m17-69v69m17-69v69m17-69v69m17-69v69" stroke="#d2bd94" stroke-width="9"/><path d="M62 94q67-24 133 0" stroke="#a68d67"/>',
    "candle-holder": '<ellipse cx="116" cy="189" rx="77" ry="21" fill="#687371"/><path d="M110 167v-48h25v51" fill="#899590"/><ellipse cx="122" cy="120" rx="24" ry="9" fill="#505e5b"/><path d="M188 176c44-39 50 19 3 18" stroke="#a2aaa0" stroke-width="13"/><path d="M64 184q49 17 99 0" stroke="#bcc3af"/>',
    "candle-snuffer": '<path d="m57 211 93-127" stroke="#b69a62" stroke-width="12"/><path d="m139 62-29 71q39 24 70 0l-24-71z" fill="#bc9b60"/><ellipse cx="145" cy="134" rx="35" ry="11" fill="#584b36"/><path d="m134 84-12 33" stroke="#e0c591"/>',
    "mortar-pestle": '<path d="M51 126q7 87 76 87t77-87z" fill="#8b9388"/><ellipse cx="127" cy="126" rx="76" ry="27" fill="#667368"/><path d="m118 130 51-88q8-9 20-2t6 17l-55 90q-15 13-23-1z" fill="#c4c5ac"/><path d="M69 158q16 35 43 38" stroke="#bcc3aa"/>',
    "document-case": '<path d="m76 199 18-140q43-24 79 8l-18 140q-44 18-79-8z" fill="#996844"/><ellipse cx="134" cy="58" rx="41" ry="15" fill="#b98c5b"/><path d="m91 79q43 24 81 3m-92 98q43 22 78 4" stroke="#d8b381"/><path d="m171 98 30 96-40 18" stroke="#aa8254" stroke-width="9"/>',
    "buttons": '<circle cx="87" cy="91" r="43" fill="#af804d"/><circle cx="165" cy="163" r="46" fill="#967043"/><circle cx="87" cy="91" r="31" stroke="#dec396"/><circle cx="165" cy="163" r="34" stroke="#dec396"/><g fill="#3c3023" stroke="none"><circle cx="77" cy="91" r="6"/><circle cx="97" cy="91" r="6"/><circle cx="154" cy="163" r="6"/><circle cx="176" cy="163" r="6"/></g>',
    "clothes-pegs": '<g fill="#c6a470"><path d="M55 50q17-17 30 0l15 154-17 2-15-95-1 98-18-1z"/><path d="M156 50q16-11 28 7l-2 154-18-1-2-95-17 95-18-4z"/></g><path d="m66 62 9 44m95-41-5 43" stroke="#8a653e"/>',
    "thimble": '<path d="M79 184 89 75q5-27 39-27t39 27l10 109q-44 30-98 0z" fill="#bb9b60"/><ellipse cx="128" cy="184" rx="49" ry="16" fill="#665339"/><g fill="#7e6945" stroke="none"><circle cx="110" cy="77" r="5"/><circle cx="140" cy="77" r="5"/><circle cx="99" cy="103" r="5"/><circle cx="127" cy="103" r="5"/><circle cx="155" cy="103" r="5"/><circle cx="105" cy="129" r="5"/><circle cx="144" cy="129" r="5"/><circle cx="98" cy="151" r="5"/><circle cx="128" cy="151" r="5"/><circle cx="158" cy="151" r="5"/></g>',
    "hinges": '<path d="M43 82 117 59v82l-74-19zm91-23 78 23v40l-78 19z" fill="#8f9991"/><path d="M43 170 117 147v64l-74-19zm91-23 78 23v22l-78 19z" fill="#78877f"/><path d="M126 53v92m0-2v75" stroke="#c7cbb7" stroke-width="11"/><g fill="#343d37" stroke="none"><circle cx="62" cy="101" r="7"/><circle cx="191" cy="101" r="7"/><circle cx="63" cy="180" r="6"/><circle cx="191" cy="180" r="6"/></g>',
}


def main():
    output = ROOT / "assets" / "icons"
    output.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(prefix="devils-table-art-") as work:
        for name, drawing in DRAWINGS.items():
            svg = Path(work) / f"{name}.svg"
            png = Path(work) / f"{name}.png"
            svg.write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">'
                           '<rect width="256" height="256" rx="28" fill="#27211e"/>'
                           '<g fill="none" stroke="#d9bd8e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">'
                           + drawing + '</g></svg>', encoding="utf8")
            subprocess.run(["inkscape", str(svg), "--export-type=png", f"--export-filename={png}",
                            "--export-width=256", "--export-height=256"], check=True, capture_output=True)
            with Image.open(png) as image:
                image.convert("RGBA").save(output / f"{name}.webp", "WEBP", quality=90, method=6)
            print(f"{name}.webp: {(output / f'{name}.webp').stat().st_size} bytes")


if __name__ == "__main__":
    main()
