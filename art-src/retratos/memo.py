# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato de Memo para los diálogos (48×48): 8 gestos, con parpadeo («_b») y boca al hablar («_m»).
Gorra verde al revés, pelo corto, playera crema. Rostro de adolescente, cejas gruesas y bajas y la
boca cerrada: el rudo del grupo.

Uso:
  python art-src/retratos/memo.py <carpeta_de_previas>             hoja de contacto y GIF
  python art-src/retratos/memo.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import retrato  # noqa: E402
from retrato import R, mover  # noqa: E402

PIEL, PIEL_S, PIEL_SS = R["piel"][1], R["piel"][0], R["piel"][0]
PELO, PELO_L = R["tinta"][1], R["neutros"][0]
GORRA, GORRA_S, GORRA_L = R["verde"][1], R["verde"][0], R["verde"][2]

COPA = [(11, 15), (11, 10), (14, 5), (20, 2), (32, 2), (39, 4), (43, 9), (44, 15)]
VISERA = [(11, 12), (8, 13), (7, 16), (11, 17)]
# Rostro de adolescente: menos cachete que los niños y mandíbula marcada (no ovalado).
CARA = [(16, 13), (39, 13), (42, 17), (42, 27), (40, 32), (35, 37), (31, 39), (25, 39), (19, 35), (16, 30), (14, 20)]
NARIZ = [(31, 28), (31, 29), (32, 30), (31, 31)]


def pelo_detras(L, dy):
    L.poligono(mover([(10, 14), (14, 10), (40, 10), (43, 14), (43, 18), (10, 26)], dy), PELO)
    L.rect(10, 24 + dy, 4, 4, PELO)                                                   # nuca, detrás de la oreja


def patilla(L, dy):
    L.poligono(mover([(13, 13), (18, 13), (17, 18), (16, 22), (14, 23), (13, 23)], dy), PELO)


def gorra_y_oreja(L, dy):
    # oreja a la vista
    L.rect(11, 23 + dy, 4, 6, PIEL); L.px(11, 23 + dy, PELO); L.px(11, 28 + dy, None)
    L.rect(12, 25 + dy, 2, 2, PIEL_S); L.px(14, 27 + dy, PIEL_S)
    # gorra al revés: visera hacia atrás, copa sobre la frente y el hueco del broche
    L.poligono(mover(VISERA, dy), GORRA_S)
    L.poligono(mover(COPA, dy), GORRA)
    L.rect(11, 13 + dy, 34, 3, GORRA_S)                                               # banda
    L.elipse(25, 8 + dy, 35, 18 + dy, PIEL, solo=(GORRA, GORRA_S))                    # hueco: se ve la frente
    L.rect(25, 14 + dy, 11, 2, GORRA_S)                                               # broche
    L.rect(25, 8 + dy, 11, 2, PELO, solo=PIEL)                                        # pelo que asoma
    L.poligono(mover([(15, 8), (19, 4), (25, 4), (21, 6), (17, 10)], dy), GORRA_L, solo=GORRA)
    L.rect(26, 1 + dy, 3, 1, GORRA_S)                                                 # botón
    for x in range(16, 44):                                                           # sombra de la gorra
        L.px(x, 16 + dy, PIEL_S, PIEL)
    for x in range(26, 36):                                                           # sombra de la barbilla
        L.px(x, 39 + dy, PIEL_S, PIEL)


retrato.vestir(
    TINTA=R["tinta"][0],
    PIEL=PIEL, PIEL_S=PIEL_S, PIEL_SS=PIEL_SS,
    PELO=PELO, IRIS=R["tierra"][3], RUBOR=PIEL,                                       # sin rubor
    CARA=CARA, NARIZ=NARIZ,
    PLAYERA=R["neutros"][4], PLAYERA_S=R["neutros"][3], PLAYERA_L=R["neutros"][5],
    PELO_DETRAS=pelo_detras, PELO_DELANTE=patilla, PELO_ENCIMA=gorra_y_oreja,
)

# Memo habla poco y serio: cejas gruesas y bajas, ojos abiertos y la boca en una línea; al hablar
# apenas la abre.
retrato.GESTOS["idle"] = dict(cejas="galan", ojos="abiertos", boca="linea", habla="chica", dy=0)
retrato.GESTOS["talk"] = dict(cejas="galan", ojos="abiertos", boca="linea", habla="chica", dy=0)

if __name__ == "__main__":
    retrato.main("memo", "Memo")
