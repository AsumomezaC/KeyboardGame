# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Dani (24×32): todos sus cuadros. Pelo revuelto, lentes, playera naranja y short azul.

Uso:
  python art-src/personajes/dani.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/dani.py <carpeta_de_previas> --exportar  además escribe la hoja del juego

Su carrera es propia: torpe, con los brazos desordenados. Trae además el cuadro «run4_t», en el que
casi tropieza: el juego lo usa solo en uno de cada cuatro ciclos de carrera.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402
from nino import R, P  # noqa: E402

nino.vestir(
    PIEL=R["piel"][3], PIEL_S=R["piel"][2],
    PELO=R["neutros"][0], PELO_L=R["neutros"][1],
    PLAYERA=R["naranja"][1], PLAYERA_S=R["naranja"][0],
    SHORT=R["azul"][1], SHORT_S=R["azul"][0],
    ACENTO=R["azul"][2],
    PEINADO="revuelto", LENTES=R["tinta"][1],
)

# Carrera torpe: va casi derecho, levanta mucho las rodillas, los brazos no llevan el compás de las
# piernas (van dos cuadros desfasados y muy abiertos). En la variante de tropiezo del cuadro 4 se va
# de frente con cara de susto.
PIERNAS = [(40, 30), (8, -8), (-30, -40), (-25, -80), (22, -110), (70, -40)]
BRAZOS = [(-80, -60), (-40, 10), (60, 150), (100, 170), (30, 60), (-60, -120)]
REBOTE = [0, 1, -1, 0, 1, -1]


def carrera(i, tropieza=False):
    b = REBOTE[i] + (1 if tropieza else 0)
    return {
        "cadera": (11, 20 + min(b, 1)),
        "hombro": (13 if tropieza else 12, 14 + b),
        "cabeza": (15 if tropieza else 14, 9 + REBOTE[(i - 1) % 6] + (1 if tropieza else 0)),
        "cara": "susto" if tropieza else "habla",
        "pierna_c": PIERNAS[i], "pierna_l": PIERNAS[(i + 3) % 6],
        "apoyo_c": i == 1, "apoyo_l": i == 4,
        "brazo_c": BRAZOS[i], "brazo_l": BRAZOS[(i + 2) % 6],
        "trenza": [],
    }


nino.vestir(CARRERA=carrera)
nino.EXTRAS["run4_t"] = carrera(4, tropieza=True)

# Quieto: derecho y tranquilo, con los brazos a los lados y una sonrisa (la postura encogida es de Sofía).
nino.POSES["idle0"] = P((12, 20), (12, 14), (13, 9), (13, 25), (13, 29), (11, 25), (10, 29),
                        (11, 18), (11, 21), (13, 18), (14, 21), "corre", [])
nino.POSES["idle1"] = P((12, 20), (12, 15), (13, 10), (13, 25), (13, 29), (11, 25), (10, 29),
                        (11, 19), (11, 22), (13, 19), (14, 22), "corre", [])

if __name__ == "__main__":
    nino.main("dani", "Dani")
