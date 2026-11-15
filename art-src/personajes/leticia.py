# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Leticia, la mamá (28×46): cuadros de pie, carrera propia y las poses de obstáculo de cuando
persigue. Uniforme de enfermera verde agua, chongo, ojeras y tenis blancos. Cansada y cortante.

Uso:
  python art-src/personajes/leticia.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/leticia.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402
from nino import R, P  # noqa: E402

nino.complexion("adult")
nino.vestir(
    PIEL=R["piel"][4], PIEL_S=R["piel"][3],
    PELO=R["tierra"][0], PELO_L=R["tierra"][1],
    PLAYERA=R["turquesa"][2], PLAYERA_S=R["turquesa"][1],
    SHORT=R["turquesa"][2], SHORT_S=R["turquesa"][1],
    TENIS=R["neutros"][5], TENIS_S=R["neutros"][3], ACENTO=R["neutros"][3],
    PEINADO="chongo", PANTALON=True, PERSIGUE=True, ANCHO=5, OJERAS=True,
)

# Carrera furiosa: a zancadas largas, el cuerpo derecho, los brazos rígidos (sin doblar el codo) y
# el ceño fruncido.
PIERNAS = [(52, 20), (10, -10), (-42, -50), (-34, -90), (12, -85), (64, -14)]
BRAZOS = [(-50, -44), (-24, -20), (28, 34), (48, 54), (20, 26), (-36, -30)]
REBOTE = [0, 1, 0, 0, 1, 0]


def carrera(i):
    b = REBOTE[i]
    return {
        "cadera": (11, 20 + b), "hombro": (13, 14 + b), "cabeza": (14, 9 + b), "cara": "enojo",
        "pierna_c": PIERNAS[i], "pierna_l": PIERNAS[(i + 3) % 6],
        "apoyo_c": i == 1, "apoyo_l": i == 4,
        "brazo_c": BRAZOS[i], "brazo_l": BRAZOS[(i + 3) % 6],
        "trenza": [],
    }


nino.vestir(CARRERA=carrera)

# Quieta se le nota el doble turno: las manos en la cintura, pero los hombros caídos, la cabeza
# vencida hacia adelante, los párpados a medio cerrar y ojeras; respira hondo.
nino.POSES["idle0"] = P((12, 20), (12, 15), (14, 10), (13, 25), (13, 29), (11, 25), (10, 29),
                        (8, 18), (10, 20), (16, 18), (14, 20), "sola", [])
nino.POSES["idle1"] = P((12, 20), (12, 16), (14, 12), (13, 25), (13, 29), (11, 25), (10, 29),
                        (8, 19), (10, 20), (16, 19), (14, 20), "sola", [])
# Triste: el brazo lejano queda escondido tras el cuerpo (con el torso angosto asomaba un pixel).
nino.POSES["sad"] = dict(nino.POSES["sad"], codo_l=(12, 20), mano_l=(12, 23))

if __name__ == "__main__":
    nino.main("leticia", "Leticia")
