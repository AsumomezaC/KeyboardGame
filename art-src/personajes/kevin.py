# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Kevin «el Gato» (24×36): todos sus cuadros. Gorra roja al revés, sudadera azul marino y pantalón largo.

Uso:
  python art-src/personajes/kevin.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/kevin.py <carpeta_de_previas> --exportar  además escribe la hoja del juego

Su carrera es propia: relajada, casi sin esfuerzo, con los brazos bajos y sueltos.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402
from nino import R, P  # noqa: E402

nino.complexion("teen")
nino.vestir(
    TINTA=R["tinta"][0],
    PIEL=R["piel"][2], PIEL_S=R["piel"][1],
    PELO=R["tinta"][1], PELO_L=R["neutros"][0],
    PLAYERA=R["azul"][0], PLAYERA_S=R["tinta"][1],
    SHORT=R["neutros"][1], SHORT_S=R["neutros"][0],
    ACENTO=R["rojo"][2],
    PEINADO="gorra", PANTALON=True, MANGA_LARGA=True,
)

# Carrera relajada: zancada larga y suave, casi sin rebote, el torso apenas inclinado, los brazos
# bajos con poco vaivén y la cabeza quieta (no acusa el esfuerzo).
PIERNAS = [(42, 18), (8, -10), (-35, -45), (-25, -80), (10, -75), (52, -12)]
BRAZOS = [(-30, 15), (-15, 30), (15, 55), (30, 70), (12, 50), (-22, 20)]
REBOTE = [0, 1, 0, 0, 1, 0]


def carrera(i):
    b = REBOTE[i]
    return {
        "cadera": (11, 20 + b), "hombro": (13, 14 + b), "cabeza": (14, 9 + b), "cara": "corre",
        "pierna_c": PIERNAS[i], "pierna_l": PIERNAS[(i + 3) % 6],
        "apoyo_c": i == 1, "apoyo_l": i == 4,
        "brazo_c": BRAZOS[i], "brazo_l": BRAZOS[(i + 3) % 6],
        "trenza": [],
    }


nino.vestir(CARRERA=carrera)

# Quieto: la actitud de Los Gatos. Recargado en una pierna, manos en los bolsillos, hombros sueltos.
nino.POSES["idle0"] = P((12, 20), (11, 14), (12, 9), (14, 24), (15, 29), (11, 25), (10, 29),
                        (10, 18), (12, 20), (13, 18), (13, 20), "corre", [])
nino.POSES["idle1"] = P((12, 20), (11, 15), (12, 10), (14, 24), (15, 29), (11, 25), (10, 29),
                        (10, 19), (12, 20), (13, 19), (13, 20), "corre", [])

nino.vestir(POSES_NUEVAS=True, VOLTERETA=True)   # hoyo, silla y barda

if __name__ == "__main__":
    nino.main("kevin", "Kevin «el Gato»")
