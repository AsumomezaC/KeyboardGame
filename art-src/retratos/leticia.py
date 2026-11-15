# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato de Leticia, la mamá, para los diálogos (48×48): 8 gestos, con parpadeo («_b») y boca al
hablar («_m»). Pelo estirado en un chongo alto, ojeras, pestañas y uniforme de enfermera verde agua
de cuello en V. Rostro de adulta (no ovalado); cansada y malhumorada.

Uso:
  python art-src/retratos/leticia.py <carpeta_de_previas>             hoja de contacto y GIF
  python art-src/retratos/leticia.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import retrato  # noqa: E402
from retrato import R, mover  # noqa: E402

PIEL, PIEL_S, PIEL_SS = R["piel"][4], R["piel"][3], R["piel"][2]
PELO, PELO_L, PELO_LL = R["tierra"][0], R["tierra"][1], R["tierra"][2]
TINTA = R["tinta"][1]
UNIFORME, UNIFORME_S, UNIFORME_L = R["turquesa"][2], R["turquesa"][1], R["turquesa"][3]

# Rostro de adulta: más largo que el de los adolescentes, pómulo marcado y barbilla firme.
CARA = [(16, 13), (39, 13), (42, 17), (43, 28), (41, 34), (36, 38), (31, 40), (25, 40), (19, 36), (16, 31), (14, 20)]
NARIZ = [(31, 28), (31, 29), (32, 30), (31, 31)]
# Pelo estirado hacia atrás: frente despejada y un mechón que se le escapa del lado lejano.
FRENTE = [(12, 6), (40, 6), (43, 10), (43, 20), (42, 23), (41, 16), (37, 13), (28, 12), (21, 13), (17, 16), (14, 22), (12, 22)]


def pelo_detras(L, dy):
    L.elipse(11, 0 + dy, 21, 8 + dy, PELO)                                            # chongo alto (deja libre la esquina de los adornos)
    L.elipse(9, 3 + dy, 43, 28 + dy, PELO)


def frente(L, dy):
    L.poligono(mover(FRENTE, dy), PELO)


def oreja_y_brillos(L, dy):
    L.rect(11, 23 + dy, 4, 6, PIEL); L.px(11, 23 + dy, PELO); L.px(11, 28 + dy, None)
    L.rect(12, 25 + dy, 2, 2, PIEL_S); L.px(14, 27 + dy, PIEL_S)
    # brillos en bloques y la vuelta del chongo
    L.poligono(mover([(20, 10), (27, 8), (33, 8), (26, 10), (21, 12)], dy), PELO_L, solo=PELO)
    L.puntos(mover([(23, 10), (24, 10), (27, 9)], dy), PELO_LL, solo=PELO_L)
    L.puntos(mover([(13, 3), (14, 2), (15, 2), (13, 4), (17, 5), (18, 5)], dy), PELO_L, solo=PELO)
    L.puntos(mover([(43, 21), (43, 22), (44, 23), (44, 24)], dy), PELO)                # mechón suelto
    for x in range(25, 37):                                                           # sombra de la barbilla
        for y in (39, 40):
            L.px(x, y + dy, PIEL_S, PIEL)


def ojeras_y_pestanas(L, dy, g, parpadeo):
    # ojeras del doble turno
    L.rect(20, 30 + dy, 5, 1, PIEL_S, solo=PIEL); L.rect(34, 30 + dy, 4, 1, PIEL_S, solo=PIEL)
    if parpadeo or g["ojos"] not in ("galan", "abiertos", "enojo", "bajos"):
        return
    y = 23 + dy + (1 if g["ojos"] == "galan" else -1 if g["ojos"] == "abiertos" else 1)
    L.px(18, y - 1, TINTA); L.px(38, y - 1, TINTA)                                    # una pestaña por ojo


retrato.vestir(
    PIEL=PIEL, PIEL_S=PIEL_S, PIEL_SS=PIEL_SS,
    PELO=PELO, IRIS=R["tierra"][1], CARA=CARA, NARIZ=NARIZ, RUBOR=PIEL,               # sin rubor: pálida de cansancio
    PLAYERA=UNIFORME, PLAYERA_S=UNIFORME_S, PLAYERA_L=UNIFORME_L,
    PELO_DETRAS=pelo_detras, PELO_DELANTE=frente, PELO_ENCIMA=oreja_y_brillos, REMATE=ojeras_y_pestanas,
)

# Leticia viene de doble turno y está de malas con la vida: en reposo y al hablar lleva los párpados
# caídos, el ceño fruncido y la boca hacia abajo. Solo se le alegra la cara en ocasiones contadas
# (los gestos `happy` y `cheer`, que elige el guion).
retrato.GESTOS["idle"] = dict(cejas="fruncidas", ojos="galan", boca="enojo", habla="chica", dy=1)
retrato.GESTOS["talk"] = dict(cejas="fruncidas", ojos="galan", boca="enojo", habla="abierta", dy=0)

if __name__ == "__main__":
    retrato.main("leticia", "Leticia")
