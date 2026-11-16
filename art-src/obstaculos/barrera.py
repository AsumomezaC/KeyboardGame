# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Barrera (32×27, textura `fence`): algo atravesado a la altura del pecho. Se pasa barriéndose por
debajo, así que todo lo que estorba va arriba y entre los dos apoyos queda el hueco libre.

  v0 tablón de obra a rayas, sobre postes de madera
  v1 calle cerrada por fiesta: mecate con papel picado entre dos palos en botes con cemento
  v2 pluma roja y blanca entre dos tambos naranjas de tránsito

Uso:
  python art-src/obstaculos/barrera.py <carpeta_de_previas>            hoja de contacto
  python art-src/obstaculos/barrera.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, hoja_de_contacto, exportar  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

W, H = 32, 27
SUELO = 25                     # fila de abajo de los apoyos (la 26 es contorno)
TINTA = R["tinta"][1]
LIBRE = (6, 9, 25, SUELO)      # hueco por donde pasa quien se barre: aquí no se dibuja nada


def obra():
    """Tablón de obra a rayas amarillas y oscuras sobre dos postes de madera: la obra de siempre."""
    palo, palo_l = R["tierra"][2], R["tierra"][3]
    a, a_s, b = R["amarillo"][1], R["amarillo"][0], R["neutros"][0]
    L = Lienzo(W, H)
    for x in (2, 27):
        L.rect(x, 6, 3, SUELO - 5, palo); L.rect(x, 6, 1, SUELO - 5, palo_l)
        L.rect(x - 1 if x < 16 else x, SUELO - 1, 4, 2, palo)     # pie del poste, hacia afuera
    for y in range(1, 8):
        for x in range(1, 31):
            L.px(x, y, b if (x + y) % 8 < 4 else (a_s if y == 7 else a))
    L.rect(1, 1, 30, 1, R["amarillo"][2], solo=a)                 # luz arriba
    L.px(3, 4, R["neutros"][3]); L.px(28, 4, R["neutros"][3])     # clavos
    L.contorno(TINTA)
    return L.imagen()


def fiesta():
    """Calle cerrada por fiesta: un mecate con papel picado entre dos palos metidos en botes con cemento."""
    palo, palo_l = R["tierra"][3], R["tierra"][4]
    bote, bote_l, cemento = R["azul"][1], R["azul"][2], R["neutros"][2]
    L = Lienzo(W, H)
    for x in (2, 27):
        L.rect(x + 1, 1, 2, SUELO - 6, palo); L.rect(x + 1, 1, 1, SUELO - 6, palo_l)
        b = x - 1 if x < 16 else x                                # el bote crece hacia afuera
        L.rect(b, SUELO - 6, 4, 7, bote); L.rect(b, SUELO - 6, 1, 7, bote_l)   # bote de pintura
        L.rect(b, SUELO - 6, 4, 1, cemento)
    L.rect(4, 2, 24, 1, R["tierra"][4])                           # mecate
    colores = [R["rosa"][2], R["amarillo"][1], R["turquesa"][2], R["morado"][1], R["naranja"][1], R["verde"][2]]
    for k, c in enumerate(colores):                               # papel picado
        x = 5 + k * 4
        L.rect(x, 3, 3, 5, c)
        L.px(x + 1, 5, None); L.px(x, 7, None); L.px(x + 2, 7, None)   # recortes y picos
    L.contorno(TINTA)
    return L.imagen()


def transito():
    """Pluma roja y blanca entre dos tambos naranjas de tránsito."""
    t_s, t, t_l = R["naranja"][0], R["naranja"][1], R["naranja"][2]
    rojo, blanco = R["rojo"][2], R["neutros"][5]
    L = Lienzo(W, H)
    for x in (1, 27):
        L.rect(x, 8, 4, SUELO - 7, t); L.rect(x, 8, 1, SUELO - 7, t_l); L.rect(x + 3, 8, 1, SUELO - 7, t_s)
        L.rect(x, 12, 4, 2, blanco); L.rect(x, 18, 4, 2, blanco)  # franjas reflejantes
        L.rect(x, SUELO - 1, 4, 2, R["neutros"][0])               # base de hule
        L.rect(x + 1, 6, 2, 2, t_s)                               # cuello del tambo
    for x in range(1, 31):                                        # pluma
        for y in range(2, 6):
            L.px(x, y, rojo if (x // 5) % 2 == 0 else blanco)
    L.rect(1, 5, 30, 1, R["rojo"][1], solo=rojo); L.rect(1, 5, 30, 1, R["neutros"][3], solo=blanco)
    L.px(15, 3, R["amarillo"][1]); L.px(16, 3, R["amarillo"][1])  # reflejante del centro
    L.contorno(TINTA)
    return L.imagen()


def variantes():
    return [
        ("v0 · obra", obra(), "Tablón a rayas de la\nobra que nunca acaba"),
        ("v1 · fiesta", fiesta(), "Calle cerrada: mecate\ncon papel picado"),
        ("v2 · tránsito", transito(), "Pluma entre tambos\nnaranjas"),
    ]


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    vs = variantes()
    for nombre, cuadro, _ in vs:
        assert cuadro.size == (W, H) and cuadro.getbbox()[3] == H, f"{nombre}: no pisa la última fila"
        assert cuadro.crop(LIBRE).getbbox() is None, f"{nombre}: hay algo en el hueco por donde se barre"
    hoja_de_contacto("Barrera", vs, previas / "barrera-contacto.png", previas, prop_y=2, paso=250, vuelo=("slide", 0, 0), esc=6)
    if "--exportar" in sys.argv:
        exportar(vs, "fence")
    print("previas en", previas, "·", len(vs), "variantes")


if __name__ == "__main__":
    main()
