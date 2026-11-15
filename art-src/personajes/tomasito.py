# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Tomasito, el hermano de 4 años (20×26): sus cuadros de pie (no corre en ningún nivel). Bien
peinado de raya al lado, playera verde, short amarillo, tenis rojos y su dinosaurio de juguete en
la mano. Chiquito y saltón.

Uso:
  python art-src/personajes/tomasito.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/tomasito.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402
from nino import R, P  # noqa: E402

nino.complexion("toddler")
nino.vestir(
    PIEL=R["piel"][4], PIEL_S=R["piel"][3],
    PELO=R["tierra"][1], PELO_L=R["tierra"][2],
    PLAYERA=R["verde"][2], PLAYERA_S=R["verde"][1],
    SHORT=R["amarillo"][1], SHORT_S=R["amarillo"][0],
    TENIS=R["rojo"][2], TENIS_S=R["rojo"][1], ACENTO=R["neutros"][5],
    JUGUETE=(R["morado"][1], R["morado"][2], R["morado"][0]),
    PEINADO="peinado", SOLO_PARADO=True,
)

# Quieto no se está quieto: derechito, sonriente y dando brinquitos con los brazos abiertos.
nino.POSES["idle0"] = P((12, 20), (12, 15), (13, 10), (13, 25), (13, 29), (11, 25), (10, 29),
                        (14, 18), (16, 20), (10, 18), (8, 20), "corre", [])
nino.POSES["idle1"] = P((12, 19), (12, 14), (13, 9), (14, 24), (14, 28), (11, 24), (9, 28),
                        (15, 16), (17, 15), (9, 16), (7, 15), "feliz", [])

# Festejo: el brinco es más bajo que el de los grandes (con la cabeza tan grande se salía del cuadro).
nino.POSES["cheer1"] = dict(nino.POSES["cheer1"], cadera=(12, 20), hombro=(12, 16), cabeza=(13, 11))

if __name__ == "__main__":
    nino.main("tomasito", "Tomasito")
