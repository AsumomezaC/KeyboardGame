# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Retrato de Tomasito, el hermano de 4 años, para los diálogos (48×48): 8 gestos, con parpadeo
(«_b») y boca al hablar («_m»). Bien peinado de raya al lado, playera verde y su dinosaurio de
juguete asomando en la esquina, que reacciona con él. Cachetón y sonriente.

Uso:
  python art-src/retratos/tomasito.py <carpeta_de_previas>             hoja de contacto y GIF
  python art-src/retratos/tomasito.py <carpeta_de_previas> --exportar   además escribe la hoja del juego
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import retrato  # noqa: E402
from retrato import R, mover  # noqa: E402

PIEL, PIEL_S, PIEL_SS = R["piel"][4], R["piel"][3], R["piel"][2]
PELO, PELO_L = R["tierra"][1], R["tierra"][2]
DINO, DINO_L, DINO_S = R["morado"][1], R["morado"][2], R["morado"][0]
TINTA, BLANCO = R["tinta"][1], R["neutros"][5]
PENA, VENA, BRILLO, AGUA = R["azul"][1], R["rojo"][2], R["amarillo"][1], R["azul"][3]

# Casquete liso y redondo, sin picos; el fleco va peinado de lado y cae parejo hacia el lado lejano.
CASQUETE = [(10, 26), (10, 13), (13, 8), (19, 5), (33, 5), (40, 7), (44, 12), (44, 19)]
FLECO = [(13, 12), (44, 12), (44, 20), (41, 18), (35, 17), (27, 15), (21, 14), (17, 16), (15, 22), (13, 22)]


def casquete(L, dy):
    L.poligono(mover(CASQUETE, dy), PELO)
    L.rect(10, 24 + dy, 4, 4, PELO)                                                   # nuca, detrás de la oreja


def fleco(L, dy):
    L.poligono(mover(FLECO, dy), PELO)


def oreja_y_raya(L, dy):
    L.rect(11, 23 + dy, 4, 6, PIEL); L.px(11, 23 + dy, PELO); L.px(11, 28 + dy, None)
    L.rect(12, 25 + dy, 2, 2, PIEL_S); L.px(14, 27 + dy, PIEL_S)
    # la raya y el brillo del pelo relamido
    L.linea((18, 6 + dy), (21, 13 + dy), PELO_L, solo=PELO)
    L.poligono(mover([(24, 8), (33, 8), (38, 10), (30, 10), (25, 11)], dy), PELO_L, solo=PELO)
    L.linea((12, 12 + dy), (12, 17 + dy), PELO_L, solo=PELO)


def dinosaurio(L, dy):
    """El juguete asoma por la esquina de abajo a la izquierda (no se mueve con la cabeza ni tapa la
    cara): cuello largo y la cabeza hacia Tomasito."""
    L.elipse(0, 41, 10, 47, DINO)                                                     # cuerpo
    L.rect(6, 35, 4, 8, DINO)                                                         # cuello
    L.rect(5, 32, 8, 4, DINO); L.px(5, 32, None); L.px(12, 32, None)                  # cabeza
    L.px(10, 33, BLANCO); L.px(9, 33, TINTA)                                          # ojo
    L.rect(9, 35, 4, 1, DINO_S)                                                       # boca
    L.rect(2, 44, 6, 3, DINO_L, solo=DINO)                                            # panza
    L.rect(0, 43, 2, 4, DINO_S, solo=(DINO, DINO_L))                                  # lado en sombra


def reaccion_del_dinosaurio(L, g):
    """El juguete reacciona con Tomasito: lleva en chiquito el mismo adorno flotante del gesto y, si
    Tomasito llora, una lagrimita."""
    tipo = g.get("adorno")
    if tipo == "pena":
        L.linea((2, 24), (2, 28), PENA); L.linea((5, 23), (5, 27), PENA)
    elif tipo == "vena":
        for a, b in (((1, 24), (2, 25)), ((5, 24), (4, 25)), ((1, 28), (2, 27)), ((5, 28), (4, 27))):
            L.linea(a, b, VENA)
    elif tipo == "rayas":
        L.linea((3, 29), (1, 27), TINTA); L.linea((6, 28), (5, 25), TINTA)
    elif tipo == "brillos":
        L.puntos([(3, 25), (3, 27), (2, 26), (4, 26)], BRILLO); L.px(3, 26, BLANCO)
    elif tipo == "gotas":
        L.px(11, 34, AGUA); L.px(11, 35, AGUA)


retrato.vestir(
    PIEL=PIEL, PIEL_S=PIEL_S, PIEL_SS=PIEL_SS,
    PELO=PELO, IRIS=R["tierra"][1],
    PLAYERA=R["verde"][2], PLAYERA_S=R["verde"][1], PLAYERA_L=R["verde"][3],
    PELO_DETRAS=casquete, PELO_DELANTE=fleco, PELO_ENCIMA=oreja_y_raya, COLGANTE=dinosaurio, ADORNO_EXTRA=reaccion_del_dinosaurio,
)

# Tomasito es pura alegría: en reposo sonríe y al hablar levanta las cejas.
retrato.GESTOS["idle"] = dict(cejas="suaves", ojos="abiertos", boca="sonrisa", habla="chica", dy=0)
retrato.GESTOS["talk"] = dict(cejas="altas", ojos="abiertos", boca="sonrisa", habla="abierta", dy=0)

if __name__ == "__main__":
    retrato.main("tomasito", "Tomasito")
