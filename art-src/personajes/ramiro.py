# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Ramiro, el papá (28×46): sus cuadros de pie (no corre en ningún nivel). Camiseta interior crema, pantalón café, bigote, barba
de días y la botella en la mano. Desaliñado y teatral.

Uso:
  python art-src/personajes/ramiro.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/ramiro.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402
from nino import R, P  # noqa: E402

nino.complexion("adult")
nino.vestir(
    PIEL=R["piel"][3], PIEL_S=R["piel"][2],
    PELO=R["tinta"][1], PELO_L=R["neutros"][0],
    PLAYERA=R["neutros"][4], PLAYERA_S=R["neutros"][3],
    SHORT=R["tierra"][1], SHORT_S=R["tierra"][0],
    TENIS=R["tierra"][0], TENIS_S=R["tinta"][1], ACENTO=R["tierra"][1],
    RUBOR=R["rojo"][2], BARBA=R["tierra"][2],
    PEINADO="corto", SOLO_PARADO=True, PANTALON=True, SIN_MANGA=True, PANZA=True, BIGOTE=True,
    BOTELLA=(R["verde"][1], R["verde"][3], R["amarillo"][1]),
)

# Quieto se le nota la dejadez: hombros caídos, la mirada baja y la botella colgando de la mano; se
# mece despacio de un lado al otro.
nino.POSES["idle0"] = P((12, 20), (12, 15), (13, 10), (13, 25), (13, 29), (11, 25), (10, 29),
                        (12, 18), (13, 21), (13, 18), (14, 21), "sola", [])
nino.POSES["idle1"] = P((12, 20), (13, 15), (15, 10), (13, 25), (13, 29), (11, 25), (10, 29),
                        (13, 18), (15, 21), (14, 18), (15, 21), "sola", [])

if __name__ == "__main__":
    nino.main("ramiro", "Ramiro")
