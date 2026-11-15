# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Memo (24×36): todos sus cuadros. Gorra verde al revés, playera crema y pantalón largo verde. Es el
rudo del grupo.

Uso:
  python art-src/personajes/memo.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/memo.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402
from nino import R, P  # noqa: E402

nino.complexion("teen")
nino.vestir(
    TINTA=R["tinta"][0],
    PIEL=R["piel"][1], PIEL_S=R["piel"][0],
    PELO=R["tinta"][1], PELO_L=R["neutros"][0],
    PLAYERA=R["neutros"][4], PLAYERA_S=R["neutros"][3],
    SHORT=R["verde"][0], SHORT_S=R["tinta"][1],
    TENIS=R["neutros"][1], TENIS_S=R["neutros"][0], ACENTO=R["neutros"][4],
    GORRA=R["verde"][1], GORRA_S=R["verde"][0], GORRA_L=R["verde"][2],
    RUBOR=R["tierra"][2],
    PEINADO="gorra", PANTALON=True,
)

# Quieto intimida: plantado con las piernas abiertas, los brazos cruzados sobre el pecho (el antebrazo
# cercano sube hasta el otro brazo y el codo lejano asoma por detrás) y la boca apretada. Apenas se
# mueve: solo sube y baja los hombros al respirar.
nino.POSES["idle0"] = P((12, 20), (12, 14), (13, 9), (14, 25), (15, 29), (10, 25), (9, 29),
                        (9, 17), (14, 16), (16, 17), (10, 16), "aprieta", [])
nino.POSES["idle1"] = P((12, 20), (12, 15), (13, 10), (14, 25), (15, 29), (10, 25), (9, 29),
                        (9, 18), (14, 17), (16, 18), (10, 17), "aprieta", [])

if __name__ == "__main__":
    nino.main("memo", "Memo")
