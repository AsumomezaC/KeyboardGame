# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Brayan (24×36): todos sus cuadros. Pelo güero revuelto, playera azul y pantalón largo. Es el
hablador del grupo y nunca está quieto.

Uso:
  python art-src/personajes/brayan.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/brayan.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402
from nino import R, P  # noqa: E402

nino.complexion("teen")
nino.vestir(
    PIEL=R["piel"][5], PIEL_S=R["piel"][4],
    PELO=R["amarillo"][0], PELO_L=R["amarillo"][1],
    PLAYERA=R["azul"][2], PLAYERA_S=R["azul"][1],
    SHORT=R["azul"][0], SHORT_S=R["tinta"][1],
    ACENTO=R["azul"][2],
    PEINADO="revuelto", PANTALON=True,
)

# Quieto no puede estarse quieto: se mece de un pie al otro, con una rodilla doblada y los brazos
# sueltos que suben y bajan. Los brazos van por fuera del torso (la mano no pisa la playera).
nino.POSES["idle0"] = P((11, 20), (11, 14), (12, 9), (14, 24), (15, 28), (10, 25), (9, 29),
                        (8, 17), (7, 20), (15, 17), (16, 20), "corre", [])
nino.POSES["idle1"] = P((13, 20), (13, 15), (15, 10), (14, 25), (15, 29), (10, 24), (8, 28),
                        (10, 18), (8, 17), (17, 18), (18, 16), "corre", [])

if __name__ == "__main__":
    nino.main("brayan", "Brayan")
