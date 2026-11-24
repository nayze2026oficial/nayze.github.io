// --- SINTETIZADOR DE EFECTOS DE SONIDO 8-BIT (WEB AUDIO API) ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
}

// 1. Sonido de Golpe (Punch SFX - Onda cuadrada rápida descendente)
function playPunchSound() {
  initAudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(180, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}

// 2. Sonido de Patada (Kick SFX - Frecuencia más grave y corta)
function playKickSound() {
  initAudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(120, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
}

// 3. Sonido de Enemigo Derrotado (Enemigo Muerto SFX - Caída de tono arpegiada)
function playEnemyDefeatedSound() {
  initAudioContext();
  const notes = [300, 240, 180, 120, 80];
  notes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.05);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime + index * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (index + 1) * 0.05);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime + index * 0.05);
    osc.stop(audioCtx.currentTime + (index + 1) * 0.05);
  });
}

// --- INTEGRACIÓN DENTRO DE LA LÓGICA DE ATAQUE ---
function triggerPlayerAttack(type) {
  player.state = type;
  nayzeSprites[type].reset();

  // Reproducir sonido según el tipo de ataque
  if (type === 'punch') {
    playPunchSound();
  } else if (type === 'kick') {
    playKickSound();
  }

  if (activeEnemy && !activeEnemy.isDead) {
    const dist = Math.abs((player.x + player.width / 2) - (activeEnemy.x + activeEnemy.width / 2));
    if (dist < 60) {
      activeEnemy.hp -= 1;
      if (activeEnemy.hp <= 0) {
        activeEnemy.isDead = true;
        defeatedEnemies.push(activeEnemy);
        playEnemyDefeatedSound(); // Sonido al derrotar al enemigo
        unlockDisc();

        if (currentEnemyIndex < 3) {
          currentEnemyIndex++;
          setTimeout(() => { activeEnemy = new Enemy(); }, 800);
        } else {
          activeEnemy = null;
        }
      }
    }
  }

  setTimeout(() => {
    player.state = 'idle';
  }, 300);
}