# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato de Ramiro, el papá, para los diálogos (48×48): 8 gestos, con parpadeo («_b») y boca al
hablar («_m»). Pelo corto y revuelto con entradas, bigote, barba de días, ojeras, nariz y cachetes
rojos y camiseta de tirantes crema. Rostro de adulto: mandíbula ancha y pesada (no ovalada).

Uso:
  python art-src/retratos/ramiro.py <carpeta_de_previas>             hoja de contacto y GIF
  python art-src/retratos/ramiro.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import retrato  # noqa: E402
from retrato import R, mover  # noqa: E402

PIEL, PIEL_S, PIEL_SS = R["piel"][3], R["piel"][2], R["piel"][1]
PELO, PELO_L = R["tinta"][1], R["neutros"][0]
BARBA = R["tierra"][2]
ROJO = R["rojo"][3]
CAMISETA, CAMISETA_S, CAMISETA_L = R["neutros"][4], R["neutros"][3], R["neutros"][5]

# Rostro de adulto: más largo que el de los adolescentes, con la mandíbula ancha y cuadrada.
CARA = [(16, 13), (39, 13), (42, 17), (43, 29), (42, 35), (38, 39), (32, 40), (24, 40), (18, 37), (15, 32), (14, 20)]
NARIZ = [(32, 27), (33, 28), (33, 29), (33, 30), (32, 31), (31, 31), (30, 31)]
MELENA = [(10, 25), (10, 13), (13, 7), (19, 3), (33, 3), (40, 5), (44, 10), (44, 18)]
NACIMIENTO = [(13, 13), (44, 13), (44, 17), (42, 15), (38, 14), (22, 14), (18, 15), (17, 19), (15, 22), (13, 22)]


def melena(L, dy):
    L.poligono(mover(MELENA, dy), PELO)
    L.rect(10, 24 + dy, 4, 4, PELO)                                                   # nuca, detrás de la oreja
    # mechones parados: despeinado
    L.puntos(mover([(15, 4), (16, 3), (22, 2), (23, 1), (23, 2), (29, 2), (36, 3), (37, 3), (42, 6), (9, 15), (9, 19)], dy), PELO)


def nacimiento(L, dy):
    L.poligono(mover(NACIMIENTO, dy), PELO)
    L.poligono(mover([(25, 14), (32, 14), (30, 17), (27, 16)], dy), PELO)             # mechón que cae a la frente


def detalles(L, dy):
    # oreja a la vista
    L.rect(11, 23 + dy, 4, 6, PIEL); L.px(11, 23 + dy, PELO); L.px(11, 28 + dy, None)
    L.rect(12, 25 + dy, 2, 2, PIEL_S); L.px(14, 27 + dy, PIEL_S)
    # entradas: la frente sube en las sienes
    L.poligono(mover([(34, 15), (41, 15), (40, 12), (37, 10), (35, 11)], dy), PIEL)
    L.poligono(mover([(19, 15), (23, 15), (22, 12), (20, 12)], dy), PIEL)
    L.puntos(mover([(37, 10), (36, 11), (35, 11), (35, 12), (34, 13), (40, 12), (41, 13), (41, 14), (20, 12), (21, 12), (20, 13)], dy), PIEL_S)
    # brillos del pelo, del lado de la luz
    L.linea((15, 9 + dy), (19, 6 + dy), PELO_L, solo=PELO); L.linea((22, 6 + dy), (26, 5 + dy), PELO_L, solo=PELO)
    L.linea((13, 13 + dy), (13, 17 + dy), PELO_L, solo=PELO)
    # sombra bajo la mandíbula (la cara es más larga que la común)
    for x in range(24, 39):
        for y in (39, 40):
            L.px(x, y + dy, PIEL_S, PIEL)
    # barba de días: puntos salteados en la mandíbula y las mejillas, sin tapar la boca
    for y in range(30, 41):
        for x in range(15, 43):
            fuera_de_la_boca = y >= 37 or x <= 22 or x >= 37
            if fuera_de_la_boca and (x + 2 * y) % 4 == 0:
                L.px(x, y + dy, BARBA, (PIEL, PIEL_S))


def tirantes(L, dy):
    """Camiseta de tirantes: los hombros y el escote son piel; quedan dos tirantes."""
    for y in range(40, 48):
        for x in range(6, 46):
            hombro = x <= 14 or x >= 37
            escote = 20 <= x <= 31 and y <= 45
            if hombro or escote:
                L.px(x, y, PIEL_S if (x >= 37 or y <= 42) else PIEL, (CAMISETA, CAMISETA_S, CAMISETA_L))
    L.linea((20, 42), (20, 45), CAMISETA_S, solo=PIEL); L.linea((31, 42), (31, 45), CAMISETA_S, solo=(PIEL, PIEL_S))
    L.rect(20, 46, 12, 1, CAMISETA_S)                                                 # orilla del escote


def bigote_y_ojeras(L, dy, g, parpadeo):
    # ojeras
    L.rect(20, 30 + dy, 5, 1, PIEL_S, solo=PIEL); L.rect(34, 30 + dy, 4, 1, PIEL_S, solo=PIEL)
    # nariz roja
    L.puntos(mover([(31, 29), (32, 29), (31, 30), (32, 30)], dy), ROJO)
    # bigote: tapa el labio de arriba; con la risa las puntas suben, si no cuelgan
    L.rect(26, 32 + dy, 9, 1, PELO); L.rect(25, 33 + dy, 11, 1, PELO)
    if g["boca"] in ("sonrisota", "risa", "risota", "sonrisa"):
        L.puntos(mover([(24, 32), (36, 32), (23, 31), (37, 31)], dy), PELO)
    else:
        L.puntos(mover([(24, 34), (25, 34), (35, 34), (36, 34), (24, 35), (36, 35)], dy), PELO)
    L.px(30, 32 + dy, PELO_L); L.px(31, 33 + dy, PELO_L)


retrato.vestir(
    PIEL=PIEL, PIEL_S=PIEL_S, PIEL_SS=PIEL_SS,
    PELO=PELO, IRIS=R["tierra"][1], RUBOR=ROJO,
    CARA=CARA, NARIZ=NARIZ,
    PLAYERA=CAMISETA, PLAYERA_S=CAMISETA_S, PLAYERA_L=CAMISETA_L,
    PELO_DETRAS=melena, PELO_DELANTE=nacimiento, PELO_ENCIMA=detalles, COLGANTE=tirantes,
    REMATE=bigote_y_ojeras,
)

# Ramiro arrastra la voz: en reposo y al hablar lleva los párpados caídos y las cejas gruesas; al
# hablar levanta una ceja, teatral.
retrato.GESTOS["idle"] = dict(cejas="galan", ojos="galan", boca="linea", habla="chica", dy=1)
retrato.GESTOS["talk"] = dict(cejas="galan_ceja", ojos="galan", boca="sonrisa", habla="abierta", dy=0)

if __name__ == "__main__":
    retrato.main("ramiro", "Ramiro")
