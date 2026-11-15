# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato de Dani para los diálogos (48×48): 8 gestos, con parpadeo («_b») y boca al hablar («_m»).
Pelo negro revuelto con picos, oreja a la vista, lentes de cristal claro y playera naranja.

Uso:
  python art-src/retratos/dani.py <carpeta_de_previas>             hoja de contacto y GIF
  python art-src/retratos/dani.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import retrato  # noqa: E402
from retrato import R, mover  # noqa: E402

PIEL, PIEL_S, PIEL_SS = R["piel"][3], R["piel"][2], R["piel"][1]
PELO, PELO_L = R["neutros"][0], R["neutros"][1]

# Casco de pelo corto y, saliendo de él, picos en todas direcciones.
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
# Fleco corto y disparejo: picos hacia abajo que dejan libres las cejas.
FLECO = [(13, 12), (43, 12), (43, 16), (41, 14), (39, 17), (36, 13), (32, 15), (29, 13), (27, 17), (24, 13),
         (20, 15), (17, 13), (16, 19), (14, 22), (13, 22)]


def pelo_detras(L, dy):
    L.poligono(mover(CASCO, dy), PELO)
    for p in PICOS:
        L.poligono(mover(p, dy), PELO)
    L.rect(9, 24 + dy, 4, 4, PELO)                                                    # nuca, detrás de la oreja


def fleco(L, dy):
    L.poligono(mover(FLECO, dy), PELO)


def oreja_y_brillos(L, dy):
    # oreja a la vista (el pelo corto no la tapa)
    L.rect(11, 23 + dy, 4, 6, PIEL); L.px(11, 23 + dy, PELO); L.px(11, 28 + dy, None)
    L.rect(12, 25 + dy, 2, 2, PIEL_S); L.px(14, 27 + dy, PIEL_S)
    # brillos en bloques sobre los picos
    L.poligono(mover([(14, 10), (20, 8), (26, 8), (21, 10), (16, 12)], dy), PELO_L, solo=PELO)
    L.poligono(mover([(31, 8), (36, 8), (34, 10)], dy), PELO_L, solo=PELO)
    L.puntos(mover([(12, 6), (13, 7), (18, 4), (19, 5), (27, 4), (28, 5), (35, 4)], dy), PELO_L, solo=PELO)


retrato.vestir(
    PIEL=PIEL, PIEL_S=PIEL_S, PIEL_SS=PIEL_SS,
    PELO=PELO, IRIS=R["tierra"][1],
    PLAYERA=R["naranja"][1], PLAYERA_S=R["naranja"][0], PLAYERA_L=R["naranja"][2],
    LENTES=R["tinta"][1], CRISTAL=R["neutros"][4], PARPADO=R["neutros"][3],
    PELO_DETRAS=pelo_detras, PELO_DELANTE=fleco, PELO_ENCIMA=oreja_y_brillos,
)

# Dani va derecho y sonriente: la cabeza baja y la boca seria del reposo son de Sofía.
retrato.GESTOS["idle"] = dict(cejas="suaves", ojos="abiertos", boca="sonrisa", habla="chica", dy=0)
retrato.GESTOS["talk"] = dict(cejas="altas", ojos="abiertos", boca="sonrisa", habla="abierta", dy=0)

if __name__ == "__main__":
    retrato.main("dani", "Dani")
