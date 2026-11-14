# Contenido creativo © 2026 AsumomezaC y Esraly · CC BY-NC 4.0 (ver LICENSE-CONTENIDO.md).
"""Paleta maestra de La Historia de Sofía (aprobada el 13/11/2026).

48 colores en 12 rampas, de oscuro a claro. Todo el arte nuevo sale de aquí.
- Las sombras tiran a morado (como la tinta del contorno), nunca a gris o negro.
- Cada color tiene su pareja «apagada» (casa, tristeza, noche), que se calcula con `apagar()`:
  así la versión viva y la apagada siempre corresponden una a una.
"""
import colorsys

RAMPAS = {
    # contorno: piel oscura / normal
    "tinta":    ["#140d12", "#2b1d2e"],
    # grises morados, crema y blanco (asfalto, tela clara, tenis, ojos)
    "neutros":  ["#4a3a55", "#75657f", "#a898ad", "#d8ccd4", "#f4ecd8", "#ffffff"],
    # todas las pieles del reparto
    "piel":     ["#63363d", "#8d5a3b", "#b5784f", "#d99a70", "#f2c29b", "#fbe0c4"],
    # pelo, madera, ladrillo, tierra
    "tierra":   ["#432530", "#6b3a33", "#96553a", "#c07d48", "#e0ad74"],
    "rosa":     ["#6e1450", "#b0126a", "#e4127f", "#ff78b4"],   # rosa mexicano
    "rojo":     ["#7d2145", "#b83350", "#e94f64", "#ff9488"],   # rojo coral de Sofía
    "naranja":  ["#b8482c", "#f07c2e", "#ffb056"],
    "amarillo": ["#c98a1c", "#ffd23f", "#fff2a6"],              # amarillo de Sofía
    "verde":    ["#1d5145", "#2f8a4c", "#6cc644", "#c0e874"],
    "turquesa": ["#135b6b", "#1699a0", "#3fd4c2", "#b0f2de"],
    "azul":     ["#262c66", "#3d5aa8", "#4c93e6", "#9ad8ff"],
    "morado":   ["#47277a", "#7b48c8", "#b690ff"],
}

VIVA = [c for rampa in RAMPAS.values() for c in rampa]

# Versión apagada elegida por los autores: "fria" (menos saturación y un velo azulado).
# "desaturada" (mismo tono, menos saturación) se conserva solo para comparar en la lámina.
VELO_FRIO = "#56689c"


def _rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def _hex(rgb):
    return "#%02x%02x%02x" % tuple(max(0, min(255, round(v))) for v in rgb)


def apagar(color, modo="fria"):
    """Devuelve la pareja apagada de un color de la paleta. La tinta no cambia."""
    if color in RAMPAS["tinta"]:
        return color
    r, g, b = (v / 255 for v in _rgb(color))
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    if modo == "desaturada":
        rgb = colorsys.hsv_to_rgb(h, s * 0.55, v * 0.93)
        return _hex([x * 255 for x in rgb])
    rgb = [x * 255 for x in colorsys.hsv_to_rgb(h, s * 0.55, v * 0.90)]
    velo = _rgb(VELO_FRIO)
    return _hex([a + (b - a) * 0.18 for a, b in zip(rgb, velo)])


def paleta(modo="viva"):
    """Diccionario rampa -> colores en el modo pedido: "viva", "desaturada" o "fria"."""
    if modo == "viva":
        return {k: list(v) for k, v in RAMPAS.items()}
    return {k: [apagar(c, modo) for c in v] for k, v in RAMPAS.items()}
