# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato de Tomás, el hermano a los 8 años, para los diálogos (48×48): 8 gestos, con parpadeo
(«_b») y boca al hablar («_m»). El mismo niño de raya al lado y playera verde, ya sin el dinosaurio
de juguete y más serio en reposo.

Uso:
  python art-src/retratos/tomas.py <carpeta_de_previas>             hoja de contacto y GIF
  python art-src/retratos/tomas.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import retrato  # noqa: E402
import tomasito  # noqa: E402,F401  (mismo aspecto: pelo, piel y playera)

# Ya no carga el juguete, y en reposo ya no sonríe de oreja a oreja: boca tranquila, casi seria.
retrato.vestir(COLGANTE=None, ADORNO_EXTRA=None)
retrato.GESTOS["idle"] = dict(cejas="suaves", ojos="abiertos", boca="linea", habla="chica", dy=0)
retrato.GESTOS["talk"] = dict(cejas="suaves", ojos="abiertos", boca="sonrisa", habla="abierta", dy=0)

if __name__ == "__main__":
    retrato.main("tomas", "Tomás")
