# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato de Don Chema, el panadero, para los diálogos (48×48): 8 gestos, con parpadeo («_b») y boca
al hablar («_m»). Gorro de cocinero, bigote grande, cachetes colorados y filipina blanca. Rostro de
adulto, ancho y cuadrado (no ovalado); vendedor de mercado, de voz potente.

Uso:
  python art-src/retratos/panadero.py <carpeta_de_previas>             hoja de contacto y GIF
  python art-src/retratos/panadero.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import retrato  # noqa: E402
from retrato import R, mover  # noqa: E402

PIEL, PIEL_S, PIEL_SS = R["piel"][4], R["piel"][3], R["piel"][2]
PELO, PELO_L = R["tierra"][0], R["tierra"][1]
BLANCO, BLANCO_S, BLANCO_SS = R["neutros"][5], R["neutros"][3], R["neutros"][2]

# Rostro de adulto: largo, con la mandíbula ancha y cuadrada.
CARA = [(16, 13), (39, 13), (42, 17), (43, 29), (42, 35), (38, 39), (32, 40), (24, 40), (18, 37), (15, 32), (14, 20)]
NARIZ = [(33, 29), (33, 30), (32, 31), (31, 31)]
# Gorro: copa esponjada y una banda del ancho de la cabeza, calada hasta la frente; el pelo solo
# asoma por debajo. No pasa de x=10 a la izquierda ni de x=42 a la derecha: las esquinas de arriba
# son de los adornos de los gestos.
COPA = [(13, 10), (11, 8), (10, 5), (12, 2), (16, 1), (21, 2), (26, 1), (31, 2), (36, 1), (40, 2), (42, 5), (42, 8), (41, 10)]


def pelo_detras(L, dy):
    L.poligono(mover([(10, 26), (10, 16), (12, 14), (42, 14), (44, 16), (44, 20)], dy), PELO)   # pelo corto: asoma bajo el gorro
    L.rect(10, 24 + dy, 4, 4, PELO)                                                   # nuca, detrás de la oreja


def patillas(L, dy):
    L.poligono(mover([(13, 13), (18, 13), (17, 19), (15, 22), (13, 22)], dy), PELO)
    L.poligono(mover([(40, 13), (44, 13), (44, 17), (42, 16)], dy), PELO)


def gorro_y_oreja(L, dy):
    # oreja a la vista
    L.rect(11, 23 + dy, 4, 6, PIEL); L.px(11, 23 + dy, PELO); L.px(11, 28 + dy, None)
    L.rect(12, 25 + dy, 2, 2, PIEL_S); L.px(14, 27 + dy, PIEL_S)
    # gorro de cocinero
    L.poligono(mover(COPA, dy), BLANCO)
    L.rect(12, 10 + dy, 31, 5, BLANCO)                                                # banda: ciñe la cabeza de lado a lado
    L.puntos(mover([(12, 15), (13, 15), (41, 15), (42, 15)], dy), BLANCO)             # baja un poco en las sienes
    L.rect(14, 14 + dy, 27, 1, BLANCO_S); L.puntos(mover([(12, 15), (13, 15), (41, 15), (42, 15)], dy), BLANCO_S)
    L.rect(13, 10 + dy, 29, 1, BLANCO_S)                                              # la copa cae sobre la banda
    for x, y0, y1 in ((17, 4, 9), (22, 3, 9), (27, 4, 9), (32, 3, 9), (36, 4, 9)):
        L.linea((x, y0 + dy), (x, y1 + dy), BLANCO_S)                                 # pliegues
    for x in (39, 40, 41, 42):
        L.linea((x, 3 + dy), (x, 13 + dy), BLANCO_S, solo=BLANCO)                     # lado en sombra
    L.rect(16, 15 + dy, 24, 1, PIEL_S, solo=PIEL)                                     # sombra del gorro en la frente
    # sombra bajo la mandíbula (la cara es más larga que la común)
    for x in range(24, 39):
        for y in (39, 40):
            L.px(x, y + dy, PIEL_S, PIEL)


def filipina(L, dy):
    """Filipina: cuello alto abierto y dos filas de botones (no se mueve con la cabeza)."""
    L.linea((21, 41), (25, 45), BLANCO_S); L.linea((30, 41), (26, 45), BLANCO_S)       # solapas del cuello
    L.linea((26, 45), (26, 47), BLANCO_S)                                             # cierre cruzado
    for x in (21, 31):
        L.px(x, 46, BLANCO_SS)                                                        # botones


def bigote(L, dy, g, parpadeo):
    # bigote grande: tapa el labio de arriba; con la risa las puntas suben, si no cuelgan
    L.rect(25, 31 + dy, 11, 1, PELO); L.rect(24, 32 + dy, 13, 1, PELO); L.rect(23, 33 + dy, 15, 1, PELO)
    L.px(30, 33 + dy, PIEL_S); L.px(31, 33 + dy, PIEL_S)                              # se parte al centro
    if g["boca"] in ("sonrisota", "risa", "risota", "sonrisa"):
        L.puntos(mover([(22, 32), (38, 32), (21, 31), (39, 31)], dy), PELO)
    else:
        L.puntos(mover([(22, 34), (23, 34), (37, 34), (38, 34), (22, 35), (38, 35)], dy), PELO)
    L.puntos(mover([(27, 31), (28, 31), (33, 32)], dy), PELO_L)


retrato.vestir(
    PIEL=PIEL, PIEL_S=PIEL_S, PIEL_SS=PIEL_SS,
    PELO=PELO, IRIS=R["tierra"][1], RUBOR=R["rojo"][3],
    CARA=CARA, NARIZ=NARIZ,
    PLAYERA=BLANCO, PLAYERA_S=BLANCO_S, PLAYERA_L=BLANCO,
    PELO_DETRAS=pelo_detras, PELO_DELANTE=patillas, PELO_ENCIMA=gorro_y_oreja, COLGANTE=filipina,
    REMATE=bigote,
)

# Don Chema pregona: en reposo sonríe bajo el bigote y al hablar levanta las cejas.
retrato.GESTOS["idle"] = dict(cejas="suaves", ojos="abiertos", boca="sonrisa", habla="chica", dy=1)
retrato.GESTOS["talk"] = dict(cejas="altas", ojos="abiertos", boca="sonrisa", habla="abierta", dy=0)

if __name__ == "__main__":
    retrato.main("panadero", "Don Chema")
