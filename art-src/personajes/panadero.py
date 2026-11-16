# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Don Chema, el panadero (28×46): solo los cuadros de pie que usan los diálogos. Gorro de cocinero,
bigote y filipina blanca. Vendedor de mercado, de voz potente.

Uso:
  python art-src/personajes/panadero.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/panadero.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
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
    PLAYERA=R["neutros"][5], PLAYERA_S=R["neutros"][3],
    SHORT=R["tierra"][1], SHORT_S=R["tierra"][0],
    TENIS=R["tierra"][0], TENIS_S=R["tinta"][1], ACENTO=R["tierra"][1],
    GORRA=R["neutros"][5], GORRA_S=R["neutros"][3],
    PEINADO="chef", SOLO_PARADO=True, PANTALON=True, MANGA_LARGA=True, PANZA=True, BIGOTE=True,
    ESTIRA=(1.5, 1.5, 1.45),       # bajo y macizo: así el gorro cabe en el cuadro
)

# Quieto se planta como vendedor: los brazos en jarra, el pecho afuera y la cabeza en alto.
nino.POSES["idle0"] = P((12, 20), (12, 14), (13, 9), (13, 25), (13, 29), (11, 25), (10, 29),
                        (8, 17), (10, 20), (16, 17), (14, 20), "corre", [])
nino.POSES["idle1"] = P((12, 20), (12, 15), (13, 10), (13, 25), (13, 29), (11, 25), (10, 29),
                        (8, 18), (10, 20), (16, 18), (14, 20), "corre", [])

if __name__ == "__main__":
    nino.main("panadero", "Don Chema")
