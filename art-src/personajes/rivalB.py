# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Corredor rival B (24×32): todos sus cuadros. Cola de caballo pelirroja con liga verde, playera verde y short morado.

Solo corre en las carreras (sin historia): carrera común, quieto derecho y con las poses nuevas de
obstáculo (hoyo, silla y barda), como los demás que corren.

Uso:
  python art-src/personajes/rivalB.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/rivalB.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402
from nino import R  # noqa: E402

nino.vestir(
    PIEL=R["piel"][4], PIEL_S=R["piel"][3],
    PELO=R["naranja"][0], PELO_L=R["naranja"][1],
    PLAYERA=R["verde"][2], PLAYERA_S=R["verde"][1],
    SHORT=R["morado"][1], SHORT_S=R["morado"][0],
    ACENTO=R["morado"][1], LIGA=R["verde"][3], PEINADO="cola",
)
nino.POSES.update(nino.QUIETO_DERECHO)          # quieto derecho (la postura encogida es solo de Sofía)
nino.vestir(POSES_NUEVAS=True, VOLTERETA=True)   # hoyo, silla y barda

if __name__ == "__main__":
    nino.main("rivalB", "Corredor rival B")
