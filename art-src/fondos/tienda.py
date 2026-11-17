# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Abarrotes La Esperanza por dentro (`tienda`, 320×144): la tienda de la Tata, acogedora. En el
juego sale solo viva.

De izquierda a derecha: el refri de los refrescos, el estante con latas, aceite, arroz y galletas,
el letrero de «HOY NO SE FÍA, MAÑANA SÍ», la tira de papitas colgada, los costales de frijol y maíz,
el mostrador de madera con la báscula, el frasco de dulces, el cuaderno del fiado, los huevos y la
canasta del pan; detrás, la repisa con más mercancía y arriba el rótulo pintado de la tienda. A la
derecha, la cortina de la puerta de la bodega. Papel picado de lado a lado. Piso de mosaico. La
pared ocupa las filas 0-111 y el piso empieza en la 112, como antes.

Sin contorno de tinta: cada cosa se separa con el tono oscuro de su propio color.

Uso:
  python art-src/fondos/tienda.py <carpeta_de_previas>             lámina
  python art-src/fondos/tienda.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, CUARTO, PISO_CUARTO, comprobar, cuadro_de, exportar_cuarto, lamina_cuarto  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

N, T, P = R["neutros"], R["tierra"], R["piel"]
V, Mo, Tu, Am, Ro, Rs, Az, Na = (R[k] for k in ("verde", "morado", "turquesa", "amarillo", "rojo", "rosa", "azul", "naranja"))
W, H = CUARTO
F = PISO_CUARTO
M = 27                           # 1 m ≈ 27 px, la misma escala que la casa
GUARDA = F - round(1.0 * M)      # fila donde empieza el guardapolvo verde (a 1 m)

LETRAS = {
    "A": ["010", "101", "111", "101", "101"], "B": ["110", "101", "110", "101", "110"],
    "D": ["110", "101", "101", "101", "110"], "E": ["111", "100", "110", "100", "111"],
    "F": ["111", "100", "110", "100", "100"], "H": ["101", "101", "111", "101", "101"],
    "I": ["111", "010", "010", "010", "111"], "L": ["100", "100", "100", "100", "111"],
    "M": ["10001", "11011", "10101", "10001", "10001"], "N": ["1001", "1101", "1011", "1001", "1001"],
    "O": ["111", "101", "101", "101", "111"], "P": ["110", "101", "110", "100", "100"],
    "R": ["110", "101", "110", "101", "101"], "S": ["011", "100", "010", "001", "110"],
    "T": ["111", "010", "010", "010", "010"], "Y": ["101", "101", "010", "010", "010"],
    "Z": ["111", "001", "010", "100", "111"], " ": ["000"] * 5,
    "1": ["010", "110", "010", "010", "111"], "7": ["111", "001", "010", "010", "010"],
    "8": ["111", "101", "111", "101", "111"], "9": ["111", "101", "111", "001", "111"],
}
ACENTOS = {"Í": ("I", [(2, -2)]), "Ñ": ("N", [(0, -1), (1, -2), (2, -1), (3, -2)])}


def texto(L, x, y, s, color):
    for ch in s:
        base, marcas = ACENTOS.get(ch, (ch, []))
        for dy, fila in enumerate(LETRAS[base]):
            for dx, v in enumerate(fila):
                if v == "1":
                    L.px(x + dx, y + dy, color)
        for dx, dy in marcas:
            L.px(x + dx, y + dy, color)
        x += len(LETRAS[base][0]) + 1


def ancho(s):
    return sum(len(LETRAS[ACENTOS.get(ch, (ch,))[0]][0]) + 1 for ch in s) - 1


# ───────────────────────── pared ─────────────────────────

def pared(L):
    L.rect(0, 0, W, F, Am[2])                                                # amarillo pálido arriba
    L.rect(0, 0, W, 3, Am[1])                                                # sombra del techo
    L.rect(0, GUARDA, W, F - GUARDA, V[2])                                   # guardapolvo verde
    L.rect(0, GUARDA, W, 1, V[1])
    L.rect(0, F - 4, W, 4, V[1]); L.rect(0, F - 4, W, 1, V[0])               # zoclo


def papel_picado(L):
    """Una tira de banderitas de colores de lado a lado, con su hilo un poco colgado."""
    colores = (Rs[2], Am[1], Tu[2], Na[1], Mo[1], V[2])
    for x in range(W):
        y = 6 + round(3 * (1 - ((x % 160) - 80) ** 2 / 6400))               # dos curvitas
        L.px(x, y, N[1])
    for k, x in enumerate(range(3, W - 8, 13)):
        y = 6 + round(3 * (1 - (((x + 4) % 160) - 80) ** 2 / 6400)) + 1
        c = colores[k % len(colores)]
        L.rect(x, y, 9, 7, c)
        for i in range(x, x + 9, 2):                                         # orilla picada
            L.px(i, y + 7, c)
        L.puntos(((x + 4, y + 2), (x + 3, y + 3), (x + 5, y + 3), (x + 4, y + 4), (x + 1, y + 5), (x + 7, y + 5)), Am[2])   # calado: florecita


def rotulo(L, cx, y):
    """Rótulo pintado a mano sobre la pared: la tienda y el año en que se fundó."""
    w = 64
    x = cx - w // 2
    L.rect(x, y, w, 25, Ro[1]); L.rect(x, y + 24, w, 1, Ro[0])
    L.rect(x + 2, y + 2, w - 4, 1, Am[1]); L.rect(x + 2, y + 21, w - 4, 1, Am[1])
    texto(L, cx - ancho("ABARROTES") // 2, y + 5, "ABARROTES", Am[2])
    texto(L, cx - ancho("LA ESPERANZA") // 2, y + 12, "LA ESPERANZA", Am[1])
    for sx in (x + 4, x + w - 7):                                            # florecitas a los lados
        L.rect(sx, y + 13, 3, 1, Rs[3]); L.rect(sx + 1, y + 12, 1, 3, Rs[3]); L.px(sx + 1, y + 13, Am[1])
    texto(L, cx - ancho("DESDE 1987") // 2, y + 27, "DESDE 1987", Ro[1])


def cartel(L, x, y):
    """Cartulina pegada con cinta: «HOY NO SE FÍA, MAÑANA SÍ»."""
    L.rect(x, y, 56, 19, N[5]); L.rect(x, y + 18, 56, 1, N[3])
    L.rect(x + 1, y - 1, 5, 2, Am[2]); L.rect(x + 50, y - 1, 5, 2, Am[2])   # cinta
    for fila, (dicho, c) in enumerate((("HOY NO SE FÍA", Ro[1]), ("MAÑANA SÍ", Az[1]))):
        texto(L, x + 28 - ancho(dicho) // 2, y + 4 + fila * 8, dicho, c)


# ───────────────────────── mercancía ─────────────────────────

def lata(L, x, y, c):
    L.rect(x, y - 5, 4, 5, c[1]); L.rect(x, y - 5, 4, 1, N[3]); L.rect(x + 3, y - 4, 1, 4, c[0])


def botella(L, x, y, c):
    L.rect(x, y - 7, 3, 7, c[1]); L.px(x + 1, y - 9, c[1]); L.px(x + 1, y - 8, c[1]); L.rect(x + 2, y - 7, 1, 7, c[0])
    L.rect(x, y - 4, 3, 2, N[5])


def bolsa(L, x, y, c):
    L.rect(x, y - 7, 5, 7, N[5]); L.rect(x, y - 7, 5, 1, N[3]); L.rect(x, y - 4, 5, 2, c[1])


def caja(L, x, y, c):
    L.rect(x, y - 6, 6, 6, c[1]); L.rect(x, y - 6, 6, 1, c[2]); L.rect(x + 5, y - 5, 1, 5, c[0])
    L.rect(x + 1, y - 3, 3, 1, N[5])


def rollos(L, x, y):
    for i in (0, 3):
        L.rect(x + i, y - 3, 3, 3, N[5]); L.rect(x + 1 + i, y - 2, 1, 1, N[3])
    L.rect(x + 1, y - 6, 3, 3, N[5]); L.px(x + 2, y - 5, N[3])


RAMPAS_MERCANCIA = [(Ro[0], Ro[1], Ro[2]), (Am[0], Am[1], Am[2]), (Az[0], Az[1], Az[2]), (Na[0], Na[1], Na[2]),
                    (Tu[0], Tu[1], Tu[2]), (V[0], V[1], V[2]), (Mo[0], Mo[1], Mo[2]), (Rs[1], Rs[2], Rs[3])]
COSAS = {"lata": (lata, 5), "botella": (botella, 4), "bolsa": (bolsa, 6), "caja": (caja, 7), "rollos": (rollos, 7)}


def fila(L, x0, x1, y, orden, desde=0):
    """Mercancía parada sobre una tabla (y = fila de la tabla), en el orden dado y repetido."""
    x, k = x0, 0
    while True:
        cosa = orden[k % len(orden)]
        f, w = COSAS[cosa]
        if x + w > x1:
            break
        c = RAMPAS_MERCANCIA[(k * 3 + desde) % len(RAMPAS_MERCANCIA)]
        if cosa == "rollos":
            f(L, x, y)
        else:
            f(L, x, y, c)
        x += w + (1 if cosa in ("lata", "botella") else 0)
        k += 1


def estante(L, x, w, alto, tablas, ordenes):
    """Estante de madera pegado a la pared."""
    y0 = F - alto
    L.rect(x, y0, w, alto, T[1])                                             # fondo
    for y, orden, desde in zip(tablas, ordenes, range(0, 50, 5)):
        fila(L, x + 3, x + w - 2, y, orden, desde)
        L.rect(x, y, w, 2, T[3]); L.rect(x, y + 2, w, 1, T[2])
    L.rect(x, y0, 2, alto, T[2]); L.rect(x + w - 2, y0, 2, alto, T[0])
    L.rect(x, y0, w, 2, T[3])


def refri_refrescos(L, x):
    """Refri vertical de puerta de vidrio con los refrescos (sin marca)."""
    alto = round(1.8 * M)
    y = F - alto
    L.rect(x, y, 28, alto, Ro[1]); L.rect(x + 25, y, 3, alto, Ro[0])
    L.rect(x, y, 28, 6, Ro[2]); L.rect(x + 3, y + 2, 19, 2, Am[2])           # copete
    L.rect(x + 3, y + 8, 20, alto - 14, Az[3])                               # vidrio
    for j, sy in enumerate(range(y + 18, F - 6, 10)):
        L.rect(x + 3, sy, 20, 1, N[3])
        for k, bx in enumerate(range(x + 4, x + 22, 4)):
            c = RAMPAS_MERCANCIA[(j * 2 + k) % 6]
            L.rect(bx, sy - 7, 3, 7, c[1]); L.px(bx + 1, sy - 8, c[1]); L.rect(bx + 2, sy - 7, 1, 7, c[0])
    L.rect(x + 4, y + 9, 1, alto - 17, N[5])                                 # brillo del vidrio
    L.rect(x + 21, y + 22, 1, 12, N[2])                                      # jaladera
    L.rect(x + 1, F - 3, 26, 3, Ro[0])


def papitas(L, x, y, largo):
    """Tira de bolsitas de papas colgada de un clavo."""
    L.px(x + 2, y - 2, N[1]); L.rect(x + 2, y - 1, 1, largo, N[2])
    for k, j in enumerate(range(y, y + largo - 6, 7)):
        c = (Am, Ro, Na, Az)[k % 4]
        L.rect(x, j + 1, 5, 6, c[1]); L.rect(x, j + 1, 5, 1, c[2]); L.rect(x + 1, j + 3, 3, 2, Am[2] if c is not Am else Ro[2])


def costal(L, x, w, alto, grano, punto):
    y = F - alto
    L.rect(x, y + 2, w, alto - 2, T[4]); L.rect(x + w - 2, y + 2, 2, alto - 2, T[3])
    L.rect(x - 1, y, w + 2, 3, T[3]); L.rect(x - 1, y + 2, w + 2, 1, T[2])   # boca doblada
    L.elipse(x + 1, y - 3, x + w - 2, y + 1, grano)
    for i in range(x + 2, x + w - 2, 2):
        L.px(i, y - 1 + (i % 3 == 0), punto)
    L.rect(x + 3, y + 7, w - 6, 1, T[3])


def mostrador(L, x0, x1):
    """Mostrador de madera; encima, lo de todos los días."""
    y = F - round(0.95 * M)
    L.rect(x0, y + 3, x1 - x0, F - y - 3, T[2])
    for i in range(x0 + 10, x1 - 4, 14):                                     # tablas del frente
        L.rect(i, y + 6, 1, F - y - 9, T[1])
    L.rect(x0 + 2, y + 6, x1 - x0 - 4, 1, T[3])
    L.rect(x0, F - 3, x1 - x0, 3, T[1])
    L.rect(x0 - 2, y, x1 - x0 + 4, 3, T[3]); L.rect(x0 - 2, y + 3, x1 - x0 + 4, 1, T[1])   # cubierta
    # báscula de reloj
    bx = x0 + 6
    L.rect(bx, y - 5, 12, 5, Ro[1]); L.rect(bx + 10, y - 5, 2, 5, Ro[0])
    L.elipse(bx + 2, y - 13, bx + 9, y - 6, N[5]); L.rect(bx + 5, y - 11, 1, 3, Ro[1])
    L.rect(bx - 1, y - 15, 14, 2, N[3]); L.rect(bx + 5, y - 14, 2, 2, N[2])
    # frasco de dulces
    fx = x0 + 26
    L.rect(fx, y - 10, 9, 10, Az[3]); L.rect(fx - 1, y - 12, 11, 2, Ro[1])
    for i, (dx, dy) in enumerate(((1, -3), (4, -2), (6, -4), (2, -6), (5, -7), (3, -9) if False else (7, -7))):
        L.rect(fx + dx, y + dy, 2, 2, (Rs[2], Am[1], V[2], Na[1], Mo[2])[i % 5])
    L.rect(fx + 1, y - 9, 1, 7, N[5])
    # cuaderno del fiado, abierto, con el lápiz
    cx = x0 + 52
    L.rect(cx, y - 2, 18, 2, N[5]); L.rect(cx + 8, y - 2, 1, 2, N[3])
    for i in range(cx + 1, cx + 17, 2):
        L.px(i, y - 2, Az[2])
    L.linea((cx + 12, y - 3), (cx + 17, y - 4), Am[1])
    # huevos en sus conos, con el periódico para envolver
    hx = x0 + 78
    L.rect(hx, y - 2, 16, 2, N[3])
    for i in range(hx + 1, hx + 15, 3):
        L.rect(i, y - 4, 2, 2, N[4])
    L.rect(hx + 1, y - 5, 2, 1, N[4]); L.rect(hx + 7, y - 5, 2, 1, N[4])
    L.rect(hx + 18, y - 1, 9, 1, N[3]); L.rect(hx + 19, y - 2, 9, 1, N[4])
    # canasta del pan, con conchas
    px = x1 - 22
    L.rect(px, y - 5, 18, 5, T[3]); L.rect(px, y - 5, 18, 1, T[4]); L.rect(px + 16, y - 4, 2, 4, T[2])
    for i, c in enumerate((Rs[3], T[4], Am[2], Rs[3])):
        L.elipse(px + 1 + i * 4, y - 8, px + 4 + i * 4, y - 5, c)
    L.px(px + 2, y - 7, N[5]); L.px(px + 10, y - 7, N[5])


def repisa(L, x0, x1):
    """Repisa detrás del mostrador (solo se ve por arriba del mostrador)."""
    alto = round(2.1 * M)
    estante(L, x0, x1 - x0, alto, (F - alto + 12, F - alto + 24, F - alto + 36),
            (("caja", "caja", "bolsa"), ("lata", "lata", "lata", "botella"), ("botella", "bolsa", "rollos")))


def bodega(L, x):
    """Puerta de la bodega con su cortina de tela floreada, un poco abierta."""
    alto = round(2.0 * M)
    y = F - alto
    L.rect(x - 2, y - 2, 34, alto + 2, T[2])                                 # marco
    L.rect(x, y, 30, alto, N[0])                                             # adentro, a oscuras
    L.rect(x + 13, F - 14, 6, 10, T[2]); L.rect(x + 13, F - 14, 6, 1, T[3])   # cajas de chiles en lata
    L.rect(x + 14, F - 10, 4, 2, V[1])
    L.rect(x - 3, y - 3, 36, 2, N[1])                                        # tubo
    for cx, w in ((x, 13), (x + 19, 11)):
        L.rect(cx, y - 1, w, alto - 3, Rs[3])
        for j in range(y + 2, F - 4, 6):
            for i in range(cx + 2, cx + w - 1, 5):
                L.px(i, j + (i // 5) % 2 * 3, Rs[2]); L.px(i + 1, j + 1 + (i // 5) % 2 * 3, Am[1])
        L.rect(cx + w - 1 if cx == x else cx, y - 1, 1, alto - 3, Rs[2])     # pliegue junto a la abertura


def piso(L):
    """Mosaico de pasta a cuadros, más claro que el de la casa."""
    for y in range(F, H, 8):
        for x in range(0, W, 8):
            L.rect(x, y, 8, 8, N[4] if ((x + y) // 8) % 2 else T[4])
    L.rect(0, F, W, 1, T[2])


def cuarto():
    L = Lienzo(W, H)
    pared(L)
    papel_picado(L)
    rotulo(L, 205, 22)
    cartel(L, 46, 38)
    repisa(L, 150, 262)
    refri_refrescos(L, 8)
    estante(L, 42, 56, round(1.7 * M), (F - 32, F - 20, F - 8),
            (("bolsa", "bolsa", "caja"), ("botella", "botella", "lata", "lata"), ("rollos", "caja", "bolsa")))
    papitas(L, 106, 50, 30)
    mostrador(L, 142, 264)
    costal(L, 112, 12, 15, T[1], T[0])                                       # frijol
    costal(L, 126, 11, 13, Am[1], Am[0])                                     # maíz
    bodega(L, 280)
    piso(L)
    return L.imagen()


def gente_c1_8():
    """El fiado (`c1-8`, antes): Sofía avergonzada, Leticia y la Tata."""
    return [
        (cuadro_de("sofia", "sad"), 230, 3.7, False),
        (cuadro_de("leticia", "idle0"), 380, 3, False),
        (cuadro_de("tata", "idle0"), 700, 3, True),
    ]


def gente_c1_5():
    """El volante de la carrera (`c1-5`, antes): Sofía, Dani festejando y la Tata."""
    return [
        (cuadro_de("sofia", "idle0"), 260, 3.6, False),
        (cuadro_de("dani", "cheer0"), 420, 3.6, True),
        (cuadro_de("tata", "idle0"), 700, 3, True),
    ]


if __name__ == "__main__":
    previas = Path(sys.argv[1])
    previas.mkdir(parents=True, exist_ok=True)
    viva = cuarto()
    comprobar("tienda", viva, CUARTO)
    notas = ("En el juego la tienda sale SOLO viva.",)
    lamina_cuarto("Abarrotes La Esperanza · versión viva (la que sale en el juego)", viva, previas / "tienda-viva.png",
                  gente_c1_8(), notas + ("Personajes como en el diálogo de antes de c1-8 (el fiado; Sofía a ×3.7 por sus 9 años).",))
    lamina_cuarto("Abarrotes La Esperanza · otra escena", viva, previas / "tienda-c1-5.png",
                  gente_c1_5(), notas + ("Personajes como en el diálogo de antes de c1-5 (el volante de la carrera).",))
    print("láminas:", previas / "tienda-viva.png", "y", previas / "tienda-c1-5.png")
    if "--exportar" in sys.argv:
        exportar_cuarto("tienda", viva)
