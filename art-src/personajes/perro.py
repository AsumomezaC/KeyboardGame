# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Perro guardián (32×20): galope de 4 cuadros («run0»…«run3») y un cuadro ladrando («bark»).
Pelaje café oscuro, orejas paradas, collar rojo con picos y ojos amarillos. Da miedo, sin ser gráfico.

Uso:
  python art-src/personajes/perro.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/perro.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "art-src"))
from paleta import RAMPAS as R, apagar  # noqa: E402
from pincel import Lienzo, fuente, gif, exportar_tira  # noqa: E402

W, H = 32, 20
SUELO = 18                      # fila de abajo de la pata apoyada (la 19 es contorno)
TINTA = R["tinta"][0]           # pelaje oscuro: contorno de tinta oscura
PELO, PELO_L, PELO_S = R["tierra"][0], R["tierra"][1], R["tinta"][1]   # café oscuro
PANZA = R["tierra"][2]
COLLAR, PICO = R["rojo"][2], R["neutros"][4]
OJO = R["amarillo"][1]
BOCA, LENGUA, DIENTE = R["rojo"][0], R["rojo"][2], R["neutros"][5]

# Galope. Cada pata: (codo o rodilla, pie) como desplazamiento desde su hombro o su cadera.
# `y`: altura del lomo; `cab`: cuánto sube o baja la cabeza; `cola`: punta de la cola.
GALOPE = [
    # estirado en el aire: manos al frente, patas atrás
    dict(y=10, cab=0, cola=(-4, -3), mano_c=((4, 2), (8, 3)), mano_l=((3, 3), (6, 5)), pata_c=((-3, 2), (-7, 4)), pata_l=((-2, 3), (-5, 6))),
    # caen las manos
    dict(y=11, cab=1, cola=(-4, -4), mano_c=((2, 3), (2, 7)), mano_l=((4, 3), (5, 6)), pata_c=((-3, 2), (-6, 3)), pata_l=((-2, 3), (-4, 5))),
    # recogido: manos y patas se juntan bajo la panza, el lomo se arquea
    dict(y=10, cab=1, cola=(-3, -5), mano_c=((-1, 4), (-3, 7)), mano_l=((1, 4), (-1, 7)), pata_c=((2, 4), (5, 7)), pata_l=((1, 4), (3, 6))),
    # empujan las patas, las manos se levantan
    dict(y=11, cab=-1, cola=(-4, -4), mano_c=((3, 2), (6, 4)), mano_l=((4, 1), (7, 2)), pata_c=((0, 3), (-1, 7)), pata_l=((2, 3), (2, 7))),
]
LADRA = dict(y=11, cab=-1, cola=(-3, -5), mano_c=((1, 3), (2, 7)), mano_l=((3, 3), (5, 7)), pata_c=((-1, 3), (-2, 7)), pata_l=((1, 3), (1, 7)))


def pata(L, origen, codo, pie, color):
    a = (origen[0] + codo[0], origen[1] + codo[1])
    b = (origen[0] + pie[0], min(origen[1] + pie[1], SUELO - 1))
    L.linea(origen, a, color, 2)
    L.linea(a, b, color, 2)


def perro(g, ladra=False):
    L = Lienzo(W, H)
    y = g["y"]
    hombro, cadera = (20, y + 1), (9, y + 1)
    cx, cy = 25, y - 4 + g["cab"]                                  # centro de la cabeza
    # cola corta y parada
    L.linea((8, y - 2), (8 + g["cola"][0], y - 2 + g["cola"][1]), PELO_S, 2)
    # patas lejanas, en sombra
    pata(L, hombro, *g["mano_l"], PELO_S)
    pata(L, cadera, *g["pata_l"], PELO_S)
    # cuerpo: grupa, lomo y un pecho hondo
    L.elipse(6, y - 3, 22, y + 2, PELO)
    L.elipse(17, y - 3, 24, y + 3, PELO)
    L.rect(9, y - 3, 11, 1, PELO_L)                                # luz en el lomo
    L.px(8, y - 2, PELO_L); L.px(20, y - 2, PELO_L)
    L.rect(11, y + 2, 7, 1, PELO_S)                                # panza recogida, en sombra
    L.rect(19, y + 2, 4, 1, PANZA); L.rect(20, y + 3, 2, 1, PANZA)  # pecho claro
    # patas cercanas
    pata(L, hombro, *g["mano_c"], PELO)
    pata(L, cadera, *g["pata_c"], PELO)
    L.elipse(7, y - 1, 11, y + 2, PELO)                            # muslo
    # cuello grueso
    L.poligono([(20, y - 3), (23, cy - 1), (26, cy + 3), (23, y + 2)], PELO)
    # cabeza: cráneo, hocico cuadrado y orejas paradas
    L.elipse(cx - 3, cy - 3, cx + 2, cy + 2, PELO)
    L.rect(cx + 1, cy - 1, 5, 3, PELO)
    L.rect(cx + 2, cy - 1, 4, 1, PELO_L)                           # luz del hocico
    L.px(cx + 5, cy - 1, TINTA)                                    # nariz
    L.puntos([(cx - 3, cy - 4), (cx - 3, cy - 5), (cx - 2, cy - 4)], PELO_S)   # oreja lejana
    L.puntos([(cx - 1, cy - 4), (cx - 1, cy - 5), (cx, cy - 4)], PELO)   # oreja cercana
    # ojo amarillo bajo una ceja dura
    L.px(cx + 1, cy - 2, OJO)
    L.px(cx, cy - 3, PELO_S); L.px(cx + 1, cy - 3, PELO_S); L.px(cx + 2, cy - 2, PELO_S)
    if ladra:
        # hocico abierto: aquí sí se ven los colmillos (la pose lo pide)
        L.rect(cx + 1, cy + 2, 4, 1, BOCA)
        L.rect(cx, cy + 3, 5, 2, PELO)                             # quijada
        L.px(cx + 2, cy + 2, LENGUA)
        L.px(cx + 4, cy + 2, DIENTE); L.px(cx + 1, cy + 2, DIENTE)
    else:
        L.rect(cx + 1, cy + 2, 4, 1, PELO_S)                       # belfo cerrado
    # collar rojo con picos
    L.linea((21, y - 4 + g["cab"] // 2), (23, y + 1), COLLAR, 2)
    L.px(21, y - 3 + g["cab"] // 2, PICO); L.px(23, y, PICO)
    L.contorno(TINTA)
    if ladra:                                                      # rayas del ladrido, sin contorno
        for a, b in (((29, cy - 3), (31, cy - 5)), ((30, cy + 1), (31, cy + 1)), ((29, cy + 5), (31, cy + 7))):
            L.linea(a, b, R["tinta"][1])
    return L.imagen()


def cuadros():
    return [(f"run{i}", perro(g)) for i, g in enumerate(GALOPE)] + [("bark", perro(LADRA, ladra=True))]


def hoja_de_contacto(cs, ruta, esc=8):
    cw = W * esc + 14
    im = Image.new("RGB", (len(cs) * cw + 14, H * esc + 190), "#211624")
    d = ImageDraw.Draw(im)
    d.text((12, 8), "Perro guardián · todos los cuadros (%d×%d, ×%d)" % (W, H, esc), fill="#f4ecd8", font=fuente(18))
    for k, (nombre, cuadro) in enumerate(cs):
        x = 12 + k * cw
        d.rectangle([x, 40, x + W * esc - 1, 40 + H * esc - 1], fill=apagar(R["morado"][2]))
        g = cuadro.resize((W * esc, H * esc), Image.NEAREST)
        im.paste(g, (x, 40), g)
        d.text((x, 44 + H * esc), nombre, fill="#a898ad", font=fuente(13))
    y = 80 + H * esc
    d.text((12, y - 20), "A tamaño de juego (×3) y silueta:", fill="#f4ecd8", font=fuente(13))
    for k, (nombre, cuadro) in enumerate(cs):
        g = cuadro.resize((W * 3, H * 3), Image.NEAREST)
        x = 12 + k * 2 * (W * 3 + 8)
        d.rectangle([x, y, x + W * 3 - 1, y + H * 3 - 1], fill=R["naranja"][2])
        im.paste(g, (x, y), g)
        x += W * 3 + 8
        d.rectangle([x, y, x + W * 3 - 1, y + H * 3 - 1], fill="#f4ecd8")
        im.paste(Image.new("RGBA", g.size, "#2b1d2e"), (x, y), g)
    im.save(ruta)


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    cs = cuadros()
    d = dict(cs)
    for nombre, cuadro in cs:
        caja = cuadro.getbbox()
        assert caja[1] >= 0 and caja[3] <= H, f"{nombre}: fuera del cuadro ({caja})"
    hoja_de_contacto(cs, previas / "perro-contacto.png")
    gif([d[f"run{i}"] for i in range(4)], previas / "perro-run.gif", 83, R["naranja"][2], esc=8)
    gif([d["run1"], d["bark"], d["bark"], d["run1"], d["bark"], d["bark"]], previas / "perro-bark.gif", 160, R["naranja"][2], esc=8)
    if "--exportar" in sys.argv:
        exportar_tira(cs, RAIZ / "public" / "assets" / "sprites", "dog")
        print("hoja del juego: public/assets/sprites/dog.png + dog.json")
    print("previas en", previas, "·", len(cs), "cuadros")


if __name__ == "__main__":
    main()
