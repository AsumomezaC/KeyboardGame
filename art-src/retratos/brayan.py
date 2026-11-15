# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato de Brayan para los diálogos (48×48): 8 gestos, con parpadeo («_b») y boca al hablar («_m»).
Pelo güero revuelto con el fleco largo, playera azul. Rostro de adolescente, cejas arriba y sonrisa
ancha: el hablador del grupo.

Uso:
  python art-src/retratos/brayan.py <carpeta_de_previas>             hoja de contacto y GIF
  python art-src/retratos/brayan.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import retrato  # noqa: E402
from retrato import R, mover  # noqa: E402

PIEL, PIEL_S, PIEL_SS = R["piel"][5], R["piel"][4], R["piel"][3]
PELO, PELO_L, PELO_LL = R["amarillo"][0], R["amarillo"][1], R["amarillo"][2]

# Rostro de adolescente: menos cachete que los niños y mandíbula marcada (no ovalado).
CARA = [(16, 13), (39, 13), (42, 17), (42, 27), (40, 32), (35, 37), (31, 39), (25, 39), (19, 35), (16, 30), (14, 20)]
# Casco de pelo y picos en todas direcciones.
CASCO = [(9, 13), (11, 8), (15, 6), (22, 5), (32, 5), (38, 6), (42, 9), (43, 12), (43, 17), (9, 26)]
PICOS = [
    [(12, 10), (11, 4), (16, 7)],
    [(15, 7), (18, 2), (22, 6)],
    [(23, 6), (27, 2), (30, 6)],
    [(31, 6), (36, 2), (38, 7)],
    [(37, 7), (41, 4), (42, 11)],
    [(10, 13), (7, 15), (9, 18)],
    [(9, 19), (7, 22), (9, 24)],
]
# Fleco largo y despeinado, peinado hacia el lado lejano: mechones gruesos que casi llegan a las cejas.
FLECO = [(13, 12), (43, 12), (43, 20), (41, 16), (39, 18), (37, 15), (33, 17), (30, 14), (28, 18), (25, 15),
         (24, 17), (20, 15), (18, 17), (16, 19), (14, 22), (13, 22)]


def pelo_detras(L, dy):
    L.poligono(mover(CASCO, dy), PELO)
    for p in PICOS:
        L.poligono(mover(p, dy), PELO)
    L.rect(9, 24 + dy, 4, 4, PELO)                                                    # nuca, detrás de la oreja


def fleco(L, dy):
    L.poligono(mover(FLECO, dy), PELO)


def oreja_y_brillos(L, dy):
    L.rect(11, 23 + dy, 4, 6, PIEL); L.px(11, 23 + dy, PELO); L.px(11, 28 + dy, None)
    L.rect(12, 25 + dy, 2, 2, PIEL_S); L.px(14, 27 + dy, PIEL_S)
    # brillos en bloques sobre los picos y los mechones del fleco
    L.poligono(mover([(14, 10), (20, 8), (26, 8), (21, 10), (16, 12)], dy), PELO_L, solo=PELO)
    L.poligono(mover([(31, 8), (36, 8), (34, 10)], dy), PELO_L, solo=PELO)
    L.puntos(mover([(12, 6), (13, 7), (18, 4), (19, 5), (27, 4), (28, 5), (35, 4), (27, 14), (28, 15), (33, 14), (38, 14)], dy),
             PELO_L, solo=PELO)
    L.puntos(mover([(17, 10), (18, 9), (19, 9), (23, 9)], dy), PELO_LL, solo=PELO_L)
    for x in range(26, 36):                                                           # sombra de la barbilla
        L.px(x, 39 + dy, PIEL_S, PIEL)


retrato.vestir(
    PIEL=PIEL, PIEL_S=PIEL_S, PIEL_SS=PIEL_SS,
    PELO=PELO, IRIS=R["tierra"][1], CARA=CARA,
    PLAYERA=R["azul"][2], PLAYERA_S=R["azul"][1], PLAYERA_L=R["azul"][3],
    PELO_DETRAS=pelo_detras, PELO_DELANTE=fleco, PELO_ENCIMA=oreja_y_brillos,
)

# Brayan siempre trae algo que contar: sonrisa ancha en reposo y la boca bien abierta al hablar.
retrato.GESTOS["idle"] = dict(cejas="suaves", ojos="abiertos", boca="sonrisota", habla="chica", dy=0)
retrato.GESTOS["talk"] = dict(cejas="suaves", ojos="abiertos", boca="sonrisota", habla="risa", dy=0)

if __name__ == "__main__":
    retrato.main("brayan", "Brayan")
