# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Silla (18×22, textura `chair`): cinco sillas de barrio, cada una con su material.
Se pasa brincando con una voltereta, así que ninguna lleva nada encima ni es más alta que las demás.

  v0 de plástico, roja, de fonda        v1 de madera pintada con asiento de tule
  v2 plegable de lámina, de fiesta      v3 Acapulco, de cuerda tejida
  v4 pupitre de escuela, con paleta

Uso:
  python art-src/obstaculos/silla.py <carpeta_de_previas>            hoja de contacto
  python art-src/obstaculos/silla.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, hoja_de_contacto, exportar  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

W, H = 18, 22
SUELO = 20                     # fila de abajo de las patas (la 21 es contorno)
TINTA = R["tinta"][1]


def plastico():
    """Silla de plástico de una pieza, con descansabrazos: la de todas las fondas."""
    s, m, l = R["rojo"][1], R["rojo"][2], R["rojo"][3]
    L = Lienzo(W, H)
    L.linea((3, 13), (2, SUELO), s, 2)               # pata de atrás
    L.linea((13, 13), (14, SUELO), s, 2)             # pata de enfrente
    L.rect(3, 2, 3, 10, m)                           # respaldo
    L.rect(3, 2, 1, 10, l)
    L.rect(5, 4, 1, 2, s); L.rect(5, 7, 1, 2, s)     # ranuras del respaldo
    L.rect(3, 11, 12, 2, m)                          # asiento
    L.rect(4, 11, 10, 1, l)
    L.rect(4, 13, 10, 1, s)                          # faldón del asiento
    L.rect(6, 7, 8, 1, m); L.px(6, 7, l); L.px(7, 7, l)   # descansabrazos
    L.rect(13, 8, 1, 3, s)                           # su apoyo
    L.contorno(TINTA)
    return L.imagen()


def tule():
    """Silla de madera pintada, con flores en el respaldo y asiento de tule tejido."""
    s, m, l = R["turquesa"][0], R["turquesa"][1], R["turquesa"][2]
    paja, paja_s = R["tierra"][4], R["tierra"][3]
    L = Lienzo(W, H)
    L.rect(13, 12, 2, SUELO - 11, m); L.rect(14, 12, 1, SUELO - 11, s)   # pata de enfrente
    L.rect(3, 1, 2, SUELO, m); L.rect(3, 1, 1, SUELO, l)                 # poste (respaldo y pata)
    L.rect(5, 2, 3, 3, m); L.rect(5, 2, 3, 1, l)                         # tabla de arriba
    L.px(6, 3, R["rosa"][3])                                             # flor pintada
    L.rect(5, 7, 3, 2, m); L.px(6, 7, R["amarillo"][1])                  # tabla de abajo
    L.rect(7, 1, 1, 10, s)                                               # poste lejano
    L.rect(3, 10, 13, 3, paja)                                           # asiento de tule
    for x in range(4, 16, 2):
        L.px(x, 11, paja_s)
    L.rect(3, 12, 13, 1, paja_s)
    L.rect(5, 16, 8, 1, s)                                               # travesaño
    L.contorno(TINTA)
    return L.imagen()


def plegable():
    """Silla plegable de lámina, de las que se rentan para las fiestas: patas en tijera."""
    tubo, tubo_s = R["neutros"][2], R["neutros"][1]
    s, m, l = R["azul"][0], R["azul"][1], R["azul"][2]
    L = Lienzo(W, H)
    L.linea((13, 12), (3, SUELO - 1), tubo_s, 2)     # tubo que baja hacia atrás
    L.linea((4, 3), (13, SUELO - 1), tubo, 2)        # tubo del respaldo a la pata de enfrente
    L.rect(3, 1, 4, 7, m)                            # lámina del respaldo
    L.rect(3, 1, 1, 7, l); L.rect(6, 2, 1, 6, s)
    L.rect(4, 3, 2, 2, R["amarillo"][1])             # calcomanía despintada
    L.rect(4, 10, 12, 2, m)                          # asiento de lámina
    L.rect(5, 10, 10, 1, l); L.rect(4, 12, 12, 1, s)
    L.contorno(TINTA)
    return L.imagen()


def acapulco():
    """Silla Acapulco: aro en forma de pera, cuerda de plástico tejida y patas de varilla."""
    s, m, l = R["rosa"][1], R["rosa"][2], R["rosa"][3]
    varilla = R["neutros"][0]
    L = Lienzo(W, H)
    L.linea((7, 14), (4, SUELO), varilla, 1)         # patas de varilla
    L.linea((10, 14), (13, SUELO), varilla, 1)
    L.rect(4, 18, 10, 1, varilla)                    # aro de la base
    aro = [(2, 2), (4, 1), (6, 2), (9, 7), (13, 8), (15, 8), (15, 10), (12, 13), (6, 13), (3, 9)]
    L.poligono(aro, l)                               # aro
    L.poligono([(3, 3), (4, 2), (5, 3), (8, 8), (13, 9), (14, 9), (14, 10), (11, 12), (7, 12), (4, 9)], m)
    for k, (x0, y0) in enumerate(((3, 4), (4, 3), (5, 4), (6, 6), (8, 8), (10, 9), (12, 9), (14, 9))):
        if k % 2:
            L.linea((x0, y0), (8, 12), s, 1, solo=m)  # una cuerda sí y una no, hacia el centro
    L.contorno(TINTA)
    return L.imagen()


def pupitre():
    """Pupitre de escuela pública: tubo, madera rayada y la paleta para escribir."""
    tubo, tubo_s = R["neutros"][2], R["neutros"][1]
    s, m, l = R["tierra"][2], R["tierra"][3], R["tierra"][4]
    L = Lienzo(W, H)
    L.linea((4, 13), (3, SUELO), tubo_s, 1)          # patas de tubo
    L.linea((12, 13), (13, SUELO), tubo, 1)
    L.rect(4, 17, 9, 1, tubo_s)                      # canastilla para los cuadernos
    L.rect(13, 8, 1, 5, tubo)                        # tubo que sostiene la paleta
    L.rect(3, 2, 2, 9, m); L.rect(3, 2, 1, 9, l)     # respaldo de madera
    L.px(4, 5, s)
    L.rect(3, 11, 10, 2, m); L.rect(4, 11, 8, 1, l)  # asiento
    L.rect(3, 13, 10, 1, s)
    L.rect(8, 6, 8, 2, m); L.rect(8, 6, 8, 1, l)     # paleta
    L.px(11, 6, s); L.px(13, 6, R["azul"][1])        # rayones y tinta de pluma
    L.contorno(TINTA)
    return L.imagen()


def variantes():
    return [
        ("v0 · plástico", plastico(), "De fonda y de fiesta\nde patio"),
        ("v1 · madera y tule", tule(), "Pintada, de casa\ny de mercado"),
        ("v2 · plegable", plegable(), "De lámina, rentada\npara la fiesta"),
        ("v3 · Acapulco", acapulco(), "De cuerda tejida,\nde patio y azotea"),
        ("v4 · pupitre", pupitre(), "De escuela pública,\nrayado"),
    ]


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    vs = variantes()
    for nombre, cuadro, _ in vs:
        caja = cuadro.getbbox()
        assert cuadro.size == (W, H) and caja[3] == H, f"{nombre}: no pisa la última fila ({caja})"
    hoja_de_contacto("Silla", vs, previas / "silla-contacto.png", previas, prop_y=2, vuelo=("tuck", 150, 180))
    if "--exportar" in sys.argv:
        exportar(vs, "chair")
    print("previas en", previas, "·", len(vs), "variantes")


if __name__ == "__main__":
    main()
