// Dedo de mecanografía al tacto para cada tecla física (KeyboardEvent.code).
const LEFT = {
  pinky: ['Backquote', 'Digit1', 'Tab', 'KeyQ', 'CapsLock', 'KeyA', 'ShiftLeft', 'KeyZ', 'ControlLeft'],
  ring: ['Digit2', 'KeyW', 'KeyS', 'KeyX'],
  middle: ['Digit3', 'KeyE', 'KeyD', 'KeyC'],
  index: ['Digit4', 'Digit5', 'KeyR', 'KeyT', 'KeyF', 'KeyG', 'KeyV', 'KeyB'],
  thumb: ['AltLeft', 'MetaLeft'],
};
const RIGHT = {
  index: ['Digit6', 'Digit7', 'KeyY', 'KeyU', 'KeyH', 'KeyJ', 'KeyN', 'KeyM'],
  middle: ['Digit8', 'KeyI', 'KeyK', 'Comma'],
  ring: ['Digit9', 'KeyO', 'KeyL', 'Period'],
  pinky: ['Digit0', 'Minus', 'Equal', 'Backspace', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash',
    'Semicolon', 'Quote', 'Enter', 'Slash', 'ShiftRight', 'ControlRight'],
  thumb: ['AltRight', 'MetaRight', 'ContextMenu'],
};

export const FINGER_NAMES = { pinky: 'meñique', ring: 'anular', middle: 'medio', index: 'índice', thumb: 'pulgar' };
export const FINGER_COLORS = { pinky: '#c77dff', ring: '#4cc9f0', middle: '#80ed99', index: '#ff9f1c', thumb: '#adb5bd' };

const FINGER_OF = { Space: { hand: 'both', finger: 'thumb' } };
for (const [hand, map] of [['L', LEFT], ['R', RIGHT]]) {
  for (const [finger, codes] of Object.entries(map)) {
    for (const code of codes) FINGER_OF[code] = { hand, finger };
  }
}

export function fingerOf(code) {
  return FINGER_OF[code] || null;
}

export function fingerLabel(code) {
  const f = FINGER_OF[code];
  if (!f) return '';
  if (f.finger === 'thumb') return code === 'Space' ? 'pulgar (cualquiera)' : 'pulgar';
  return `${FINGER_NAMES[f.finger]} ${f.hand === 'L' ? 'izquierdo' : 'derecho'}`;
}

// Las mayúsculas se escriben con el Shift de la mano contraria a la letra.
export function oppositeShift(code) {
  const f = FINGER_OF[code];
  return f && f.hand === 'L' ? 'ShiftRight' : 'ShiftLeft';
}
