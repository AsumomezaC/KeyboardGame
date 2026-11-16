# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Gis (14×5, textura `chalk`): dibujos de gis en la banqueta. No se brinca: se pasa corriendo
por encima, así que es plano y va pegado al piso.

  v0 flecha blanca        v1 avioncito (rayuela) amarillo        v2 corazón y flor rosas

Uso:
  python art-src/obstaculos/gis.py <carpeta_de_previas>            hoja de contacto
  python art-src/obstaculos/gis.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
  (con --contorno dibuja la versión con contorno de tinta, más chica para caber en el cuadro)
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, hoja_de_contacto, exportar  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

W, H = 14, 5
TINTA = R["tinta"][1]
BLANCO, AMARILLO, ROSA, ROSA_S = R["neutros"][5], R["amarillo"][1], R["rosa"][3], R["rosa"][2]


def _caja(contorno):
    """Zona donde se dibuja: todo el cuadro, o 1 px adentro si lleva contorno."""
    return (1, 1, W - 2, H - 2) if contorno else (0, 0, W, H)


def _fin(L, contorno):
    if contorno:
        L.contorno(TINTA)
    return L.imagen()


def flecha(contorno=False):
    """Flecha de gis blanca: «por aquí»."""
    x, y, w, h = _caja(contorno)
    L = Lienzo(W, H)
    m = y + h // 2
    L.rect(x, m, w - 1, 1, BLANCO)
    for k in range(1, h // 2 + 1):                    # punta
        L.px(x + w - 1 - k, m - k, BLANCO); L.px(x + w - 1 - k, m + k, BLANCO)
    L.px(x + w - 1, m, BLANCO)
    return _fin(L, contorno)


def avion(contorno=False):
    """Avioncito (rayuela) amarillo, visto en el piso: las casillas dobles son más anchas que las
    sencillas (ocupan todo el alto del cuadro y van partidas a la mitad)."""
    L = Lienzo(W, H)
    if contorno:                                      # con contorno no cabe la casilla doble
        x, y, w, h = _caja(True)
        L.rect(x, y, w - 1, 1, AMARILLO); L.rect(x, y + h - 1, w - 1, 1, AMARILLO)
        for k in (0, 3, 6, 10):
            L.rect(x + k, y, 1, h, AMARILLO)
        L.px(x + w - 1, y + 1, AMARILLO)
        return _fin(L, True)

    def casilla(x0, x1, doble=False):
        y0, y1 = (0, H - 1) if doble else (1, H - 2)
        L.rect(x0, y0, x1 - x0 + 1, 1, AMARILLO); L.rect(x0, y1, x1 - x0 + 1, 1, AMARILLO)
        L.rect(x0, y0, 1, y1 - y0 + 1, AMARILLO); L.rect(x1, y0, 1, y1 - y0 + 1, AMARILLO)
        if doble:
            L.rect(x0, H // 2, x1 - x0 + 1, 1, AMARILLO)

    casilla(0, 3); casilla(3, 6); casilla(6, 9, doble=True); casilla(9, 12)
    L.px(13, 2, AMARILLO)                             # el «cielo» redondo
    return _fin(L, False)


def corazon(contorno=False):
    """Garabatos rosas: un corazón y una flor."""
    x, y, w, h = _caja(contorno)
    L = Lienzo(W, H)
    if h >= 5:
        for j, fila in enumerate((".#.#.", "#####", "#####", ".###.", "..#..")):
            for i, c in enumerate(fila):
                if c == "#":
                    L.px(x + 1 + i, y + j, ROSA)
        L.px(x + 2, y + 1, BLANCO)                    # brillo
        fx = x + 10                                   # flor
        L.rect(fx - 1, y + 2, 3, 1, ROSA_S); L.rect(fx, y + 1, 1, 3, ROSA_S)
        L.px(fx, y + 2, AMARILLO)
        L.px(fx + 2, y + 4, BLANCO); L.px(fx - 3, y, BLANCO)   # puntitos de gis
    else:
        for j, fila in enumerate(("#.#", "###", ".#.")):
            for i, c in enumerate(fila):
                if c == "#":
                    L.px(x + 1 + i, y + j, ROSA)
        fx = x + 8
        L.rect(fx - 1, y + 1, 3, 1, ROSA_S); L.rect(fx, y, 1, 3, ROSA_S)
        L.px(fx, y + 1, AMARILLO)
    return _fin(L, contorno)


def variantes(contorno=False):
    cola = " · contorno" if contorno else ""
    return [
        ("v0 · flecha" + cola, flecha(contorno), "Blanca: «por aquí»"),
        ("v1 · avioncito" + cola, avion(contorno), "Rayuela amarilla,\nde banqueta y patio"),
        ("v2 · garabatos" + cola, corazon(contorno), "Corazón y flor,\nde niños del barrio"),
    ]


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    contorno = "--contorno" in sys.argv
    vs = variantes(contorno)
    assert all(c.size == (W, H) for _, c, _ in vs)
    hoja_de_contacto("Gis", variantes(True) if contorno else variantes(False), previas / "gis-contacto.png", previas, prop_y=4, paso=200, esc=11)
    if "--exportar" in sys.argv:
        exportar(vs, "chalk")
    print("previas en", previas, "·", len(vs), "variantes")


if __name__ == "__main__":
    main()
