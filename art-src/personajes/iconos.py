# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Íconos chicos del mapa de niveles (14×14): hoy, la cabeza de Sofía que marca el nivel elegido.

Se dibuja con la misma cabeza de su hoja del juego (nino.py vestido como Sofía): cara sonriente,
fleco y la trenza corta con su liga, con contorno de tinta.

Uso:
  python art-src/personajes/iconos.py <carpeta_de_previas> [<ícono_viejo.png>]   lámina de revisión
  python art-src/personajes/iconos.py <carpeta_de_previas> --exportar              además escribe
                                                     public/assets/sprites/iconos.png + iconos.json
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import sofia  # noqa: E402,F401  (viste a nino.py como Sofía)
import nino  # noqa: E402

LADO = 14
TRENZA = [(0, 1), (0, 2), (0, 3)]     # corta y colgando, para que quepa en el cuadro


def cabeza_sofia():
    """La cabeza de Sofía del sprite del juego, recortada a 14×14 (contorno incluido)."""
    L = nino.Lienzo()
    h = (12, 12)
    nino.trenza(L, h, TRENZA)
    nino.cabeza(L, h, "feliz")
    L.contorno(nino.TINTA)
    im = L.imagen()
    caja = (h[0] - 7, h[1] - 7, h[0] + 7, h[1] + 7)
    x0, y0, x1, y1 = im.getbbox()
    assert caja[0] <= x0 and caja[1] <= y0 and x1 <= caja[2] and y1 <= caja[3], "la cabeza no cabe en 14×14"
    return im.crop(caja)


ICONOS = {"sofia-head": cabeza_sofia}


def lamina(iconos, ruta, viejo=None):
    """Cada ícono ampliado ×12 y a tamaño de juego (×3) sobre colores del mapa; con el de hoy al lado."""
    filas = [(n, im) for n, im in iconos.items()]
    if viejo:
        filas = [("hoy (por código)", Image.open(viejo).convert("RGBA"))] + filas
    esc = 12
    cw = LADO * esc + 30
    out = Image.new("RGB", (len(filas) * cw + 20, LADO * esc + 120), "#211624")
    d = ImageDraw.Draw(out)
    for k, (n, im) in enumerate(filas):
        x = 20 + k * cw
        d.rectangle([x, 12, x + LADO * esc - 1, 12 + LADO * esc - 1], fill="#e9c46a")
        g = im.resize((LADO * esc, LADO * esc), Image.NEAREST)
        out.paste(g, (x, 12), g)
        d.text((x, LADO * esc + 18), n, fill="#f4ecd8", font=nino.fuente(14))
        for j, fondo in enumerate(("#3a6b4a", "#4a5d8a", "#f4ecd8")):   # a ×3, como en el mapa
            fx = x + j * 54
            d.rectangle([fx, LADO * esc + 44, fx + 49, LADO * esc + 93], fill=fondo)
            g3 = im.resize((LADO * 3, LADO * 3), Image.NEAREST)
            out.paste(g3, (fx + 4, LADO * esc + 48), g3)
    out.save(ruta)


def exportar(iconos, carpeta):
    tira = Image.new("RGBA", (LADO * len(iconos), LADO), (0, 0, 0, 0))
    marcos = {}
    for k, (n, im) in enumerate(iconos.items()):
        tira.paste(im, (k * LADO, 0))
        marcos[n] = {"frame": {"x": k * LADO, "y": 0, "w": LADO, "h": LADO}}
    tira.save(carpeta / "iconos.png")
    meta = {"image": "iconos.png", "size": {"w": tira.width, "h": LADO}, "scale": "1",
            "license": "Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md)."}
    (carpeta / "iconos.json").write_text(json.dumps({"frames": marcos, "meta": meta}, ensure_ascii=False, indent=1) + "\n",
                                         encoding="utf-8")


if __name__ == "__main__":
    previas = Path(sys.argv[1])
    previas.mkdir(parents=True, exist_ok=True)
    viejo = next((a for a in sys.argv[2:] if not a.startswith("--")), None)
    iconos = {n: f() for n, f in ICONOS.items()}
    lamina(iconos, previas / "iconos-lamina.png", viejo)
    if "--exportar" in sys.argv:
        exportar(iconos, nino.RAIZ / "public" / "assets" / "sprites")
        print("hoja del juego: public/assets/sprites/iconos.png + iconos.json")
    print("previas en", previas)
