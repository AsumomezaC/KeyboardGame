// Captura de texto con un textarea oculto: así el sistema operativo resuelve la
// distribución, las teclas muertas (´ ¨) y los códigos Alt antes de entregarnos el carácter.
const TypeInput = (() => {
  const MODIFIER_CODES = new Set([
    'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight',
    'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight', 'CapsLock', 'NumLock',
  ]);
  let el;
  let active = false;
  let handlers = {};
  let pending = []; // pulsaciones desde el último carácter producido

  function init() {
    el = document.getElementById('type-capture');
    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('keyup', e => { if (e.key === 'Alt') e.preventDefault(); });
    el.addEventListener('input', onInput);
    el.addEventListener('compositionend', e => emit(e.data));
    el.addEventListener('blur', () => { if (active) setTimeout(() => el.focus(), 0); });
    document.addEventListener('mousedown', () => { if (active) setTimeout(() => el.focus(), 0); });
  }

  function onKeyDown(e) {
    if (e.key === 'Tab') e.preventDefault();
    if (handlers.onKey) handlers.onKey(e);
    if (MODIFIER_CODES.has(e.code)) return;
    pending.push({
      code: e.code,
      key: e.key,
      shift: e.shiftKey,
      altGr: e.getModifierState('AltGraph'),
      alt: e.altKey && !e.getModifierState('AltGraph'),
    });
  }

  function onInput(e) {
    if (e.isComposing) return; // lo entrega compositionend
    const data = e.inputType === 'insertText' || e.inputType === 'insertCompositionText' ? e.data : null;
    emit(data);
  }

  function emit(data) {
    el.value = '';
    const strokes = pending;
    pending = [];
    if (!data) return;
    for (const ch of Array.from(data.normalize('NFC'))) {
      if (handlers.onChar) handlers.onChar(ch, strokes);
    }
  }

  function setActive(on) {
    active = on;
    pending = [];
    if (on) el.focus();
    else el.blur();
  }

  function on(h) {
    handlers = h;
  }

  return { init, setActive, on };
})();
