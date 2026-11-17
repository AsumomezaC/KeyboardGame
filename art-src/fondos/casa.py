# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Interior de la casa de Sofía (`casa`, 320×144): humilde, algo descuidada. En el juego sale solo
apagada (la versión viva se dibuja para calcular la apagada con `apagar()`).

Sala-comedor: pared de dos colores (crema arriba, verde agua abajo, la pintura descarapelada y una
mancha de humedad), foco pelón colgando, ventana con cortina, el sillón viejo con una cobija, el
cuadro de la familia torcido (falta la mamá: siempre trabaja), el reloj, el calendario de regalo de
la tortillería, la mesa con mantel de hule y las botellas, dos sillas de plástico, la tele vieja
sobre su mueble, el refri con los dibujos pegados y el dinosaurio de juguete tirado. Piso de
mosaico. La pared ocupa las filas 0-111 y el piso empieza en la 112, como antes.

Sin contorno de tinta: cada cosa se separa con el tono oscuro de su propio color.

Uso:
  python art-src/fondos/casa.py <carpeta_de_previas>             láminas viva y apagada
  python art-src/fondos/casa.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from comun import R, CUARTO, PISO_CUARTO, apagada, comprobar, cuadro_de, exportar_cuarto, lamina_cuarto  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from pincel import Lienzo  # noqa: E402

N, T, P = R["neutros"], R["tierra"], R["piel"]
V, Mo, Tu, Am, Ro, Rs, Az, Na = (R[k] for k in ("verde", "morado", "turquesa", "amarillo", "rojo", "rosa", "azul", "naranja"))
W, H = CUARTO
F = PISO_CUARTO
# Escala: en el diálogo los pies quedan en la fila ~117 y un adulto mide 46 px (unos 1.7 m), así que
# 1 m ≈ 27 px. Los muebles y lo colgado en la pared se miden con eso.
M = 27
GUARDA = F - round(1.2 * M)      # fila donde cambia el color de la pared (a 1.2 m)


def pared(L):
    L.rect(0, 0, W, F, N[4])                                                 # crema arriba
    L.rect(0, 0, W, 3, N[3])                                                 # sombra del techo
    L.rect(0, GUARDA, W, F - GUARDA, Tu[3])                                  # verde agua abajo
    L.rect(0, GUARDA, W, 1, Tu[2])
    L.rect(0, F - 4, W, 4, T[1]); L.rect(0, F - 4, W, 1, T[2])               # zoclo
    for x, y in ((122, 86), (238, 94), (300, 84)):                           # pintura descarapelada, en cachos irregulares
        for dx, dy, w, h in ((0, 1, 7, 3), (2, 0, 4, 1), (5, 3, 6, 2), (1, 4, 3, 1), (9, 2, 2, 1)):
            L.rect(x + dx, y + dy, w, h, N[3], solo=Tu[3])
    for k in range(34):                                                      # cuarteadura que baja del techo
        x = 236 + k // 3 + (1 if k % 7 in (2, 3) else 0)
        L.px(x, 3 + k, N[2])
        if k in (12, 13, 14):
            L.px(x - (k - 11), 3 + k, N[2])
    for x, y, rx, ry in ((298, 5, 20, 9), (310, 15, 9, 9), (286, 11, 8, 5)):  # mancha de humedad en la esquina
        L.elipse(x - rx, y - ry, x + rx, y + ry, N[3], solo=(N[4], N[3]))


def foco(L, x):
    L.rect(x, 0, 1, 34, N[1])
    L.rect(x - 1, 34, 3, 2, N[2])
    L.elipse(x - 2, 36, x + 2, 41, Am[2]); L.px(x - 1, 37, N[5])


def ventana(L, x, y, w=40, h=30):
    L.rect(x, y, w, h, T[1])
    L.rect(x + 2, y + 2, w - 4, h - 4, Az[3]); L.rect(x + 2, y + h - 10, w - 4, 8, Az[2])   # cielo y la barda de enfrente
    L.rect(x + w // 2 - 1, y + 2, 2, h - 4, T[1])
    for i in range(x + 4, x + w - 2, 4):
        L.rect(i, y + 2, 1, h - 4, N[1])                                     # protección de herrería
    L.rect(x - 6, y - 4, w + 12, 2, N[1])                                    # tubo de la cortina
    for cx, lado in ((x - 5, 1), (x + w - 5, -1)):                           # cortina de flores, recogida
        L.rect(cx, y - 2, 10, h + 6, Rs[3])
        for j in range(y + 1, y + h + 4, 6):
            L.px(cx + 3, j, Rs[2]); L.px(cx + 6, j + 3, Am[1])
        L.rect(cx + (8 if lado > 0 else 0), y - 2, 2, h + 6, Rs[2])
    L.rect(x - 2, y + h, w + 4, 2, N[3])                                     # repisa


def sillon(L, x):
    """Sillón viejo con una cobija de rayas encima para tapar lo roto."""
    alto, asiento = round(0.85 * M), round(0.45 * M)
    L.rect(x, F - alto, 54, alto - asiento + 4, Mo[1]); L.rect(x, F - alto, 54, 2, Mo[2])   # respaldo
    L.rect(x - 4, F - asiento - 4, 8, asiento + 4, Mo[1]); L.rect(x + 50, F - asiento - 4, 8, asiento + 4, Mo[0])
    L.rect(x + 3, F - asiento, 48, 5, Mo[2]); L.rect(x + 3, F - asiento + 5, 48, asiento - 5, Mo[0])
    for k, c in enumerate((Ro[2], Am[1], Tu[2], Am[1], Ro[2])):              # cobija
        L.rect(x + 26 + k * 3, F - alto + 1, 3, alto - asiento + 2, c)
    L.rect(x + 8, F - alto + 4, 3, 2, N[4])                                  # relleno salido


def cuadro(L, x, y):
    """Foto de la familia torcida: el papá, Sofía y Tomasito; la mamá no está."""
    for k in range(20):                                                      # marco, ladeado
        L.rect(x + k, y + k // 8, 1, 15, T[1])
    for k in range(2, 18):
        L.rect(x + k, y + 2 + k // 8, 1, 11, N[5])
    L.rect(x + 4, y + 4, 3, 3, P[3]); L.rect(x + 4, y + 7, 3, 5, N[4])        # papá
    L.rect(x + 9, y + 7, 3, 2, P[3]); L.rect(x + 9, y + 9, 3, 4, Ro[2])      # Sofía
    L.rect(x + 14, y + 9, 2, 2, P[4]); L.rect(x + 14, y + 11, 2, 3, V[2])    # Tomasito
    L.rect(x + 9, y - 4, 1, 4, N[1])                                         # el clavo y el hilo


def reloj(L, x, y):
    L.elipse(x - 5, y - 5, x + 5, y + 5, T[2]); L.elipse(x - 4, y - 4, x + 4, y + 4, N[5])
    L.rect(x, y - 3, 1, 3, N[0]); L.rect(x, y, 3, 1, N[0])


def calendario(L, x, y):
    """Calendario de regalo de la tortillería: estampa arriba y los meses abajo."""
    L.rect(x, y, 14, 20, N[5])
    L.rect(x + 1, y + 1, 12, 9, Az[2]); L.elipse(x + 3, y + 2, x + 10, y + 9, Am[1])   # un sol sobre los cerros
    L.rect(x + 1, y + 7, 12, 3, V[1])
    L.rect(x + 1, y + 11, 12, 1, Ro[1])
    for j in range(y + 13, y + 19, 2):
        L.rect(x + 2, j, 10, 1, N[3])


def mesa(L, x0, x1):
    """Mesa con mantel de hule de cuadros y las botellas de Ramiro."""
    y = F - round(0.75 * M)
    L.rect(x0, y, x1 - x0, 5, N[5])
    for i in range(x0, x1, 4):
        L.rect(i, y, 2, 2, Ro[2]); L.rect(i + 2, y + 2, 2, 2, Ro[2])
    L.rect(x0, y + 4, x1 - x0, 1, Ro[1])
    for i in (x0 + 3, x1 - 5):
        L.rect(i, y + 5, 2, F - y - 5, N[1])
    for bx, c in ((x0 + 16, V[0]), (x0 + 20, T[1]), (x0 + 38, T[1])):        # caguamas
        L.rect(bx, y - 7, 3, 7, c); L.px(bx + 1, y - 9, c); L.px(bx + 1, y - 8, c); L.rect(bx, y - 5, 3, 2, Am[2])
    L.rect(x0 + 25, y - 2, 8, 2, N[5])                                       # plato
    L.rect(x0 + 6, y - 2, 5, 2, T[3])                                        # bolsa de pan


def silla(L, x, mirando=1):
    """Silla de plástico blanca, de lado."""
    c, s = N[5], N[3]
    alto, asiento = round(0.85 * M), round(0.45 * M)
    sx = x if mirando > 0 else x + 8
    L.rect(sx, F - alto, 2, alto - asiento, c)                               # respaldo
    L.rect(x, F - asiento, 10, 2, c); L.rect(x, F - asiento + 2, 10, 1, s)   # asiento
    L.rect(x + 1, F - asiento + 2, 2, asiento - 2, c); L.rect(x + 7, F - asiento + 2, 2, asiento - 2, s)


def tele(L, x):
    m = round(0.6 * M)
    L.rect(x, F - m, 26, m, T[1]); L.rect(x, F - m, 26, 2, T[2])             # mueble
    L.rect(x + 2, F - m + 4, 10, m - 6, T[0]); L.rect(x + 14, F - m + 4, 10, m - 6, T[0])
    y = F - m - 14
    L.rect(x + 3, y, 20, 14, N[1]); L.rect(x + 20, y, 3, 14, N[0])           # tele de bulbo
    L.rect(x + 5, y + 2, 13, 10, Az[0]); L.rect(x + 6, y + 3, 4, 2, Az[1])
    L.px(x + 21, y + 3, Am[1])
    L.linea((x + 9, y), (x + 5, y - 8), N[1]); L.linea((x + 16, y), (x + 21, y - 8), N[1])   # antena de conejo


def refri(L, x):
    y = F - round(1.6 * M)
    L.rect(x, y, 24, F - y, N[5]); L.rect(x + 21, y, 3, F - y, N[3])
    L.rect(x, y + 14, 24, 1, N[3]); L.rect(x + 18, y + 4, 2, 8, N[2]); L.rect(x + 18, y + 18, 2, 12, N[2])
    L.rect(x + 3, y + 3, 7, 6, Am[2]); L.elipse(x + 5, y + 4, x + 8, y + 7, Am[1])   # dibujo de un sol
    L.rect(x + 4, y + 19, 8, 7, V[3]); L.rect(x + 6, y + 22, 4, 2, Mo[1])   # dibujo de un dino
    L.rect(x + 12, y + 30, 4, 3, Rs[3])                                     # imán
    L.rect(x + 1, F - 2, 22, 2, N[2])


def dinosaurio(L, x):
    """El dinosaurio de juguete de Tomasito, tirado en el piso."""
    y = F + 6
    L.rect(x, y - 4, 7, 3, Mo[1]); L.rect(x + 5, y - 6, 3, 3, Mo[1]); L.px(x + 7, y - 5, Mo[0])
    L.px(x - 1, y - 3, Mo[1]); L.px(x - 2, y - 2, Mo[1])
    L.px(x + 1, y - 1, Mo[0]); L.px(x + 4, y - 1, Mo[0])


def piso(L):
    """Mosaico de pasta en dos tonos, a cuadros grandes."""
    for y in range(F, H, 8):
        for x in range(0, W, 8):
            L.rect(x, y, 8, 8, T[3] if ((x + y) // 8) % 2 else T[4])
    L.rect(0, F, W, 1, T[2])


def cuarto():
    L = Lienzo(W, H)
    pared(L)
    ventana(L, 22, 54)
    cuadro(L, 104, 54)
    reloj(L, 166, 50)
    calendario(L, 214, 54)
    foco(L, 160)
    sillon(L, 16)
    tele(L, 92)
    silla(L, 146); silla(L, 214, mirando=-1)
    mesa(L, 158, 212)
    refri(L, 280)
    piso(L)
    dinosaurio(L, 128)
    return L.imagen()


def gente():
    """La primera escena en la casa (`c1-1`): Sofía, Ramiro y Leticia enojada."""
    return [
        (cuadro_de("sofia", "idle0"), 250, 3.6, False),
        (cuadro_de("ramiro", "idle0"), 600, 3, True),
        (cuadro_de("leticia", "angry"), 760, 3, True),
    ]


if __name__ == "__main__":
    previas = Path(sys.argv[1])
    previas.mkdir(parents=True, exist_ok=True)
    viva = cuarto()
    comprobar("casa", viva, CUARTO)
    notas = ("En el juego la casa sale SOLO apagada; la viva se dibuja para calcular la apagada.",
             "Personajes como en el diálogo de antes de c1-1 (Sofía a ×3.6 por sus 8 años).")
    lamina_cuarto("Casa de Sofía · versión APAGADA (la que sale en el juego)", apagada(viva),
                  previas / "casa-apagada.png", gente(), notas)
    lamina_cuarto("Casa de Sofía · versión viva (solo de referencia)", viva, previas / "casa-viva.png", gente(), notas)
    print("láminas:", previas / "casa-apagada.png", "y", previas / "casa-viva.png")
    if "--exportar" in sys.argv:
        exportar_cuarto("casa", apagada(viva))
