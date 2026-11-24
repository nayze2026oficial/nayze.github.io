// --- MANEJO DE CONTROLES TÁCTILES EN MÓVILES ---
function bindTouchControl(elementId, keyName) {
  const btn = document.getElementById(elementId);
  if (!btn) return;

  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys[keyName] = true;

    if (keyName === 'z' && player.state !== 'punch' && player.state !== 'kick') {
      triggerPlayerAttack('punch');
    }
    if (keyName === 'x' && player.state !== 'punch' && player.state !== 'kick') {
      triggerPlayerAttack('kick');
    }
  });

  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys[keyName] = false;
  });
}

// Vincular botones con los controles
bindTouchControl('btn-left', 'ArrowLeft');
bindTouchControl('btn-right', 'ArrowRight');
bindTouchControl('btn-punch', 'z');
bindTouchControl('btn-kick', 'x');