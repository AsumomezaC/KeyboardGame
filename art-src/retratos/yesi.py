# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato de Yesenia «la Yesi» para los diálogos (48×48): 8 gestos, con parpadeo («_b») y boca al
hablar («_m»). Cola de caballo alta con liga amarilla, aretes de aro, playera morada. Rostro de
adolescente, mirada entornada con pestañas y media sonrisa.

Uso:
  python art-src/retratos/yesi.py <carpeta_de_previas>             hoja de contacto y GIF
  python art-src/retratos/yesi.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import retrato  # noqa: E402
from retrato import R, mover  # noqa: E402

PIEL, PIEL_S, PIEL_SS = R["piel"][3], R["piel"][2], R["piel"][1]
PELO, PELO_L, PELO_LL = R["tierra"][0], R["tierra"][1], R["tierra"][2]
ORO, ORO_S = R["amarillo"][1], R["amarillo"][0]
TINTA = R["tinta"][1]

# Rostro de adolescente: menos cachete que los niños y mandíbula marcada (no ovalado).
CARA = [(16, 13), (39, 13), (42, 17), (42, 27), (40, 32), (35, 37), (31, 39), (25, 39), (19, 35), (16, 30), (14, 20)]
# Pelo estirado hacia atrás: frente despejada y un mechón suelto del lado lejano.
FRENTE = [(12, 6), (40, 6), (43, 10), (43, 20), (42, 22), (41, 16), (37, 13), (28, 12), (21, 13), (17, 16), (14, 22), (12, 22)]
# La cola sale de la coronilla, sube un poco y cae por detrás del hombro.
COLA = [(14, 7), (10, 6), (6, 10), (4, 16), (3, 26), (4, 36), (6, 41), (9, 40), (9, 30), (9, 20), (11, 14), (15, 11)]


def pelo_detras(L, dy):
    L.poligono(mover(COLA, dy), PELO)
    L.elipse(9, 3 + dy, 43, 28 + dy, PELO)


def frente(L, dy):
    L.poligono(mover(FRENTE, dy), PELO)


def oreja_y_brillos(L, dy):
    L.rect(11, 23 + dy, 4, 6, PIEL); L.px(11, 23 + dy, PELO); L.px(11, 28 + dy, None)
    L.rect(12, 25 + dy, 2, 2, PIEL_S); L.px(14, 27 + dy, PIEL_S)
    # arete de aro
    L.puntos(mover([(12, 29), (11, 30), (11, 31), (12, 32), (13, 32), (14, 31), (14, 30)], dy), ORO)
    L.px(13, 29 + dy, ORO_S)
    # liga de la cola y brillos en bloques
    L.rect(10, 8 + dy, 3, 3, ORO); L.rect(10, 10 + dy, 3, 1, ORO_S)
    L.poligono(mover([(18, 8), (26, 6), (32, 7), (25, 9), (20, 11)], dy), PELO_L, solo=PELO)
    L.puntos(mover([(21, 8), (22, 8), (26, 7)], dy), PELO_LL, solo=PELO_L)
    L.puntos(mover([(6, 15), (6, 16), (5, 22), (5, 23), (6, 29), (6, 30), (7, 36)], dy), PELO_L, solo=PELO)
    for x in range(26, 36):                                                           # sombra de la barbilla
        L.px(x, 39 + dy, PIEL_S, PIEL)


def pestanas(L, dy, g, parpadeo):
    """Una pestaña hacia afuera en cada ojo cuando están abiertos: la mirada «filosa»."""
    if parpadeo or g["ojos"] not in ("galan", "abiertos", "enojo", "bajos"):
        return
    y = 23 + dy + (1 if g["ojos"] == "galan" else -1 if g["ojos"] == "abiertos" else 1)
    L.px(18, y - 1, TINTA); L.px(38, y - 1, TINTA)
    if g["ojos"] != "galan":
        L.px(19, y, TINTA); L.px(37, y, TINTA)


retrato.vestir(
    PIEL=PIEL, PIEL_S=PIEL_S, PIEL_SS=PIEL_SS,
    PELO=PELO, IRIS=R["tierra"][1], CARA=CARA,
    PLAYERA=R["morado"][1], PLAYERA_S=R["morado"][0], PLAYERA_L=R["morado"][2],
    PELO_DETRAS=pelo_detras, PELO_DELANTE=frente, PELO_ENCIMA=oreja_y_brillos, REMATE=pestanas,
)

# La Yesi mira de lado y sonríe a medias: en reposo y al hablar lleva los ojos entornados.
retrato.GESTOS["idle"] = dict(cejas="suaves", ojos="galan", boca="media", habla="chica", dy=0)
retrato.GESTOS["talk"] = dict(cejas="altas", ojos="galan", boca="media", habla="abierta", dy=0)

if __name__ == "__main__":
    retrato.main("yesi", "Yesenia «la Yesi»")
