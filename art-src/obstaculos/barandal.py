# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Barandal (102×24, textura `rail`): tres barandales de calle, cada uno otro objeto.
Se pasa brincando al tubo de arriba, cruzándolo en equilibrio y bajando de un brinco (`rail` en
choreo.js). Por eso todos tienen:
  - el tubo de arriba recto, corrido de orilla a orilla y sin nada encima, con su cara de arriba en
    la fila 2 (64 px sobre los pies, TOP.rail): Sofía cae en la columna ~6 y lo deja en la ~87;
  - lo que los distingue va debajo del tubo;
  - los postes parados en la banqueta del mapa (que empieza en la fila ~19) y lo plano al pie sin
    tinta (la banqueta rota de la v0).

  v0 barandal amarillo de la banqueta, oxidado, con barrotes doblados y el travesaño caído
  v1 vallas de contención enganchadas, de las de desfile, con una lona amarrada
  v2 barandal de herrería del parque, verde, con aros y barrotes

Uso:
  python art-src/obstaculos/barandal.py <carpeta_de_previas>            hoja de contacto
  python art-src/obstaculos/barandal.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, PIES_Y, ANCHO, exportar, fondo, poner, cuadro_de  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo, fuente  # noqa: E402

W, H = 102, 24
PROP_Y = 2                     # se dibuja 2 px bajo los pies (`y` en LONG_PROPS de choreo.js)
ARRIBA = 2                     # cara de arriba del tubo (la 1 es contorno): 64 px sobre los pies
GRUESO = 3                     # filas del tubo
BASE = H - 2                   # última fila de los postes: la tinta (H-1) queda en la banqueta
PISO = 19                      # primera fila que ya es banqueta del mapa
TINTA = R["tinta"][1]
CAE, DEJA = 6, 87              # columnas donde Sofía cae al tubo y donde lo deja


def tubo(L, luz, color, sombra):
    """El tubo de arriba: recto y corrido de orilla a orilla."""
    L.rect(1, ARRIBA, W - 2, GRUESO, color)
    L.rect(1, ARRIBA, W - 2, 1, luz)
    L.rect(1, ARRIBA + GRUESO - 1, W - 2, 1, sombra)


def unir(P, L, encima=None):
    """P: lo que va sin tinta (barrotes delgados, lo plano del piso). L: lo que lleva contorno."""
    L.contorno(TINTA)
    M = Lienzo(W, H)
    M.p = {**P.p, **L.p, **(encima.p if encima else {})}
    return M.imagen()


def banqueta():
    """Barandal amarillo de los que el municipio pone en la orilla de la banqueta (frente a la
    escuela, en la esquina): ya oxidado, con dos barrotes doblados por un golpe y un travesaño
    que se soltó de un lado. La banqueta está rota al pie de un poste."""
    luz, am, am_s = R["amarillo"][2], R["amarillo"][1], R["amarillo"][0]
    ox, ox_s = R["naranja"][0], R["tierra"][1]
    L, P, E = Lienzo(W, H), Lienzo(W, H), Lienzo(W, H)
    tubo(L, luz, am, am_s)
    postes = (3, 27, 51, 75, 97)
    for x in postes:
        L.rect(x, ARRIBA + GRUESO, 2, BASE - ARRIBA - GRUESO + 1, am)
        L.rect(x + 1, ARRIBA + GRUESO, 1, BASE - ARRIBA - GRUESO + 1, am_s)
    TRAV = 15                                                                    # travesaño de abajo
    for a, b in zip(postes, postes[1:]):
        if a == 51:                                                               # el que se soltó: cuelga hasta el piso
            L.linea((a + 2, TRAV), (b - 3, BASE - 1), am_s)
            continue
        L.rect(a + 2, TRAV, b - a - 2, 1, am_s)
    for a, b in zip(postes, postes[1:]):                                          # barrotes delgados, sin tinta
        for x in range(a + 5, b - 1, 4):
            if a == 27 and x in (36, 40):                                         # dos doblados por un golpe
                P.linea((x, ARRIBA + GRUESO + 1), (x + 3, 10), am_s); P.linea((x + 3, 10), (x + 1, TRAV - 2), am_s)
                continue
            if a == 51:                                                           # donde se cayó el travesaño quedan dos
                if x in (56, 60):
                    P.rect(x, ARRIBA + GRUESO + 1, 1, 6 if x == 56 else 4, am_s)
                continue
            P.rect(x, ARRIBA + GRUESO + 1, 1, TRAV - ARRIBA - GRUESO - 2, am_s)
    for x, w in ((14, 5), (44, 3), (62, 6), (90, 4)):                             # óxido en el tubo (por abajo)
        E.rect(x, ARRIBA + 1, w, GRUESO - 1, ox); E.rect(x + 1, ARRIBA + GRUESO - 1, w - 2, 1, ox_s)
    for x, y, h in ((27, 16, 6), (51, 9, 4), (75, 17, 5), (97, 12, 3), (3, 18, 4)):  # y en los postes
        E.rect(x, y, 2, h, ox); E.px(x + 1, y + h - 1, ox_s)
    for x in range(22, 35):                                                       # banqueta rota al pie del poste
        P.px(x, PISO + 2 + (x * 7) % 2, R["neutros"][1])
    P.rect(24, PISO + 3, 9, 2, R["neutros"][1]); P.rect(25, PISO + 3, 3, 1, R["neutros"][0])
    P.px(35, PISO + 4, R["neutros"][1]); P.px(21, PISO + 4, R["neutros"][1])
    return unir(P, L, E)


def vallas():
    """Tres vallas de contención enganchadas, de las que se ponen en los desfiles y las carreras:
    marco de tubo azul, barrotes delgados, patas planas atravesadas y una lona amarrada en la de en
    medio. Los marcos se enganchan uno con otro y el tubo de arriba queda corrido."""
    luz, az, az_s = R["azul"][3], R["azul"][2], R["azul"][1]
    L, P, E = Lienzo(W, H), Lienzo(W, H), Lienzo(W, H)
    tubo(L, luz, az, az_s)
    ABAJO = 16
    tramos = ((1, 33), (35, 66), (68, 100))
    for a, b in tramos:
        for x in (a, b - 1):                                                      # lados del marco
            L.rect(x, ARRIBA + GRUESO, 2, ABAJO - ARRIBA - GRUESO + 1, az)
            L.rect(x + 1, ARRIBA + GRUESO, 1, ABAJO - ARRIBA - GRUESO + 1, az_s)
        L.rect(a, ABAJO, b - a + 1, 2, az); L.rect(a, ABAJO + 1, b - a + 1, 1, az_s)   # tubo de abajo
        for x in (a + 4, b - 5):                                                  # patas atravesadas
            L.rect(x, ABAJO + 2, 2, BASE - ABAJO - 3, az_s)
            L.rect(x - 2, BASE - 1, 6, 2, az); L.rect(x - 2, BASE, 6, 1, az_s)
        for x in range(a + 4, b - 2, 3):                                          # barrotes delgados, sin tinta
            P.rect(x, ARRIBA + GRUESO + 1, 1, ABAJO - ARRIBA - GRUESO - 2, R["neutros"][2])
    for x in (33, 66):                                                            # ganchos entre vallas
        E.rect(x, ARRIBA + 1, 3, 1, R["neutros"][3]); E.rect(x, 12, 3, 1, R["neutros"][3])
    a, b = tramos[1]                                                              # la lona amarrada
    L.rect(a + 5, 7, b - a - 9, 8, R["amarillo"][1])
    L.rect(a + 5, 13, b - a - 9, 2, R["rosa"][2]); L.rect(a + 5, 7, b - a - 9, 1, R["amarillo"][2])
    for k, x in enumerate(range(a + 8, b - 6, 5)):                                # banderitas pintadas en la lona
        L.px(x, 9, R["rosa"][2]); L.px(x + 1, 9, R["rosa"][2]); L.px(x, 10, R["rosa"][2])
        L.px(x + 2, 10 + k % 2, R["turquesa"][1])
    for x in (a + 6, b - 6):                                                      # mecates
        E.px(x, 6, R["neutros"][4]); E.px(x, 5, R["neutros"][4])
    for x, y in ((12, 9), (13, 10), (80, 13), (88, 8)):                           # raspones del uso
        P.px(x, y, R["neutros"][3])
    return unir(P, L, E)


def parque():
    """Barandal de herrería del parque, pintado de verde: pasamanos de tubo, una hilera de aros
    debajo y barrotes hasta el zoclo. La pintura ya se botó en partes."""
    luz, ve, ve_s = R["verde"][2], R["verde"][1], R["verde"][0]
    L, P, E = Lienzo(W, H), Lienzo(W, H), Lienzo(W, H)
    tubo(L, luz, ve, ve_s)
    postes = (2, 26, 50, 74, 97)
    for x in postes:
        L.rect(x, ARRIBA + GRUESO, 3, BASE - ARRIBA - GRUESO + 1, ve)
        L.rect(x + 2, ARRIBA + GRUESO, 1, BASE - ARRIBA - GRUESO + 1, ve_s)
        L.rect(x, ARRIBA + GRUESO, 1, BASE - ARRIBA - GRUESO + 1, luz)
        L.rect(x - 1, BASE - 1, 5, 2, ve_s)                                       # zapata
    MEDIO, ZOCLO = 10, 18
    for a, b in zip(postes, postes[1:]):
        L.rect(a + 3, ZOCLO, b - a - 3, 1, ve)                                    # solera de abajo
        P.rect(a + 3, MEDIO, b - a - 3, 1, ve_s)                                  # solera de en medio, sin tinta
        for k, x in enumerate(range(a + 5, b - 2, 4)):
            aro = ((0, 0), (-1, 1), (1, 1), (-1, 2), (1, 2), (0, 3))               # aros entre el tubo y la solera
            for dx, dy in aro:
                P.px(x + dx, ARRIBA + GRUESO + 1 + dy, ve_s)
            P.rect(x, MEDIO + 1, 1, ZOCLO - MEDIO - 2, ve_s)                       # barrotes
    for x, y in ((12, ARRIBA + 1), (13, ARRIBA + 1), (40, ARRIBA + 2), (41, ARRIBA + 2), (42, ARRIBA + 1),
                 (66, ARRIBA + 1), (90, ARRIBA + 2), (27, 9), (27, 10), (75, 14), (51, 6)):
        E.px(x, y, R["neutros"][3])                                               # pintura botada: gris claro
    return unir(P, L, E)


def variantes():
    return [
        ("v0 · banqueta", banqueta(), "Barandal amarillo de la banqueta: oxidado, barrotes doblados, un travesaño caído y la banqueta rota al pie"),
        ("v1 · vallas", vallas(), "Vallas de contención enganchadas (desfile, carrera), con una lona amarrada en la de en medio"),
        ("v2 · parque", parque(), "Barandal de herrería del parque: aros y barrotes, y la pintura botada"),
    ]


# Coreografía (choreo.js, caso 'rail', con pre = 70, w = 306, post = 70 de runner.js): puntos clave
# (x desde el arranque, altura de los pies, cuadro, arco).
PRE, ANCHO_PX, FIN = 70, 306, 446
H1, H2 = 0.2 * FIN, 0.74 * FIN
CLAVES = [(0, 0, "ready", 0), (20, 0, "hop", 30), (H1, 64, "land", 0), (H1 + 3, 64, "balance", 0),
          (H2, 64, "balance", 0), (H2 + 3, 64, "hop", 40), (PRE + ANCHO_PX + 44, 0, "land", 0),
          (FIN - 10, 0, "run", 0), (FIN, 0, "run", 0)]
PASOS = [("se prepara", 0), ("brinca", 42), ("cae en el tubo", H1), ("equilibrio", 160), ("equilibrio", 250),
         ("brinca", 366), ("cae", PRE + ANCHO_PX + 44)]


def pose(xs):
    """Lo mismo que longPose de choreo.js: (cuadro, altura de los pies)."""
    i = max(k for k, c in enumerate(CLAVES) if c[0] <= xs + 0.5)
    a, b = CLAVES[i], CLAVES[min(i + 1, len(CLAVES) - 1)]
    q = 0 if a is b else min(1, max(0, (xs - a[0]) / (b[0] - a[0])))
    alto = a[1] + (b[1] - a[1]) * q + a[3] * math.sin(math.pi * q)
    nombre = f"balance{int(xs // 22) % 2}" if a[2] == "balance" else a[2]
    return nombre, alto


def sofia(previas, nombre):
    for carpeta in (previas, previas.parent):
        ruta = carpeta / f"sofia-teen-{nombre}.png"
        if ruta.exists():
            return Image.open(ruta).convert("RGBA")
    return cuadro_de("sofia", {"land": "ready", "balance0": "idle0", "balance1": "idle1"}.get(nombre, nombre))


def hoja(vs, ruta, previas):
    """Hoja de contacto: cada variante ampliada y, debajo, cada una dentro del juego a ×3 con Sofía
    haciendo la maniobra paso a paso (Sofía niña quieta a la izquierda, para comparar tamaños)."""
    esc, corte = 6, (0, 236, ANCHO, 486)
    alto_v = H * esc + 46
    im = Image.new("RGB", (ANCHO + 24, 40 + len(vs) * alto_v + 8 + len(vs) * (corte[3] - corte[1] + 30) + 12), "#211624")
    d = ImageDraw.Draw(im)
    d.text((12, 8), f"Barandal · {len(vs)} variantes ({W}×{H}, ×{esc})", fill="#f4ecd8", font=fuente(18))
    for k, (nombre, cuadro, texto) in enumerate(vs):
        y = 40 + k * alto_v
        d.rectangle([12, y, 12 + W * esc - 1, y + H * esc - 1], fill=R["neutros"][3])
        g = cuadro.resize((W * esc, H * esc), Image.NEAREST)
        im.paste(g, (12, y), g)
        d.text((12 + W * esc + 14, y + 4), nombre, fill="#ffd23f", font=fuente(14))
        palabras, renglon, n = texto.split(), "", 0
        for p in palabras + [None]:                                               # texto en renglones
            if p is None or len(renglon) + len(p) > 38:
                d.text((12 + W * esc + 14, y + 26 + n * 16), renglon, fill="#a898ad", font=fuente(12))
                renglon, n = "", n + 1
            if p:
                renglon = (renglon + " " + p).strip()
    y = 40 + len(vs) * alto_v + 8
    x0 = 250
    for k, (nombre, cuadro, _) in enumerate(vs):
        d.text((12, y), f"{nombre} dentro del juego (×3, fondo del barrio), la maniobra paso a paso con Sofía adolescente:",
               fill="#f4ecd8", font=fuente(13))
        escena = fondo(previas)
        poner(escena, cuadro_de("sofia", "idle0"), 90, PIES_Y, centro=True)
        poner(escena, cuadro, x0 + PRE, PIES_Y + PROP_Y)
        for _, xs in PASOS:
            nombre_c, alto = pose(xs)
            poner(escena, sofia(previas, nombre_c), x0 + xs, PIES_Y - alto, centro=True)
        im.paste(escena.crop(corte).convert("RGB"), (12, y + 22))
        y += corte[3] - corte[1] + 30
    im.save(ruta)


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    vs = variantes()
    for nombre, cuadro, _ in vs:
        assert cuadro.size == (W, H), nombre
        assert all(cuadro.getpixel((x, ARRIBA))[3] for x in range(1, W - 1)), f"{nombre}: el tubo no es corrido"
        assert all(cuadro.getpixel((x, ARRIBA - 1))[:3] == (0x2b, 0x1d, 0x2e) for x in range(1, W - 1)), f"{nombre}: hay algo sobre el tubo"
        assert not any(cuadro.getpixel((x, 0))[3] for x in range(W)), f"{nombre}: hay algo encima del tubo"
    hoja(vs, previas / "barandal-contacto.png", previas)
    if "--exportar" in sys.argv:
        exportar(vs, "rail")
    print("previas en", previas, "·", len(vs), "variantes")


if __name__ == "__main__":
    main()
