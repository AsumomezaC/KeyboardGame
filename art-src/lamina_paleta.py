# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Lámina de la paleta maestra: rampas en sus tres versiones y una escena de prueba.

Uso: python art-src/lamina_paleta.py <salida.png>
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).parent))
from paleta import RAMPAS, paleta, VIVA

MODOS = [("viva", "VIVA (correr)"), ("desaturada", "APAGADA A: menos saturación"), ("fria", "APAGADA B: fría, azulada")]
NOMBRES = {
    "tinta": "Tinta (contorno)", "neutros": "Neutros", "piel": "Piel", "tierra": "Tierra / pelo / madera",
    "rosa": "Rosa mexicano", "rojo": "Rojo coral", "naranja": "Naranja", "amarillo": "Amarillo",
    "verde": "Verde", "turquesa": "Turquesa", "azul": "Azul", "morado": "Morado",
}
FONDO, TEXTO, TENUE = "#211624", "#f4ecd8", "#a898ad"
SW, SH, FILA = 46, 30, 52          # muestra de color y alto de fila
COL0, BLOQUE = 190, 6 * SW + 34    # columna de nombres y ancho de cada bloque
ESC = 3                            # escala de la escena de prueba
EW, EH = 104, 56


def fuente(t):
    for ruta in ("C:/Windows/Fonts/segoeui.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if Path(ruta).exists():
            return ImageFont.truetype(ruta, t)
    return ImageFont.load_default(size=t)


def escena(modo):
    """Mini fachada de barrio con Sofía quieta, pintada solo con la paleta."""
    P = paleta(modo)
    V = paleta("viva")  # lo jugable (Sofía) conserva sus colores vivos
    im = Image.new("RGB", (EW, EH), P["azul"][3])
    d = ImageDraw.Draw(im)
    R = lambda x, y, w, h, c: d.rectangle([x, y, x + w - 1, y + h - 1], fill=c)
    R(0, 14, EW, 10, P["amarillo"][2])                      # horizonte cálido
    casas = [(0, 30, "rosa", 2), (30, 26, "amarillo", 1), (56, 28, "turquesa", 2), (84, 20, "naranja", 1)]
    for x, w, r, i in casas:
        alto = 30 + (x % 3) * 2
        y = 46 - alto
        R(x, y, w, alto, P[r][i])
        R(x, y, w, 2, P[r][i - 1])                          # cornisa
        R(x, 42, w, 4, P[r][i - 1])                         # zoclo
        R(x + 4, 34, 7, 12, P["tierra"][1])                 # puerta
        R(x + 5, 35, 5, 11, P["tierra"][2])
        if w > 22:
            R(x + 15, 30, 8, 8, P["neutros"][4])            # ventana
            R(x + 16, 31, 6, 6, P["azul"][0])
            R(x + 16, 31, 2, 2, P["azul"][2])
        R(x + w - 1, y, 1, alto, P["tinta"][1])
    # papel picado
    flecos = ["rosa", "amarillo", "turquesa", "morado", "verde", "naranja"]
    for k in range(13):
        x = k * 8
        y = 8 + (1 if k % 4 in (1, 2) else 0)
        d.line([x, y, x + 8, y], fill=P["tinta"][1])
        c = P[flecos[k % 6]][2 if flecos[k % 6] not in ("amarillo", "naranja", "morado") else 1]
        R(x + 1, y + 1, 6, 4, c)
        d.point([(x + 2, y + 4), (x + 5, y + 4), (x + 3, y + 2)], fill=P["azul"][3])
    # maceta
    R(72, 41, 5, 5, P["naranja"][0]); R(71, 37, 7, 4, P["verde"][1]); R(73, 35, 3, 2, P["verde"][2])
    # banqueta y calle
    R(0, 46, EW, 4, P["tierra"][4]); R(0, 49, EW, 1, P["tierra"][3])
    R(0, 50, EW, 6, P["neutros"][0]); R(0, 53, EW, 1, P["neutros"][1])
    for x in range(4, EW, 16):
        R(x, 53, 6, 1, P["amarillo"][1])
    # Sofía (boceto de bloques, solo para ver sus colores sobre el fondo)
    sx, sy, T = 44, 31, V["tinta"][1]
    R(sx - 1, sy - 1, 9, 9, T); R(sx, sy, 7, 7, V["piel"][4])           # cabeza
    R(sx, sy, 7, 3, V["tierra"][0]); R(sx, sy, 2, 6, V["tierra"][0])     # pelo
    R(sx - 3, sy + 4, 3, 6, T); R(sx - 2, sy + 5, 1, 4, V["tierra"][1])  # trenza
    d.point((sx - 2, sy + 8), fill=V["amarillo"][1])
    d.point((sx + 5, sy + 4), fill=T)                                    # ojo
    R(sx, sy + 8, 7, 8, T); R(sx + 1, sy + 8, 5, 4, V["rojo"][2])        # playera
    R(sx + 1, sy + 11, 5, 1, V["rojo"][1])
    R(sx + 1, sy + 12, 5, 2, V["azul"][1])                               # short
    R(sx + 1, sy + 14, 2, 3, V["piel"][4]); R(sx + 4, sy + 14, 2, 3, V["piel"][3])
    R(sx, sy + 17, 7, 2, T); R(sx + 1, sy + 17, 2, 1, V["neutros"][5]); R(sx + 4, sy + 17, 2, 1, V["neutros"][5])
    return im.resize((EW * ESC, EH * ESC), Image.NEAREST)


def main(salida):
    ancho = COL0 + 3 * BLOQUE + 10
    alto_rampas = 96 + len(RAMPAS) * FILA
    alto = alto_rampas + EH * ESC + 110
    im = Image.new("RGB", (ancho, alto), FONDO)
    d = ImageDraw.Draw(im)
    d.text((20, 14), "La Historia de Sofía · Paleta maestra (propuesta)", fill=TEXTO, font=fuente(24))
    d.text((20, 46), f"{len(VIVA)} colores en {len(RAMPAS)} rampas · sombras hacia el morado · cada color tiene su pareja apagada",
           fill=TENUE, font=fuente(14))
    for m, (modo, titulo) in enumerate(MODOS):
        d.text((COL0 + m * BLOQUE, 74), titulo, fill=TEXTO, font=fuente(14))
    for f, nombre in enumerate(RAMPAS):
        y = 96 + f * FILA
        d.text((20, y + 8), NOMBRES[nombre], fill=TEXTO, font=fuente(14))
        for m, (modo, _) in enumerate(MODOS):
            for i, c in enumerate(paleta(modo)[nombre]):
                x = COL0 + m * BLOQUE + i * SW
                d.rectangle([x, y, x + SW - 3, y + SH], fill=c)
                d.text((x, y + SH + 2), c[1:], fill=TENUE, font=fuente(10))
    y = alto_rampas + 26
    d.text((20, y - 22), "Escena de prueba (Sofía quieta conserva sus colores; solo cambia el mundo):", fill=TEXTO, font=fuente(14))
    hueco = (ancho - 40 - 3 * EW * ESC) // 2
    for m, (modo, titulo) in enumerate(MODOS):
        x = 20 + m * (EW * ESC + hueco)
        im.paste(escena(modo), (x, y))
        d.text((x, y + EH * ESC + 6), titulo, fill=TEXTO, font=fuente(14))
    Path(salida).parent.mkdir(parents=True, exist_ok=True)
    im.save(salida)
    print("lámina:", salida, im.size)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "paleta.png")
