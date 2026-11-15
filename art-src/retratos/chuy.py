# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato de Chuy para los diálogos (48×48): 8 gestos, con parpadeo («_b») y boca al hablar («_m»).
Rapado, playera roja. Rostro de adolescente y mirada despierta: el atleta del grupo.

Uso:
  python art-src/retratos/chuy.py <carpeta_de_previas>             hoja de contacto y GIF
  python art-src/retratos/chuy.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import retrato  # noqa: E402
from retrato import R, mover  # noqa: E402

PIEL, PIEL_S, PIEL_SS = R["piel"][1], R["piel"][0], R["piel"][0]
PELO, PELO_L = R["tinta"][1], R["neutros"][0]

# Rostro de adolescente: menos cachete que los niños y mandíbula marcada (no ovalado).
CARA = [(16, 13), (39, 13), (42, 17), (42, 27), (40, 32), (35, 37), (31, 39), (25, 39), (19, 35), (16, 30), (14, 20)]
NARIZ = [(31, 28), (31, 29), (32, 30), (31, 31)]
# Pelo al ras: sigue la forma del cráneo; el nacimiento es alto y recto, con entradas y patilla.
CRANEO = [(11, 24), (11, 14), (14, 9), (20, 6), (34, 6), (40, 8), (43, 13), (43, 18)]
NACIMIENTO = [(13, 13), (43, 13), (43, 17), (41, 15), (38, 14), (22, 14), (18, 15), (17, 19), (15, 22), (13, 22)]


def craneo(L, dy):
    L.poligono(mover(CRANEO, dy), PELO)
    L.rect(10, 24 + dy, 4, 3, PELO)                                                   # nuca, detrás de la oreja


def nacimiento(L, dy):
    L.poligono(mover(NACIMIENTO, dy), PELO)


def oreja_y_brillos(L, dy):
    L.rect(11, 23 + dy, 4, 6, PIEL); L.px(11, 23 + dy, PELO); L.px(11, 28 + dy, None)
    L.rect(12, 25 + dy, 2, 2, PIEL_S); L.px(14, 27 + dy, PIEL_S)
    # brillo del rapado: puntos salteados (se ve el cuero cabelludo) del lado de la luz
    for x in range(15, 31):
        for y in range(8, 13):
            if (x + 2 * y) % 4 == 0 and x - y < 20:
                L.px(x, y + dy, PELO_L, PELO)
    for x in range(26, 36):                                                           # sombra de la barbilla
        L.px(x, 39 + dy, PIEL_S, PIEL)


retrato.vestir(
    TINTA=R["tinta"][0],
    PIEL=PIEL, PIEL_S=PIEL_S, PIEL_SS=PIEL_SS,
    PELO=PELO, IRIS=R["tierra"][3], RUBOR=PIEL,                                       # sin rubor
    CARA=CARA, NARIZ=NARIZ,
    PLAYERA=R["rojo"][1], PLAYERA_S=R["rojo"][0], PLAYERA_L=R["rojo"][2],
    PELO_DETRAS=craneo, PELO_DELANTE=nacimiento, PELO_ENCIMA=oreja_y_brillos,
)

# Chuy está siempre listo: ojos bien abiertos y sonrisa franca (sin la mirada entornada de Kevin).
retrato.GESTOS["idle"] = dict(cejas="suaves", ojos="abiertos", boca="sonrisa", habla="chica", dy=0)
retrato.GESTOS["talk"] = dict(cejas="altas", ojos="abiertos", boca="sonrisa", habla="abierta", dy=0)

if __name__ == "__main__":
    retrato.main("chuy", "Chuy")
