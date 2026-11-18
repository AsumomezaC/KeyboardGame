# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Corredor rival C (24×32): todos sus cuadros. Piel oscura, pelo corto negro, playera lila y short azul marino.

Solo corre en las carreras (sin historia): carrera común, quieto derecho y con las poses nuevas de
obstáculo (hoyo, silla y barda), como los demás que corren.

Uso:
  python art-src/personajes/rivalC.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/rivalC.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402
from nino import R  # noqa: E402

nino.vestir(
    TINTA=R["tinta"][0],
    PIEL=R["piel"][1], PIEL_S=R["piel"][0],
    PELO=R["tinta"][1], PELO_L=R["neutros"][0],
    PLAYERA=R["morado"][2], PLAYERA_S=R["morado"][1],
    SHORT=R["azul"][0], SHORT_S=R["tinta"][1],
    ACENTO=R["amarillo"][1], RUBOR=R["tierra"][2], PEINADO="corto",
)
nino.POSES.update(nino.QUIETO_DERECHO)          # quieto derecho (la postura encogida es solo de Sofía)
nino.vestir(POSES_NUEVAS=True, VOLTERETA=True)   # hoyo, silla y barda

if __name__ == "__main__":
    nino.main("rivalC", "Corredor rival C")
