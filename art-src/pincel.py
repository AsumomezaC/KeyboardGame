# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Pincel común de los scripts de arte: un lienzo de pixeles con contorno, y las salidas de revisión
(GIF con una sola paleta) y de juego (tira PNG + JSON con un cuadro por nombre)."""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

AVISO = "Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md)."


class Lienzo:
    def __init__(self, w, h):
        self.w, self.h, self.p = w, h, {}

    def px(self, x, y, c, solo=None):
        """Pinta un pixel. `solo`: color (o colores) sobre los que sí se puede pintar."""
        x, y = round(x), round(y)
        if not (0 <= x < self.w and 0 <= y < self.h):
            return
        if solo is not None and self.p.get((x, y)) not in (solo if isinstance(solo, (tuple, list, set)) else (solo,)):
            return
        if c is None:
            self.p.pop((x, y), None)
        else:
            self.p[(x, y)] = c

    def rect(self, x, y, w, h, c, solo=None):
        for j in range(h):
            for i in range(w):
                self.px(round(x) + i, round(y) + j, c, solo)

    def puntos(self, pts, c, solo=None):
        for x, y in pts:
            self.px(x, y, c, solo)

    def linea(self, a, b, c, g=1, solo=None):
        x0, y0, x1, y1 = round(a[0]), round(a[1]), round(b[0]), round(b[1])
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
        err = dx + dy
        while True:
            self.rect(x0, y0, g, g, c, solo)
            if x0 == x1 and y0 == y1:
                break
            e2 = 2 * err
            if e2 >= dy:
                err += dy; x0 += sx
            if e2 <= dx:
                err += dx; y0 += sy

    def elipse(self, x0, y0, x1, y1, c, solo=None):
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        rx, ry = (x1 - x0 + 1) / 2, (y1 - y0 + 1) / 2
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0:
                    self.px(x, y, c, solo)

    def poligono(self, pts, c, solo=None):
        m = Image.new("L", (self.w, self.h), 0)
        ImageDraw.Draw(m).polygon([(round(x), round(y)) for x, y in pts], fill=255, outline=255)
        for y in range(self.h):
            for x in range(self.w):
                if m.getpixel((x, y)):
                    self.px(x, y, c, solo)

    def contorno(self, c):
        borde = set()
        for (x, y) in self.p:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                q = (x + dx, y + dy)
                if q not in self.p and 0 <= q[0] < self.w and 0 <= q[1] < self.h:
                    borde.add(q)
        for q in borde:
            self.p[q] = c

    def imagen(self):
        im = Image.new("RGBA", (self.w, self.h), (0, 0, 0, 0))
        for (x, y), c in self.p.items():
            im.putpixel((x, y), tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
        return im


def fuente(t):
    for ruta in ("C:/Windows/Fonts/segoeui.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if Path(ruta).exists():
            return ImageFont.truetype(ruta, t)
    return ImageFont.load_default(size=t)


def gif(cuadros, ruta, ms, fondo, esc=6):
    """GIF de revisión. Todos los cuadros comparten paleta (si no, los visores mezclan colores)."""
    w, h = cuadros[0].size
    fr = []
    for c in cuadros:
        base = Image.new("RGBA", (w * esc, h * esc), fondo)
        base.alpha_composite(c.resize((w * esc, h * esc), Image.NEAREST))
        fr.append(base.convert("RGB"))
    tira = Image.new("RGB", (w * esc * len(fr), h * esc))
    for k, f in enumerate(fr):
        tira.paste(f, (k * w * esc, 0))
    comun = tira.quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    fr = [f.quantize(palette=comun, dither=Image.Dither.NONE) for f in fr]
    fr[0].save(ruta, save_all=True, append_images=fr[1:], duration=ms, loop=0, optimize=False)


def exportar_tira(cs, carpeta, nombre):
    """Escribe <nombre>.png (tira horizontal) y <nombre>.json (un cuadro por nombre)."""
    carpeta.mkdir(parents=True, exist_ok=True)
    w, h = cs[0][1].size
    tira = Image.new("RGBA", (w * len(cs), h), (0, 0, 0, 0))
    marcos = {}
    for k, (n, cuadro) in enumerate(cs):
        tira.paste(cuadro, (k * w, 0))
        marcos[n] = {"frame": {"x": k * w, "y": 0, "w": w, "h": h}}
    tira.save(carpeta / f"{nombre}.png")
    meta = {"image": f"{nombre}.png", "size": {"w": tira.width, "h": h}, "scale": "1", "license": AVISO}
    (carpeta / f"{nombre}.json").write_text(json.dumps({"frames": marcos, "meta": meta}, ensure_ascii=False, indent=1) + "\n",
                                            encoding="utf-8")
