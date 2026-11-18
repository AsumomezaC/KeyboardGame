# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Corredor rival A (24×32): todos sus cuadros. Pelo corto negro, playera azul y short gris oscuro.

Solo corre en las carreras (sin historia): carrera común, quieto derecho y con las poses nuevas de
obstáculo (hoyo, silla y barda), como los demás que corren.

Uso:
  python art-src/personajes/rivalA.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/rivalA.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402
from nino import R  # noqa: E402

nino.vestir(
    PIEL=R["piel"][2], PIEL_S=R["piel"][1],
    PELO=R["neutros"][0], PELO_L=R["neutros"][1],
    PLAYERA=R["azul"][2], PLAYERA_S=R["azul"][1],
    SHORT=R["neutros"][0], SHORT_S=R["tinta"][1],
    ACENTO=R["azul"][1], PEINADO="corto",
)
nino.POSES.update(nino.QUIETO_DERECHO)          # quieto derecho (la postura encogida es solo de Sofía)
nino.vestir(POSES_NUEVAS=True, VOLTERETA=True)   # hoyo, silla y barda

if __name__ == "__main__":
    nino.main("rivalA", "Corredor rival A")
