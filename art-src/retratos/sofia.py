# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato de Sofía niña para los diálogos (48×48): 8 gestos, con parpadeo («_b») y boca al hablar («_m»).

Uso:
  python art-src/retratos/sofia.py <carpeta_de_previas>             hoja de contacto y GIF
  python art-src/retratos/sofia.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import retrato  # noqa: E402
from retrato import R, mover  # noqa: E402

PELO, PELO_L, PELO_LL = R["tierra"][0], R["tierra"][1], R["tierra"][2]
LIGA, LIGA_S = R["amarillo"][1], R["amarillo"][0]

# El fleco baja en pico entre los ojos y a los lados, y deja libres las cejas.
# (el pico derecho va con las esquinas apenas matadas: ni cuadrado ni redondo)
FLECO = [(11, 5), (40, 5), (42, 6), (43, 8), (43, 19), (42, 21), (40, 16), (37, 15), (33, 15), (29, 21), (26, 15), (20, 15), (16, 18), (12, 24)]


def melena(L, dy):
    L.elipse(6, 3 + dy, 41, 38 + dy, PELO)


def fleco(L, dy):
    L.poligono(mover(FLECO, dy), PELO)


def mechon_y_brillos(L, dy):
    for k, y in enumerate(range(17 + dy, 33 + dy)):                                   # mechón junto a la oreja
        L.rect(13, y, 4 if k < 9 else 2, 1, PELO)
    # brillos del pelo en bloques
    L.poligono(mover([(15, 8), (25, 6), (30, 7), (22, 10), (17, 12)], dy), PELO_L, solo=PELO)
    L.poligono(mover([(33, 8), (38, 9), (36, 11)], dy), PELO_L, solo=PELO)
    L.puntos(mover([(18, 9), (19, 8), (20, 8), (24, 7)], dy), PELO_LL, solo=PELO_L)


def trenza(L, dy):
    # cae por delante del hombro izquierdo; gajos en dos tonos y liga amarilla
    x0, y0 = 8, 26 + dy
    for k in range(0, 22):
        y = y0 + k
        if y > 47:
            break
        cx = x0 + (1 if k > 8 else 0)
        L.rect(cx, y, 5, 1, PELO)
        g = k % 4
        L.px(cx + (1 if g < 2 else 3), y, PELO_L)
        L.px(cx + 2, y, PELO_L if g in (1, 2) else PELO)
    L.rect(x0, y0 + 2, 5, 2, LIGA); L.rect(x0, y0 + 3, 5, 1, LIGA_S)                   # liga de la nuca
    L.rect(x0 + 1, 44, 5, 2, LIGA); L.rect(x0 + 1, 45, 5, 1, LIGA_S)                   # liga de la punta


retrato.vestir(
    PIEL=R["piel"][4], PIEL_S=R["piel"][3], PIEL_SS=R["piel"][2],
    PELO=PELO, IRIS=R["tierra"][1],
    PLAYERA=R["rojo"][2], PLAYERA_S=R["rojo"][1], PLAYERA_L=R["rojo"][3],
    PELO_DETRAS=melena, PELO_DELANTE=fleco, PELO_ENCIMA=mechon_y_brillos, COLGANTE=trenza,
)

if __name__ == "__main__":
    retrato.main("sofia", "Sofía niña")
