# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""La Tata, la abuela de Dani (28×46): cuadros de pie, carrera propia y las poses de obstáculo de
cuando persigue. Canas en chongo, lentes, blusa morada y mandil crema. Suave y cariñosa.

Uso:
  python art-src/personajes/tata.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/tata.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402
from nino import R, P  # noqa: E402

nino.complexion("adult")
nino.vestir(
    PIEL=R["piel"][3], PIEL_S=R["piel"][2],
    PELO=R["neutros"][3], PELO_L=R["neutros"][5],
    PLAYERA=R["morado"][1], PLAYERA_S=R["morado"][0],
    SHORT=R["neutros"][1], SHORT_S=R["neutros"][0],
    TENIS=R["tierra"][1], TENIS_S=R["tierra"][0], ACENTO=R["tierra"][1],
    PEINADO="chongo", PANTALON=True, MANGA_LARGA=True, PERSIGUE=True,
    LENTES=R["tierra"][1], CENO_ALTO=True, MANDIL=(R["neutros"][4], R["neutros"][3]),
    ESTIRA=(1.55, 1.45, 1.4),      # más bajita que los papás
)

# Carrera de abuela: pasitos cortos y rápidos, el cuerpo un poco echado hacia adelante, los codos
# doblados y pegados al cuerpo, y el ceño fruncido.
PIERNAS = [(26, 14), (6, -6), (-20, -28), (-16, -50), (10, -46), (32, -8)]
BRAZOS = [(-20, 70), (-8, 85), (12, 100), (20, 110), (8, 95), (-12, 80)]
REBOTE = [0, 1, 0, 0, 1, 0]


def carrera(i):
    b = REBOTE[i]
    return {
        "cadera": (11, 20 + b), "hombro": (13, 14 + b), "cabeza": (15, 9 + b), "cara": "enojo",
        "pierna_c": PIERNAS[i], "pierna_l": PIERNAS[(i + 3) % 6],
        "apoyo_c": i == 1, "apoyo_l": i == 4,
        "brazo_c": BRAZOS[i], "brazo_l": BRAZOS[(i + 3) % 6],
        "trenza": [],
    }


nino.vestir(CARRERA=carrera)

# Quieta espera con las manos juntas sobre el mandil, un poco encorvada; respira despacio.
nino.POSES["idle0"] = P((12, 20), (12, 15), (13, 10), (13, 25), (13, 29), (11, 25), (10, 29),
                        (10, 18), (13, 20), (15, 18), (14, 20), "corre", [])
nino.POSES["idle1"] = P((12, 20), (12, 16), (13, 11), (13, 25), (13, 29), (11, 25), (10, 29),
                        (10, 19), (13, 20), (15, 19), (14, 20), "corre", [])

if __name__ == "__main__":
    nino.main("tata", "La Tata")
