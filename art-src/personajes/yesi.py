# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Yesenia «la Yesi» (24×36): todos sus cuadros. Cola de caballo alta, aretes, playera morada y
pantalón largo.

Uso:
  python art-src/personajes/yesi.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/yesi.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402
from nino import R, P  # noqa: E402

nino.complexion("teen")
nino.vestir(
    PIEL=R["piel"][3], PIEL_S=R["piel"][2],
    PELO=R["tierra"][0], PELO_L=R["tierra"][1],
    PLAYERA=R["morado"][1], PLAYERA_S=R["morado"][0],
    SHORT=R["azul"][0], SHORT_S=R["tinta"][1],
    ACENTO=R["morado"][1], LIGA=R["amarillo"][1], ARETE=R["amarillo"][1],
    PEINADO="cola", PANTALON=True,
)

# Quieta: la actitud de Los Gatos. Cadera a un lado, una mano en la cintura y la barbilla en alto.
nino.POSES["idle0"] = P((12, 20), (12, 14), (13, 9), (14, 25), (15, 29), (11, 25), (10, 29),
                        (9, 17), (11, 20), (13, 18), (14, 21), "corre", nino.CUELGA)
nino.POSES["idle1"] = P((12, 20), (12, 15), (13, 10), (14, 25), (15, 29), (11, 25), (10, 29),
                        (9, 18), (11, 20), (13, 19), (14, 22), "corre", nino.CUELGA)

if __name__ == "__main__":
    nino.main("yesi", "Yesenia «la Yesi»")
