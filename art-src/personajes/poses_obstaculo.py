# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Previas de las poses por obstáculo: una hoja de contacto con las poses de hoy y las nuevas, y un
GIF del obstáculo pasado como en el juego (hoy y con las poses nuevas), sobre el fondo del ambiente
donde sale.

Los cuadros se dibujan en vivo con nino.py (no se leen de la hoja exportada), así se ven antes de
integrarlos. La maniobra repite obstaclePose de src/scenes/RunScene.js: `pose_hoy()` es la de hoy y
`pose_nueva()` la que usa las poses nuevas.

Uso:
  python art-src/personajes/poses_obstaculo.py <carpeta_de_previas> <obstáculo> [<personaje>]
  (obstáculo: hole; personaje: sofia por omisión)
"""
import importlib
import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
sys.path.insert(0, str(AQUI.parent / "obstaculos"))
import nino  # noqa: E402
from comun import SPRITES, ESC, ANCHO, ALTO, SUELO_Y, PIES_Y, cuadro_de, fuente, _rgb  # noqa: E402

VEL = 150                                    # BASE_SPEED de runner.js (px de pantalla por segundo)
# Lo de runner.js (OBSTACLE_TYPES) y RunScene.js (PROPS) que hace falta para dibujar la maniobra.
TIPOS = {
    "hole": dict(pre=80, w=150, post=50, clave="hole", y=30, ambiente="carrera", nivel="c3-10",
                 hoy=("fly",), nuevas=("takeoff", "land", "roll"),
                 pasos=(0.0, 0.18, 0.24, 0.42, 0.6, 0.8, 0.88, 0.96)),
    "chair": dict(pre=80, w=48, post=70, clave="chair", y=2, ambiente="parque", nivel="c2-2",
                  hoy=("hop", "tuck"), nuevas=("flip_in", "flip_out"),
                  pasos=(0.0, 0.1, 0.3, 0.45, 0.6, 0.75, 0.9, 1.0)),
    "wall": dict(pre=50, w=150, post=60, clave="wall", y=8, ambiente="parque", nivel="c3-7",
                 hoy=("hop", "tuck"), nuevas=("wallrun0", "wallrun3", "flip_out"),
                 pasos=(0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.88, 0.95, 1.0)),
}
MURO, INCLINA = 78, 16                       # WALL_RUN_HEIGHT y WALL_TILT de RunScene.js


def _ease(q):
    return max(0.0, min(1.0, q))


def pose_hoy(tipo, prog):
    """obstaclePose de hoy: (cuadro, dy, giro, pivote)."""
    arco = math.sin(math.pi * prog)
    if tipo == "hole":
        return "fly", -arco * 150, 0, 0
    if tipo == "chair":
        giro = 360 * _ease((prog - 0.15) / 0.7)
        return ("tuck" if 0.15 < prog < 0.85 else "hop"), -arco * 150, giro, 0
    if tipo == "wall":
        return _barda(prog, "hop")
    raise ValueError(tipo)


def _barda(prog, cae):
    """La barda de obstaclePose: brinca a la pared, corre por ella inclinada y sale con voltereta;
    `cae` es el cuadro del final de la voltereta."""
    if prog < 0.2:
        q = prog / 0.2
        return "hop", -MURO * q - math.sin(math.pi * q) * 18, -INCLINA * q, 0
    if prog < 0.76:
        q = (prog - 0.2) / 0.56
        return "run", -MURO - math.sin(math.pi * q) * 12, -INCLINA, 0
    q = (prog - 0.76) / 0.24
    return ("tuck" if q < 0.75 else cae), -MURO * (1 - q) - math.sin(math.pi * q) * 45, 360 * min(1, q / 0.75), 0


# Hoyo nuevo, como un salto de longitud: llega corriendo, pisa fuerte antes de la orilla (takeoff),
# vuela más bajo y más corto, cae pasando el hoyo (land) y rueda una vez sobre el centro del cuerpo.
HOYO_PISA, HOYO_SALE, HOYO_VUELA_DESDE = 0.17, 0.25, 0.20   # pisa, deja el cuadro de despegue, empieza el arco
HOYO_CAE, HOYO_RUEDA = 0.80, 0.82
HOYO_ALTO = 100                              # px de pantalla en lo más alto (hoy: 150)
PIVOTE_ROLL = 9                              # centro de la bolita (px sobre los pies); main() lo mide en cada hoja
# Silla nueva: la voltereta va más baja, como un mortal real sobre una silla (la bolita la libra
# por poco más de medio cuerpo, no por dos).
SILLA_ALTO = 80                              # px de pantalla en lo más alto (hoy: 150)
# y más rápida: dura el 80 % del obstáculo (hoy, todo), centrada sobre la silla; antes y después corre.
SILLA_DESDE, SILLA_HASTA = 0.125, 0.925
PIVOTE_TUCK = 12                             # centro de la voltereta (tuck); también se mide en cada hoja


def _gira_al_centro(pose):
    """La voltereta gira sobre el centro del cuerpo (no sobre los pies), así viaja con el arco."""
    nombre, dy, giro, piv = pose
    return nombre, dy, giro, (PIVOTE_TUCK if nombre == "tuck" else piv)


def pose_nueva(tipo, prog):
    if tipo == "hole":
        if prog < HOYO_PISA:
            return "run", 0, 0, 0
        dy = 0
        if HOYO_VUELA_DESDE <= prog < HOYO_CAE:
            dy = -math.sin(math.pi * (prog - HOYO_VUELA_DESDE) / (HOYO_CAE - HOYO_VUELA_DESDE)) * HOYO_ALTO
        if prog < HOYO_SALE:
            return "takeoff", dy, 0, 0
        if prog < HOYO_CAE:
            return "fly", dy, 0, 0
        if prog < HOYO_RUEDA:
            return "land", 0, 0, 0
        return "roll", 0, 360 * _ease((prog - HOYO_RUEDA) / (1 - HOYO_RUEDA)), PIVOTE_ROLL
    if tipo == "chair":
        # la misma voltereta de hoy: despega estirada (flip_in) y se abre para caer (flip_out)
        if not SILLA_DESDE <= prog <= SILLA_HASTA:
            return "run", 0, 0, 0
        q = (prog - SILLA_DESDE) / (SILLA_HASTA - SILLA_DESDE)
        nombre, _, giro, piv = _gira_al_centro(pose_hoy(tipo, q))
        if nombre == "hop":
            nombre = "flip_in" if q <= 0.15 else "flip_out"
        return nombre, -math.sin(math.pi * q) * SILLA_ALTO, giro, piv
    if tipo == "wall":
        # sobre la pared corre con su propio ciclo (wallrun0..5): apoyada y tanteándola con la mano
        nombre, dy, giro, piv = _gira_al_centro(_barda(prog, "flip_out"))
        return ("wallrun" if nombre == "run" else nombre), dy, giro, piv
    raise ValueError(tipo)


# ---------- fondo y dibujo a tamaño de juego ----------

def fondo(ambiente):
    """La pantalla del juego con el fondo vivo del ambiente, tomado de su hoja (fondo-<ambiente>)."""
    datos = json.loads((SPRITES / f"fondo-{ambiente}.json").read_text(encoding="utf-8"))
    hoja = Image.open(SPRITES / f"fondo-{ambiente}.png").convert("RGBA")
    capa = {n: hoja.crop((f["frame"]["x"], f["frame"]["y"], f["frame"]["x"] + f["frame"]["w"],
                          f["frame"]["y"] + f["frame"]["h"])) for n, f in datos["frames"].items()}
    a, b = (_rgb(c) for c in datos["meta"]["cielo"]["vivo"])
    base = Image.new("RGBA", (ANCHO, ALTO))
    d = ImageDraw.Draw(base)
    for y in range(SUELO_Y):
        d.line([(0, y), (ANCHO, y)], fill=tuple(round(a[i] + (b[i] - a[i]) * y / SUELO_Y) for i in range(3)))
    for nombre, y in (("far", SUELO_Y - 80 * ESC + 30), ("mid", SUELO_Y - 90 * ESC), ("ground", SUELO_Y)):
        g = capa[nombre].resize((capa[nombre].width * ESC, capa[nombre].height * ESC), Image.NEAREST)
        for x in range(0, ANCHO, g.width):
            base.alpha_composite(g, (x, y))
    return base


def poner_figura(base, cuadro, x, dy, giro=0, pivote=0):
    """Como el sprite del juego: origen abajo al centro en (x, PIES_Y + dy); si hay pivote, gira
    sobre el punto que está `pivote` px del cuadro arriba de los pies."""
    g = cuadro.resize((cuadro.width * ESC, cuadro.height * ESC), Image.NEAREST)
    m = max(g.size)                                         # margen para que el giro no se corte
    lienzo = Image.new("RGBA", (g.width + 2 * m, g.height + 2 * m))
    lienzo.alpha_composite(g, (m, m))
    cx, cy = m + g.width / 2, m + g.height - pivote * ESC
    if giro:
        lienzo = lienzo.rotate(-giro, Image.NEAREST, center=(cx, cy))   # Phaser gira en sentido horario
    base.alpha_composite(lienzo, (round(x - cx), round(PIES_Y + dy - pivote * ESC - cy)))


# ---------- previas ----------

def cuadros_de(personaje):
    mod = importlib.import_module(personaje)
    mod.nino.vestir(POSES_NUEVAS=True, VOLTERETA=True)
    return dict(mod.nino.cuadros())


def recorrido(cs, tipo, variante, pose, x0=250, paso_ms=40, antes=130, despues=130):
    """Cuadros del GIF: corre, pasa el obstáculo con `pose` y sigue corriendo (cámara fija)."""
    t = TIPOS[tipo]
    escena = fondo(t["ambiente"])
    obst = cuadro_de(f"obst-{t['clave']}", variante)
    largo = t["pre"] + t["w"] + t["post"]
    paso = VEL * paso_ms / 1000
    out = []
    x = -antes
    while x <= largo + despues:
        im = escena.copy()
        g = obst.resize((obst.width * ESC, obst.height * ESC), Image.NEAREST)
        im.alpha_composite(g, (x0 + t["pre"], PIES_Y + t["y"] - g.height))
        nombre, dy, giro, piv = pose(tipo, x / largo) if 0 <= x <= largo else ("run", 0, 0, 0)
        if nombre in ("run", "wallrun"):
            nombre += str(int((x + antes) / VEL * 12) % 6)
        poner_figura(im, cs[nombre], x0 + x, dy, giro, piv)
        out.append(im)
        x += paso
    return out


def guardar_gif(cuadros, ruta, corte, ms):
    fr = [c.crop(corte).convert("RGB") for c in cuadros]
    tira = Image.new("RGB", (fr[0].width, fr[0].height * len(fr)))
    for k, f in enumerate(fr):
        tira.paste(f, (0, k * f.height))
    comun = tira.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    fr = [f.quantize(palette=comun, dither=Image.Dither.NONE) for f in fr]
    fr[0].save(ruta, save_all=True, append_images=fr[1:], duration=ms, loop=0, optimize=False)


def hoja_de_contacto(cs, tipo, ruta, titulo, x0=250, corte_y=(200, 500)):
    """Arriba, las poses de hoy y las nuevas ampliadas; abajo, la maniobra paso a paso a tamaño de
    juego (hoy y nueva), sobre el fondo del ambiente."""
    t = TIPOS[tipo]
    esc = 8
    W, H = nino.W, nino.H
    grupos = [("hoy", t["hoy"]), ("nuevas", t["nuevas"])]
    alto_esc = corte_y[1] - corte_y[0]
    im = Image.new("RGB", (ANCHO + 24, 60 + H * esc + 40 + 2 * (alto_esc + 34)), "#211624")
    d = ImageDraw.Draw(im)
    d.text((12, 8), titulo, fill="#f4ecd8", font=fuente(18))
    x = 12
    for etiqueta, nombres in grupos:
        d.text((x, 36), etiqueta, fill="#ffd23f", font=fuente(14))
        for n in nombres:
            d.rectangle([x, 58, x + W * esc - 1, 58 + H * esc - 1], fill="#e9c46a")
            g = cs[n].resize((W * esc, H * esc), Image.NEAREST)
            im.paste(g, (x, 58), g)
            d.text((x, 62 + H * esc), n, fill="#a898ad", font=fuente(13))
            x += W * esc + 12
        x += 30
    largo = t["pre"] + t["w"] + t["post"]
    y = 60 + H * esc + 40
    for etiqueta, pose in (("Hoy", pose_hoy), ("Con las poses nuevas", pose_nueva)):
        d.text((12, y), f"{etiqueta}: la maniobra paso a paso (×3, fondo de {t['ambiente']}, como en {t['nivel']})",
               fill="#f4ecd8", font=fuente(13))
        escena = fondo(t["ambiente"])
        obst = cuadro_de(f"obst-{t['clave']}", "v0")
        g = obst.resize((obst.width * ESC, obst.height * ESC), Image.NEAREST)
        escena.alpha_composite(g, (x0 + t["pre"], PIES_Y + t["y"] - g.height))
        for prog in t["pasos"]:
            nombre, dy, giro, piv = pose(tipo, prog)
            if nombre in ("run", "wallrun"):
                nombre += str(int(prog * largo / VEL * 12) % 6)
            poner_figura(escena, cs[nombre], x0 + prog * largo, dy, giro, piv)
        im.paste(escena.crop((0, corte_y[0], ANCHO, corte_y[1])).convert("RGB"), (12, y + 22))
        y += alto_esc + 34
    im.save(ruta)


def previas(cs, tipo, previas, nombre):
    """Hoja de contacto y GIF (hoy y con las poses nuevas) de un juego de cuadros ya dibujado."""
    global PIVOTE_ROLL, PIVOTE_TUCK
    PIVOTE_ROLL, PIVOTE_TUCK = nino.pivote(cs["roll"]), nino.pivote(cs["tuck"])
    previas.mkdir(parents=True, exist_ok=True)
    hoja_de_contacto(cs, tipo, previas / f"{nombre}-{tipo}-contacto.png",
                     f"{nombre} · poses del obstáculo «{tipo}» (hoy y nuevas, ×8)")
    corte = (100, 200, 760, 500)
    for v in ("v0", "v1"):
        guardar_gif(recorrido(cs, tipo, v, pose_nueva), previas / f"{nombre}-{tipo}-{v}-nuevo.gif", corte, 40)
    guardar_gif(recorrido(cs, tipo, "v0", pose_hoy), previas / f"{nombre}-{tipo}-v0-hoy.gif", corte, 40)
    print("previas en", previas)


def main():
    personaje = sys.argv[3] if len(sys.argv) > 3 else "sofia"
    previas(cuadros_de(personaje), sys.argv[2], Path(sys.argv[1]), personaje)

if __name__ == "__main__":
    main()
