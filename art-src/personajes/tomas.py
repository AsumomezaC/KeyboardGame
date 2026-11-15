# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Tomás, el hermano a los 8 años (24×32): sus cuadros de pie (no corre en ningún nivel). El mismo
niño bien peinado de raya al lado y playera verde, ahora con short azul y sin el dinosaurio de
juguete («eso era de chiquito»).

Uso:
  python art-src/personajes/tomas.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/tomas.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402
from nino import R, P  # noqa: E402

nino.vestir(
    PIEL=R["piel"][4], PIEL_S=R["piel"][3],
    PELO=R["tierra"][1], PELO_L=R["tierra"][2],
    PLAYERA=R["verde"][2], PLAYERA_S=R["verde"][1],
    SHORT=R["azul"][1], SHORT_S=R["azul"][0],
    TENIS=R["rojo"][2], TENIS_S=R["rojo"][1], ACENTO=R["neutros"][5],
    PEINADO="peinado", SOLO_PARADO=True,
)

# Quieto: derecho y tranquilo, con los brazos a los lados; ya no brinca como de chiquito.
nino.POSES["idle0"] = P((12, 20), (12, 14), (13, 9), (13, 25), (13, 29), (11, 25), (10, 29),
                        (13, 18), (14, 21), (11, 18), (10, 21), "corre", [])
nino.POSES["idle1"] = P((12, 20), (12, 15), (13, 10), (13, 25), (13, 29), (11, 25), (10, 29),
                        (13, 19), (14, 22), (11, 19), (10, 22), "corre", [])

if __name__ == "__main__":
    nino.main("tomas", "Tomás")
