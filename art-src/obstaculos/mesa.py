# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Mesa (46×20, textura `table`): cuatro mesas de barrio, cada una con su material.
Se pasa subiéndose y deslizándose por encima, así que ninguna lleva nada encima y todas tienen la
cubierta lisa y corrida en la fila de arriba (donde se apoya quien se desliza).

  v0 de fonda: patas de tubo y mantel de hule de cuadros
  v1 de fiesta: mantel blanco largo con cubremantel rosa y moño
  v2 de tianguis: tablón sobre dos burros de madera, con su precio en cartón
  v3 de parque: de concreto despintado, con la esquina rota y la varilla de fuera

Uso:
  python art-src/obstaculos/mesa.py <carpeta_de_previas>            hoja de contacto
  python art-src/obstaculos/mesa.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, hoja_de_contacto, exportar  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

W, H = 46, 20
ARRIBA = 1                     # fila de la cubierta (la 0 es contorno): ahí se apoya quien se desliza
SUELO = 18                     # fila de abajo de las patas (la 19 es contorno)
TINTA = R["tinta"][1]


def fonda():
    """Mesa de fonda: patas de tubo y mantel de hule de cuadros rojos que cuelga por las orillas."""
    tubo, tubo_s = R["neutros"][2], R["neutros"][1]
    rojo, rosa, blanco = R["rojo"][2], R["rojo"][3], R["neutros"][4]
    L = Lienzo(W, H)
    for x in (5, 39):                                         # patas de tubo
        L.rect(x, 7, 2, SUELO - 6, tubo); L.rect(x + 1, 7, 1, SUELO - 6, tubo_s)
        L.rect(x - 1, SUELO, 4, 1, tubo_s)                    # regatón de la pata
    L.rect(7, 14, 32, 1, tubo_s)                              # travesaño
    for y in range(ARRIBA, 7):                                # el hule cuelga 6 filas
        for x in range(1, W - 1):
            v, h = (x // 2) % 2, ((y - ARRIBA) // 2) % 2
            L.px(x, y, rojo if v and h else (rosa if v or h else blanco))
    for x in (1, 2, W - 3, W - 2):                            # las puntas caen más en las esquinas
        L.px(x, 7, rosa if (x // 2) % 2 else blanco)
    L.rect(1, ARRIBA, W - 2, 1, R["neutros"][5], solo=blanco)  # brillo del hule
    L.rect(1, 6, W - 2, 1, R["rojo"][1], solo=rojo)           # dobladillo en sombra
    L.rect(1, 6, W - 2, 1, R["rojo"][2], solo=rosa)
    L.rect(1, 6, W - 2, 1, R["neutros"][3], solo=blanco)
    L.contorno(TINTA)
    return L.imagen()


def fiesta():
    """Mesa rentada para la fiesta: mantel blanco hasta el piso y cubremantel rosa de ondas con moño."""
    blanco, blanco_s = R["neutros"][4], R["neutros"][3]
    rosa_s, rosa, rosa_l = R["rosa"][1], R["rosa"][2], R["rosa"][3]
    L = Lienzo(W, H)
    L.rect(3, 15, 2, SUELO - 14, R["neutros"][1])             # patas de tubo que asoman
    L.rect(41, 15, 2, SUELO - 14, R["neutros"][1])
    L.rect(1, ARRIBA, W - 2, 14, blanco)                      # mantel largo
    for x in range(4, W - 2, 5):
        L.rect(x, 7, 1, 8, blanco_s)                          # pliegues del mantel
    L.rect(1, 14, W - 2, 1, blanco_s)
    L.rect(1, ARRIBA, W - 2, 4, rosa)                         # cubremantel
    L.rect(1, ARRIBA, W - 2, 1, rosa_l)
    for x in range(1, W - 1):                                 # ondas del cubremantel
        if x % 6 not in (0, 5):
            L.px(x, 5, rosa)
        if x % 6 in (2, 3):
            L.px(x, 6, rosa)
        if x % 6 in (0,):
            L.px(x, 4, rosa_s)
    cx = W // 2                                               # moño al centro, bajo el cubremantel
    for dx, dy in ((-4, 0), (-3, -1), (-3, 0), (-3, 1), (-2, -1), (-2, 0), (-2, 1), (-1, 0),
                   (1, 0), (2, -1), (2, 0), (2, 1), (3, -1), (3, 0), (3, 1), (4, 0)):
        L.px(cx + dx, 9 + dy, rosa)                           # lazos
    L.px(cx - 3, 9, rosa_l); L.px(cx + 2, 9, rosa_l)
    L.px(cx, 9, rosa_s)                                       # nudo
    for k in range(3):                                        # puntas que caen
        L.px(cx - 1 - k, 10 + k, rosa); L.px(cx + 1 + k, 10 + k, rosa)
    L.px(cx - 1, 11, rosa_s); L.px(cx + 1, 11, rosa_s)
    L.contorno(TINTA)
    return L.imagen()


def tianguis():
    """Tablón de tianguis sobre dos burros de madera pintados, con su precio en un cartón."""
    tabla_s, tabla, tabla_l = R["tierra"][2], R["tierra"][3], R["tierra"][4]
    burro, burro_s = R["azul"][2], R["azul"][1]
    L = Lienzo(W, H)
    for cx in (8, 37):                                        # burros: una A vista de canto
        L.linea((cx, 4), (cx - 5, SUELO), burro_s, 2)
        L.linea((cx, 4), (cx + 4, SUELO), burro, 2)
        L.rect(cx - 3, 11, 7, 1, burro_s)                     # travesaño del burro
        L.rect(cx - 2, 4, 5, 1, burro)                        # cabezal
    L.rect(1, ARRIBA, W - 2, 3, tabla)                        # el tablón
    L.rect(1, ARRIBA, W - 2, 1, tabla_l)
    L.rect(1, 3, W - 2, 1, tabla_s)
    for x0, x1 in ((4, 11), (17, 26), (31, 36)):              # veta
        L.rect(x0, 2, x1 - x0, 1, tabla_s)
    L.px(2, 2, R["neutros"][3]); L.px(W - 3, 2, R["neutros"][3])   # clavos
    # cartón colgado del tablón con el precio escrito a mano
    carton, carton_s, tinta = R["naranja"][2], R["naranja"][1], R["rojo"][0]
    L.px(19, 4, R["neutros"][0]); L.px(26, 4, R["neutros"][0])     # hilo
    L.rect(18, 5, 10, 9, carton); L.rect(18, 13, 10, 1, carton_s)
    precio = {(20, 0): ".#.", (20, 1): "###", (20, 2): "#..", (20, 3): "###", (20, 4): "..#",
              (20, 5): "###", (20, 6): ".#.",                                    # «$»
              (24, 1): "###", (24, 2): "#..", (24, 3): "###", (24, 4): "..#", (24, 5): "###"}  # «5»
    for (x0, fila), trazo in precio.items():
        for k, ch in enumerate(trazo):
            if ch == "#":
                L.px(x0 + k, 6 + fila, tinta)
    L.contorno(TINTA)
    return L.imagen()


def parque():
    """Mesa de concreto del parque: pintada de verde por el municipio hace años, despintada, rajada,
    con una esquina rota que deja ver la varilla oxidada y un grafiti en la pata."""
    v_s, v, v_l = R["verde"][1], R["verde"][2], R["verde"][3]
    gris, gris_s = R["neutros"][2], R["neutros"][1]
    L = Lienzo(W, H)
    for x0 in (6, 33):                                        # pedestales de concreto
        L.poligono([(x0 + 1, 5), (x0 + 6, 5), (x0 + 7, SUELO), (x0, SUELO)], v)
        L.rect(x0 + 6, 5, 1, SUELO - 4, v_s)
        L.rect(x0, SUELO, 8, 1, v_s)
    L.rect(1, ARRIBA, W - 2, 4, v)                            # la losa
    L.rect(1, ARRIBA, W - 2, 1, v_l)
    L.rect(1, 4, W - 2, 1, v_s)
    # esquina de abajo a la derecha rota: concreto al aire y la varilla de fuera
    L.puntos([(W - 2, 4), (W - 3, 4), (W - 2, 3)], None)
    L.px(W - 4, 4, gris_s); L.px(W - 3, 3, gris_s); L.px(W - 2, 2, gris)
    L.linea((W - 4, 3), (W - 1, 5), R["naranja"][0], 1)       # varilla oxidada
    # pintura caída: se asoma el concreto gris
    for x, y in ((4, 2), (5, 2), (5, 3), (14, 3), (27, 2), (28, 2), (28, 3), (8, 9), (9, 9), (9, 10),
                 (36, 13), (37, 13), (36, 14), (11, 15)):
        L.px(x, y, gris, solo=v)
    L.linea((19, 1), (22, 4), gris_s, 1, solo=v)              # grieta
    L.linea((35, 7), (36, 9), gris_s, 1, solo=v)
    # grafiti en la pata de la izquierda
    g = R["rosa"][2]
    for x, y in ((8, 12), (9, 11), (10, 12), (11, 11), (12, 12), (9, 13), (11, 13)):
        L.px(x, y, g, solo=v)
    L.contorno(TINTA)
    return L.imagen()


def variantes():
    return [
        ("v0 · fonda", fonda(), "Patas de tubo y mantel\nde hule de cuadros"),
        ("v1 · fiesta", fiesta(), "Rentada: mantel largo,\ncubremantel y moño"),
        ("v2 · tianguis", tianguis(), "Tablón sobre burros,\ncon su precio en cartón"),
        ("v3 · parque", parque(), "De concreto despintado,\nrajada y con la varilla\nde fuera"),
    ]


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    vs = variantes()
    for nombre, cuadro, _ in vs:
        caja = cuadro.getbbox()
        assert cuadro.size == (W, H) and caja[1] == 0 and caja[3] == H, f"{nombre}: no va de arriba al piso ({caja})"
        fila = [cuadro.getpixel((x, ARRIBA))[3] for x in range(2, W - 2)]
        assert all(fila), f"{nombre}: la cubierta no es corrida"
    hoja_de_contacto("Mesa", vs, previas / "mesa-contacto.png", previas, prop_y=2, vuelo=("slide", 60, 0), esc=6)
    if "--exportar" in sys.argv:
        exportar(vs, "table")
    print("previas en", previas, "·", len(vs), "variantes")


if __name__ == "__main__":
    main()
