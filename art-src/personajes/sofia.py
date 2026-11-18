# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Sofía niña (24×32): todos sus cuadros (carrera, espera, festejo, obstáculos, caída, calentamiento y gestos).

Uso:
  python art-src/personajes/sofia.py <carpeta_de_previas>            hoja de contacto y GIF
  python art-src/personajes/sofia.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
                                                                      en public/assets/sprites/

El muñeco, sus colores por defecto, la carrera ligera con la trenza al viento y la postura quieta
(pequeña y sola) son los de Sofía: están en nino.py, que comparten los demás niños. Además trae las
poses nuevas de obstáculo (`nino.NUEVAS`: despegue, caída y rodada del hoyo; `nino.VOLTERETAS` y
la carrera por la pared: voltereta de la silla y la barda).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import nino  # noqa: E402

nino.vestir(POSES_NUEVAS=True, VOLTERETA=True)   # hoyo, silla y barda

if __name__ == "__main__":
    nino.main("sofia", "Sofía niña")
