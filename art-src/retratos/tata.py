# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato de la Tata, la abuela de Dani, para los diálogos (48×48): 8 gestos, con parpadeo («_b») y
boca al hablar («_m»). Canas recogidas en un chongo alto, lentes de armazón café, arrugas suaves,
blusa morada y mandil crema. Rostro de adulta (no ovalado); cálida y tranquila.

Uso:
  python art-src/retratos/tata.py <carpeta_de_previas>             hoja de contacto y GIF
  python art-src/retratos/tata.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import retrato  # noqa: E402
from retrato import R, mover  # noqa: E402

PIEL, PIEL_S, PIEL_SS = R["piel"][3], R["piel"][2], R["piel"][1]
PELO, PELO_L, PELO_S = R["neutros"][3], R["neutros"][5], R["neutros"][2]
BLUSA, BLUSA_S, BLUSA_L = R["morado"][1], R["morado"][0], R["morado"][2]
MANDIL, MANDIL_S = R["neutros"][4], R["neutros"][3]

# Rostro de adulta, de cachete lleno y barbilla ancha.
CARA = [(16, 13), (39, 13), (42, 17), (43, 29), (41, 35), (36, 39), (31, 40), (25, 40), (19, 37), (15, 32), (14, 20)]
NARIZ = [(29, 31), (29, 32), (30, 33), (29, 34)]
# Pelo estirado hacia atrás, con la frente despejada.
FRENTE = [(12, 6), (40, 6), (43, 10), (43, 20), (42, 23), (41, 16), (37, 13), (28, 12), (21, 13), (17, 16), (14, 22), (12, 22)]


def pelo_detras(L, dy):
    L.elipse(11, 0 + dy, 21, 8 + dy, PELO)                                            # chongo alto (deja libre la esquina de los adornos)
    L.elipse(9, 3 + dy, 43, 28 + dy, PELO)


def frente(L, dy):
    L.poligono(mover(FRENTE, dy), PELO)


def oreja_y_brillos(L, dy):
    L.rect(11, 23 + dy, 4, 6, PIEL); L.px(11, 23 + dy, PELO); L.px(11, 28 + dy, None)
    L.rect(12, 25 + dy, 2, 2, PIEL_S); L.px(14, 27 + dy, PIEL_S)
    # canas: brillo en bloques arriba y mechones en sombra hacia la nuca
    L.poligono(mover([(20, 10), (27, 8), (33, 8), (26, 10), (21, 12)], dy), PELO_L, solo=PELO)
    L.puntos(mover([(13, 3), (14, 2), (15, 2), (13, 4), (17, 5), (18, 5)], dy), PELO_L, solo=PELO)
    L.linea((12, 14 + dy), (12, 20 + dy), PELO_S, solo=PELO)
    L.puntos(mover([(11, 7), (12, 8), (13, 9), (14, 9), (15, 9), (16, 9), (17, 8), (18, 8), (19, 7), (20, 6), (21, 5)], dy),
             PELO_S, solo=PELO)                                                       # el chongo se despega de la cabeza
    L.linea((35, 9 + dy), (40, 12 + dy), PELO_S, solo=PELO)
    L.puntos(mover([(18, 7), (19, 8), (15, 10), (14, 12)], dy), PELO_S, solo=PELO)
    for x in range(25, 37):                                                           # sombra de la barbilla
        for y in (39, 40):
            L.px(x, y + dy, PIEL_S, PIEL)


def mandil(L, dy):
    """Peto del mandil y sus tirantes sobre la blusa (no se mueve con la cabeza)."""
    L.poligono([(17, 47), (18, 44), (33, 44), (34, 47)], MANDIL)
    L.linea((18, 44), (16, 42), MANDIL); L.linea((33, 44), (35, 42), MANDIL)          # tirantes
    L.rect(31, 45, 3, 3, MANDIL_S, solo=MANDIL)                                       # lado en sombra


def arrugas(L, dy, g, parpadeo):
    for x, y in ((16, 24), (15, 26), (41, 25)):                                       # patas de gallo
        L.px(x, y + dy, PIEL_S, PIEL)
    L.puntos(mover([(24, 33), (23, 34), (23, 35)], dy), PIEL_S, solo=PIEL)            # surcos junto a la boca
    L.puntos(mover([(34, 33), (35, 34), (35, 35)], dy), PIEL_S, solo=PIEL)


retrato.vestir(
    PIEL=PIEL, PIEL_S=PIEL_S, PIEL_SS=PIEL_SS,
    PELO=PELO, IRIS=R["tierra"][1], CARA=CARA, NARIZ=NARIZ,
    PLAYERA=BLUSA, PLAYERA_S=BLUSA_S, PLAYERA_L=BLUSA_L,
    LENTES=R["tierra"][1], CRISTAL=R["neutros"][4], PARPADO=R["neutros"][3],
    PELO_DETRAS=pelo_detras, PELO_DELANTE=frente, PELO_ENCIMA=oreja_y_brillos,
    COLGANTE=mandil, REMATE=arrugas,
)

# La Tata es el refugio de Sofía: en reposo y al hablar sonríe con calma.
retrato.GESTOS["idle"] = dict(cejas="suaves", ojos="abiertos", boca="sonrisa", habla="chica", dy=1)

if __name__ == "__main__":
    retrato.main("tata", "La Tata")
