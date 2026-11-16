# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Charco (30×8, textura `puddle`): baches de la calle. Se pasa con un brinco corto, así que son
planos: nada sobresale del piso.

  v0 bache lleno de agua de lluvia        v1 bache de lodo, con una huella y una hojita

No llevan contorno de tinta: la orilla es gris claro y medio transparente, para fundirse con el piso.

Uso:
  python art-src/obstaculos/charco.py <carpeta_de_previas>            hoja de contacto
  python art-src/obstaculos/charco.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, hoja_de_contacto, exportar  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

W, H = 30, 8
ROTO, ROTO_L = R["neutros"][1], R["neutros"][2]      # pavimento roto del borde
ORILLA, ORILLA_ALFA = R["neutros"][3], 128           # orilla gris claro, medio transparente


def _orilla(L):
    """Orilla de 1 px gris claro y medio transparente: se funde con el piso de cualquier ambiente."""
    antes = set(L.p)
    L.contorno(ORILLA)
    im = L.imagen()
    for q in set(L.p) - antes:
        im.putpixel(q, im.getpixel(q)[:3] + (ORILLA_ALFA,))
    return im


def _bache(L):
    """El hueco: borde irregular de pavimento roto."""
    L.elipse(1, 1, 28, 6, ROTO)
    L.rect(4, 1, 5, 1, ROTO_L); L.rect(17, 1, 6, 1, ROTO_L)       # cantos con luz
    L.px(1, 4, ROTO_L); L.px(28, 3, ROTO_L)


def agua():
    """Bache lleno de agua de lluvia: refleja el cielo."""
    s, m, l = R["azul"][1], R["azul"][2], R["azul"][3]
    L = Lienzo(W, H)
    _bache(L)
    L.elipse(3, 2, 26, 5, m)
    L.rect(6, 5, 16, 1, s)                                        # fondo
    L.rect(7, 2, 9, 1, l); L.rect(18, 3, 4, 1, l)                 # reflejo del cielo
    L.px(8, 3, R["neutros"][5]); L.px(9, 3, R["neutros"][5]); L.px(21, 4, R["neutros"][5])
    L.px(12, 2, ROTO); L.px(13, 2, ROTO); L.px(23, 5, ROTO)       # mordidas del pavimento
    return _orilla(L)


def lodo():
    """Bache de lodo, con una huella y una hojita."""
    s, m, l = R["tierra"][1], R["tierra"][2], R["tierra"][3]
    L = Lienzo(W, H)
    _bache(L)
    L.elipse(3, 2, 26, 5, m)
    L.rect(6, 5, 16, 1, s)
    L.rect(8, 2, 7, 1, l); L.px(19, 3, l); L.px(20, 3, l)         # brillo del lodo
    L.px(11, 4, s); L.px(12, 4, s); L.px(14, 3, s)                # huella
    L.px(22, 3, R["verde"][2]); L.px(23, 4, R["verde"][1])        # una hojita
    return _orilla(L)


def variantes():
    return [
        ("v0 · bache con agua", agua(), "Agua de lluvia que\nrefleja el cielo"),
        ("v1 · bache de lodo", lodo(), "Con una huella\ny una hojita"),
    ]


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    vs = variantes()
    assert all(c.size == (W, H) for _, c, _ in vs)
    hoja_de_contacto("Charco", vs, previas / "charco-contacto.png", previas, prop_y=6, paso=260, vuelo=("hop", 48, 0))
    if "--exportar" in sys.argv:
        exportar(vs, "puddle")
    print("previas en", previas, "·", len(vs), "variantes")


if __name__ == "__main__":
    main()
