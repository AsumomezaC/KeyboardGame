# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Chuy (24×36): todos sus cuadros. Rapado, playera roja y pantalón largo. Es el atleta del grupo.

Uso:
  python art-src/personajes/chuy.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/chuy.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
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
    PLAYERA=R["rojo"][1], PLAYERA_S=R["rojo"][0],
    SHORT=R["neutros"][0], SHORT_S=R["tinta"][1],
    ACENTO=R["rojo"][2], RUBOR=R["tierra"][2],
    PEINADO="rapado", PANTALON=True,
)

# Quieto no se está quieto: postura atlética, rodillas flexionadas, puños arriba, rebotando en las
# puntas como quien calienta.
nino.POSES["idle0"] = P((12, 20), (13, 14), (14, 9), (14, 24), (14, 29), (10, 25), (9, 29),
                        (14, 18), (16, 15), (11, 18), (13, 16), "corre", [])
nino.POSES["idle1"] = P((12, 21), (13, 15), (14, 10), (15, 25), (14, 29), (10, 26), (9, 29),
                        (14, 19), (17, 17), (11, 19), (14, 17), "corre", [])

nino.vestir(POSES_NUEVAS=True, VOLTERETA=True)   # hoyo, silla y barda

if __name__ == "__main__":
    nino.main("chuy", "Chuy")
