# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Barda alta (52×71, textura `highwall`): tres bardas altas de barrio, cada una de otro material.
Se pasa colgándose del borde de arriba por el lado izquierdo, subiendo, avanzando agachada por
encima y bajando de un salto con voltereta (`highwall` en choreo.js). Por eso todas tienen:
  - un remate de arriba que sobresale 2 px a los lados (de ahí se agarran las manos al colgarse,
    a la izquierda, con los pies a 109 px y el centro 10 px antes de la barda);
  - la cara de arriba plana, corrida y sin nada encima en la fila 1 (196 px, TOP.highwall), por
    donde avanza agachada;
  - sin púas ni vidrios.
La barda atraviesa toda la banqueta y baja hasta la guarnición: por eso Sofía tiene que pasarla por
encima. La hoja mide 71 de alto y se dibuja 17 px por debajo de los pies (`y` en LONG_PROPS de
choreo.js); la cara de arriba sigue a 196 px.

  v0 encalada con rótulo pintado a mano de baile sonidero
  v1 de escuela pública, con el mural de los niños en toda la barda, muy despintado
  v2 muro de piedra braza con una bugambilia que cuelga

Uso:
  python art-src/obstaculos/barda_alta.py <carpeta_de_previas>            hoja de contacto
  python art-src/obstaculos/barda_alta.py <carpeta_de_previas> --exportar  además escribe la hoja del juego
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, PIES_Y, hoja_de_contacto, exportar, fondo, poner, cuadro_de  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo, fuente  # noqa: E402

W, H = 52, 71
PROP_Y = 17                    # se dibuja 17 px bajo los pies: el pie cae en la guarnición
ARRIBA = 1                     # cara de arriba (la 0 es contorno): 196 px sobre los pies
REMATE = 4                     # filas del remate que sobresale
X0, X1 = 3, W - 4              # orillas de la pared (el remate va de 1 a W-2)
BASE = H - 2                   # última fila de la pared: la tinta (H-1) cae en la guarnición
TINTA = R["tinta"][1]

LETRAS = {
    "A": [".#.", "#.#", "###", "#.#", "#.#"], "B": ["##.", "#.#", "##.", "#.#", "##."],
    "E": ["###", "#..", "##.", "#..", "###"], "G": ["###", "#..", "#.#", "#.#", "###"],
    "I": ["###", ".#.", ".#.", ".#.", "###"], "L": ["#..", "#..", "#..", "#..", "###"],
    "N": ["#..#", "##.#", "#.##", "#..#", "#..#"], "R": ["##.", "#.#", "##.", "#.#", "#.#"],
    "S": ["###", "#..", "###", "..#", "###"], "O": ["###", "#.#", "#.#", "#.#", "###"],
    "D": ["##.", "#.#", "#.#", "#.#", "##."],
}


def ancho_texto(s, esc=1):
    return sum((len(LETRAS[c][0]) + 1) * esc for c in s) - esc


def texto(L, x, y, s, color, sombra=None, esc=1):
    for c in s:
        filas = LETRAS[c]
        for capa, (d, col) in enumerate(((1, sombra), (0, color))):
            if col is None:
                continue
            for dy, fila in enumerate(filas):
                for dx, m in enumerate(fila):
                    if m == "#":
                        L.rect(x + dx * esc + d, y + dy * esc + d, esc, esc, col)
        x += (len(filas[0]) + 1) * esc


def centro(s, esc=1):
    return round((W - ancho_texto(s, esc)) / 2)


def cuerpo(L, color, remate, remate_l, remate_s):
    """La pared y su remate: arriba plano y corrido, sobresale 2 px a cada lado."""
    L.rect(X0, ARRIBA + REMATE, X1 - X0 + 1, BASE - ARRIBA - REMATE + 1, color)
    L.rect(1, ARRIBA, W - 2, REMATE, remate)
    L.rect(1, ARRIBA, W - 2, 1, remate_l)
    L.rect(1, ARRIBA + REMATE - 1, W - 2, 1, remate_s)


def unir(P, L):
    L.contorno(TINTA)
    M = Lienzo(W, H)
    M.p = {**P.p, **L.p}
    return M.imagen()


def baile():
    """Barda encalada con el rótulo de un baile sonidero pintado a mano: «GRAN BAILE» con sombra,
    estrellitas y la fecha en un listón; remate y guardapolvo rojos, la cal descarapelada."""
    cal, cal_s = R["neutros"][4], R["neutros"][3]
    L = Lienzo(W, H)
    cuerpo(L, cal, R["rojo"][2], R["rojo"][3], R["rojo"][1])
    L.rect(X0, BASE - 9, X1 - X0 + 1, 10, R["rojo"][1]); L.rect(X0, BASE - 9, X1 - X0 + 1, 1, R["rojo"][2])  # guardapolvo
    L.rect(X1, ARRIBA + REMATE, 1, BASE - 9 - ARRIBA - REMATE, cal_s)             # sombra del lado
    texto(L, centro("GRAN", 2), 7, "GRAN", R["azul"][1], R["tinta"][1], esc=2)
    texto(L, centro("BAILE", 2), 20, "BAILE", R["rosa"][2], R["tinta"][1], esc=2)
    for x, y in ((5, 9), (46, 10), (6, 31), (45, 30)):                            # estrellitas
        c = R["amarillo"][1]
        L.px(x, y, c); L.px(x - 1, y, c); L.px(x + 1, y, c); L.px(x, y - 1, c); L.px(x, y + 1, c)
    L.rect(9, 33, 34, 8, R["amarillo"][1]); L.rect(9, 40, 34, 1, R["amarillo"][0])  # listón con la fecha
    L.px(8, 34, R["amarillo"][1]); L.px(8, 39, R["amarillo"][1]); L.px(43, 34, R["amarillo"][1]); L.px(43, 39, R["amarillo"][1])
    x = centro("SABADO")
    texto(L, x, 35, "SABADO", R["rojo"][1])
    L.px(x + 6, 34, R["rojo"][1]); L.px(x + 5, 33, R["amarillo"][1])            # acento de «SÁBADO»
    L.px(x + 6, 33, R["rojo"][1])
    for x0, y0, w, h in ((4, 42, 7, 5), (38, 43, 7, 3)):                         # cal caída: gris claro parejo
        L.rect(x0, y0, w, h, R["neutros"][3])
        L.px(x0, y0, cal); L.px(x0 + w - 1, y0 + h - 1, cal)
    return unir(Lienzo(W, H), L)


def escuela():
    """Barda de escuela pública con el mural que pintaron los niños: cielo, sol con cara, cerros,
    un árbol y dos niños de la mano. La pintura cubre toda la barda, hasta la guarnición, y el sol
    ya la deslavó y la descarapeló a cachos. Remate pintado de blanco."""
    cielo, cerro, cerro_s = R["azul"][2], R["verde"][2], R["verde"][1]
    L = Lienzo(W, H)
    cuerpo(L, cielo, R["neutros"][4], R["neutros"][5], R["neutros"][3])
    L.rect(X0, ARRIBA + REMATE, X1 - X0 + 1, 3, R["azul"][3])                     # cielo más claro arriba
    L.elipse(-8, 30, 30, 100, cerro, solo=cielo); L.elipse(20, 34, 62, 104, cerro_s, solo=cielo)  # cerros
    L.elipse(22, 36, 60, 104, cerro, solo=cerro_s)
    L.rect(X0, 52, X1 - X0 + 1, BASE - 51, cerro_s, solo=cielo)                   # el pasto llena el pie
    for x, y, c in ((8, 58, R["amarillo"][1]), (15, 62, R["rosa"][2]), (26, 57, R["amarillo"][1]),
                    (34, 63, R["rosa"][2]), (43, 59, R["amarillo"][1]), (11, 66, R["morado"][1])):
        L.px(x, y, c); L.px(x, y + 1, R["verde"][0])                              # florecitas del pasto
    sol, sol_s = R["amarillo"][1], R["naranja"][1]                                # sol con cara
    L.elipse(7, 9, 16, 18, sol)
    for dx, dy in ((-2, 0), (2, 0), (0, -2), (0, 2)):
        L.px(11 + dx * 3 + (1 if dx > 0 else 0), 13 + dy * 3 + (1 if dy > 0 else 0), sol_s)
    L.px(10, 12, R["tinta"][1]); L.px(13, 12, R["tinta"][1]); L.rect(10, 15, 4, 1, sol_s)
    L.rect(39, 22, 3, 14, R["tierra"][2])                                         # árbol
    L.elipse(33, 12, 47, 25, R["verde"][1]); L.elipse(35, 13, 45, 22, R["verde"][2])
    for x, y in ((37, 16), (42, 18), (39, 20)):
        L.px(x, y, R["rojo"][2])                                                  # naranjas del árbol
    for cx, ropa in ((20, R["rojo"][2]), (28, R["morado"][1])):                   # dos niños de la mano
        L.rect(cx, 33, 3, 3, R["piel"][3]); L.rect(cx, 32, 3, 1, R["tierra"][0])
        L.rect(cx, 36, 3, 5, ropa); L.rect(cx, 41, 1, 4, R["azul"][0]); L.rect(cx + 2, 41, 1, 4, R["azul"][0])
    L.rect(23, 37, 5, 1, R["piel"][3])
    despintar(L, cielo)
    return unir(Lienzo(W, H), L)


def despintar(L, cielo):
    """Deslava la pintura con el sol (a pixeles sueltos, más arriba que abajo) y le quita cachos
    disparejos: se ve el aplanado, gris claro parejo como la cal caída de la v0. Los niños y el sol
    quedan casi enteros, para que se lea el mural."""
    cal = orilla = R["neutros"][3]                                               # todo lo caído, gris claro parejo
    claro = {cielo: R["azul"][3], R["azul"][3]: R["neutros"][4], R["verde"][2]: R["verde"][3],
             R["verde"][1]: R["verde"][2], R["amarillo"][1]: R["amarillo"][2], R["tierra"][2]: R["tierra"][3]}
    dentro = lambda x, y: X0 <= x <= X1 and ARRIBA + REMATE <= y <= BASE
    revuelto = lambda x, y: (x * 92821 ^ y * 68917 ^ x * y * 31) % 97
    for (x, y), c in list(L.p.items()):                                           # deslavado del sol
        if dentro(x, y) and c in claro and revuelto(x, y) < (30 if y < 30 else 16):
            L.p[(x, y)] = claro[c]
    cuidar = lambda x, y: 19 <= x <= 31 and 31 <= y <= 45 or 6 <= x <= 17 and 8 <= y <= 19
    azar = 11
    for cx, cy, n in ((24, 8, 14), (41, 7, 9), (5, 22, 12), (30, 26, 7), (45, 30, 10), (12, 34, 6),
                      (37, 44, 13), (6, 47, 9), (24, 51, 8), (44, 55, 7), (14, 60, 12), (33, 64, 9),
                      (47, 66, 5), (20, 22, 5)):                                  # cachos caídos
        caido, x, y = set(), cx, cy
        for _ in range(n):                                                        # crecen al azar
            if dentro(x, y) and not cuidar(x, y):
                caido.add((x, y))
            azar = (azar * 37 + 23) % 211
            dx, dy = ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 0), (0, 1))[azar % 6]
            x, y = x + dx, y + dy
            if azar % 4 == 0:
                x, y = cx + (azar // 7) % 3 - 1, cy
        for q in caido:
            L.p[q] = cal
        for x, y in caido:                                                        # la orilla del cacho
            for q in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if q not in caido and q in L.p and dentro(*q) and not cuidar(*q):
                    L.p[q] = orilla


def piedra():
    """Muro de piedra braza (de contención) con remate de cemento y una bugambilia que cuelga por la
    derecha, sin pasar por arriba."""
    junta = R["neutros"][3]
    tonos = [R["tierra"][3], R["neutros"][2], R["tierra"][2], R["neutros"][1], R["tierra"][4]]
    L = Lienzo(W, H)
    cuerpo(L, junta, R["neutros"][3], R["neutros"][4], R["neutros"][2])
    azar = 7
    y = ARRIBA + REMATE + 1
    while y < BASE:                                                               # piedras de tamaños disparejos
        azar = (azar * 37 + 11) % 101
        alto = 4 + azar % 3
        x = X0 - (azar % 4)
        while x <= X1:
            azar = (azar * 37 + 11) % 101
            w = 4 + azar % 5
            c = tonos[azar % len(tonos)]
            x0, x1, y1 = max(x, X0), min(x + w - 1, X1), min(y + alto - 1, BASE)
            if x1 - x0 >= 1:
                L.rect(x0, y, x1 - x0 + 1, y1 - y + 1, c)
                for cx, cy in ((x0, y), (x1, y), (x0, y1), (x1, y1)):              # esquinas redondeadas
                    if x0 > X0 and x1 < X1:
                        L.px(cx, cy, junta)
                L.px(x0 + 1, y, R["neutros"][4], solo=c)                           # luz arriba-izquierda
                L.rect(x0 + 1, y1, x1 - x0 - 1, 1, R["neutros"][0], solo=c)        # sombra abajo
            x += w + 1
        y += alto + 1
    v, v_s, flor, flor_s = R["verde"][2], R["verde"][1], R["rosa"][2], R["morado"][1]
    hojas = [(36, 6), (40, 6), (44, 6), (47, 7), (38, 9), (43, 9), (47, 11), (41, 12), (45, 14),
             (39, 15), (47, 17), (43, 18), (46, 22), (44, 26), (47, 28), (45, 32), (47, 37)]
    for n, (x, y) in enumerate(hojas):                                            # la bugambilia
        L.elipse(x - 2, y - 1, x + 1, y + 2, v_s if n % 3 == 0 else v)
    for n, (x, y) in enumerate(hojas):                                            # sus flores, en racimos
        L.rect(x - 1, y - 1 + n % 2, 2, 2, flor)
        L.px(x - 1, y - 1 + n % 2, R["rosa"][3])
        if n % 3 == 1:
            L.px(x + 1, y + 1, flor_s)
    for x, y in ((35, 6), (37, 8)):
        L.px(x, y, R["rosa"][3])
    return unir(Lienzo(W, H), L)


def variantes():
    return [
        ("v0 · baile", baile(), "Encalada con rótulo\nde baile sonidero"),
        ("v1 · escuela", escuela(), "Barda de escuela: el\nmural de los niños en\ntoda la barda, despintado"),
        ("v2 · piedra", piedra(), "Muro de piedra braza\ncon bugambilia"),
    ]


# Coreografía (choreo.js, caso 'highwall'): centro de Sofía en px de pantalla desde la orilla
# izquierda de la barda, altura de sus pies y cuadro.
SECUENCIA = [("se cuelga", -10, 109, "hang"), ("sube", 1, 177, "climb"),
             ("avanza agachada", 31, 196, "crouch"), ("salta", 66, 196, "crouch")]


def sofia(previas, nombre):
    for carpeta in (previas, previas.parent):
        ruta = carpeta / f"sofia-teen-{nombre}.png"
        if ruta.exists():
            return Image.open(ruta).convert("RGBA")
    return cuadro_de("sofia", {"hang": "hop", "climb": "hop", "crouch": "ready"}.get(nombre, nombre))


def secuencia(ruta, cuadro, previas):
    """Agrega a la hoja de contacto una tira con la maniobra paso a paso sobre la v0."""
    hoja = Image.open(ruta).convert("RGB")
    ancho_panel, corte = 240, (0, 70, 240, 495)
    tira = Image.new("RGB", (hoja.width, (corte[3] - corte[1]) + 52), "#211624")
    d = ImageDraw.Draw(tira)
    d.text((12, 6), "Paso a paso (Sofía adolescente, posiciones de la coreografía):", fill="#f4ecd8", font=fuente(13))
    for k, (rotulo, cx, alto, nombre) in enumerate(SECUENCIA[:3]):
        escena = fondo(previas)
        x0 = 60
        poner(escena, cuadro, x0, PIES_Y + PROP_Y)
        poner(escena, sofia(previas, nombre), x0 + cx, PIES_Y - alto, centro=True)
        tira.paste(escena.crop(corte).convert("RGB"), (12 + k * ancho_panel, 46))
        d.text((16 + k * ancho_panel, 26), rotulo, fill="#ffd23f", font=fuente(13))
    nueva = Image.new("RGB", (hoja.width, hoja.height + tira.height), "#211624")
    nueva.paste(hoja, (0, 0)); nueva.paste(tira, (0, hoja.height))
    nueva.save(ruta)


def main():
    previas = Path(sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else Path("previas")
    previas.mkdir(parents=True, exist_ok=True)
    vs = variantes()
    for nombre, cuadro, _ in vs:
        assert cuadro.size == (W, H), nombre
        assert all(cuadro.getpixel((x, ARRIBA))[3] for x in range(1, W - 1)), f"{nombre}: la cara de arriba no es corrida"
        assert all(cuadro.getpixel((x, 0)) [:3] == (0x2b, 0x1d, 0x2e) for x in range(1, W - 1)), f"{nombre}: hay algo encima"
    ruta = previas / "barda-alta-contacto.png"
    hoja_de_contacto("Barda alta", vs, ruta, previas, prop_y=PROP_Y, vuelo=None, esc=5)
    secuencia(ruta, vs[0][1], previas)
    if "--exportar" in sys.argv:
        exportar(vs, "highwall")
    print("previas en", previas, "·", len(vs), "variantes")


if __name__ == "__main__":
    main()
