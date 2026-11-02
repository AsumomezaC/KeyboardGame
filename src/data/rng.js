// Generador pseudoaleatorio reproducible (sin dependencias del navegador, se usa en datos y pruebas).
export function rng(seed) {
  let a = typeof seed === 'string' ? Array.from(seed).reduce((h, ch) => Math.imul(h ^ ch.codePointAt(0), 16777619), 2166136261) : seed;
  a >>>= 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
