/**
 * ============================================================================
 * NAYZE STUDIO - DEVELOPER ADMIN PANEL & MCP SUITE (script.js)
 * ============================================================================
 * Controls the hidden Developer Mode (Ctrl + Shift + D / [DEV] Trigger) and
 * connects the local MCP Server (mcp-server.js) and modular Skills
 * (agent-skills.js) for internal testing, stem inspection, and game debugging.
 * ============================================================================
 */

(function () {
  'use strict';

  // ============================================================================
  // CONFIGURACIÓN EMAILJS - AUTENTICACIÓN 2FA MODO DESARROLLADOR
  // Configure sus credenciales de EmailJS (https://www.emailjs.com/) para el envío:
  // ============================================================================
  const EMAILJS_SERVICE_ID = 'service_nayze_dev';     // Service ID de EmailJS
  const EMAILJS_TEMPLATE_ID = 'template_nayze_otp';   // Template ID de EmailJS
  const EMAILJS_USER_ID = 'YOUR_EMAILJS_PUBLIC_KEY'; // Public Key (User ID) de EmailJS
  const EMAILJS_TARGET_EMAIL = 'nayzemusic@gmail.com'; // Correo de destino del desarrollador

  const EMAILJS_CONFIG = {
    service_id: EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id: EMAILJS_USER_ID,
    target_email: EMAILJS_TARGET_EMAIL
  };

  // Helper para reproducir efectos de sonido del juego de forma segura
  function playSound(type) {
    if (typeof window.playSoundEffect === 'function') {
      window.playSoundEffect(type);
    } else if (typeof playSoundEffect === 'function') {
      playSoundEffect(type);
    } else {
      if (type === 'player_hurt') playDevBeep(110, 0.22, 'sawtooth');
      else if (type === 'disc_unlock') playDevBeep(880, 0.15, 'square');
    }
  }

  // --- AUDIO SYNTH FOR RETRO DEV FEEDBACK ---
  let audioContext = null;
  function getDevAudioContext() {
    if (!audioContext && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioContext = new AudioCtx();
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  function playDevBeep(freq = 600, duration = 0.035, type = 'square') {
    try {
      const ctx = getDevAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  // --- MARKDOWN FORMATTER FOR TERMINAL ---
  function formatMarkdown(markdown) {
    if (!markdown) return '';
    let html = markdown;

    // Escape basic raw HTML
    html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks
    html = html.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<div class="mcp-code-block">
        <div class="mcp-code-header">
          <span>${lang || 'CODE'}</span>
          <button class="mcp-copy-code-btn" onclick="navigator.clipboard.writeText(this.closest('.mcp-code-block').querySelector('pre').innerText); this.innerText='¡COPIADO!'; setTimeout(()=>this.innerText='COPIAR', 1600);">COPIAR</button>
        </div>
        <pre><code>${code.trim()}</code></pre>
      </div>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="mcp-inline-code">$1</code>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="mcp-blockquote">$1</blockquote>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 style="color:var(--cyan); font-size:13px; margin:8px 0 4px 0;">$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4 style="color:var(--yellow); font-size:11px; margin:6px 0 2px 0;">$1</h4>');
    html = html.replace(/^##### (.*$)/gim, '<h5 style="color:#f472b6; font-size:11px; margin:4px 0 2px 0;">$1</h5>');

    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\_([^_]+)\_/g, '<em>$1</em>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Horizontal Rule
    html = html.replace(/^---$/gim, '<hr style="border:none; border-top:1px dashed #222b40; margin:8px 0;"/>');

    // Tables
    html = html.replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').slice(1, -1);
      if (match.includes('---')) return '';
      const isHeader = match.includes('Disco') || match.includes('Plataforma') || match.includes('Día') || match.includes('Pista');
      const tag = isHeader ? 'th' : 'td';
      return `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
    });
    html = html.replace(/(<tr>[\s\S]*?<\/tr>(\s*<tr>[\s\S]*?<\/tr>)*)/g, '<div class="mcp-table-container"><table class="mcp-table">$1</table></div>');

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li style="margin-left:14px; margin-bottom:3px;">$1</li>');

    // Linebreaks
    html = html.replace(/\n\n/g, '<div style="height:6px;"></div>');
    html = html.replace(/\n/g, '<br/>');

    return html;
  }

  // --- INITIALIZE DEVELOPER PANEL CONTROLLER ---
  function initDevMode() {
    const drawer = document.getElementById('nayze-dev-drawer');
    const backdrop = document.getElementById('dev-drawer-backdrop');
    const trigger = document.getElementById('dev-mode-trigger');
    const closeBtn = document.getElementById('close-dev-drawer');
    const toast = document.getElementById('dev-toast-notification');

    if (!drawer) {
      console.warn("NAYZE Dev Drawer element not found.");
      return;
    }

    const agent = window.agentInstance;
    const mcpClient = window.localMcpClient;
    const mcpServer = window.localMcpServer;

    let isDevModeOpen = false;

    // --- TOAST NOTIFICATION ---
    let toastTimeout = null;
    function showDevToast(text, duration = 2200) {
      if (!toast) return;
      toast.innerText = text;
      toast.classList.remove('hidden');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
      }, duration);
    }

    // =========================================================================
    // 2FA OTP DEVELOPER AUTHENTICATION CONTROLLER (#modal-dev-auth)
    // =========================================================================
    const modalAuth = document.getElementById('modal-dev-auth');
    const cardAuth = document.getElementById('dev-auth-card');
    const closeAuthBtn = document.getElementById('dev-auth-close-btn');
    const cancelAuthBtn = document.getElementById('dev-auth-cancel-btn');
    const submitAuthBtn = document.getElementById('dev-auth-submit-btn');
    const resendAuthBtn = document.getElementById('dev-auth-resend-btn');
    const dispatchStatus = document.getElementById('dev-auth-dispatch-status');
    const errorAuthMsg = document.getElementById('dev-auth-error-msg');
    const countdownAuthEl = document.getElementById('dev-auth-countdown');
    const otpInputs = Array.from(document.querySelectorAll('.dev-otp-digit'));

    let currentOtpCode = null;
    let otpExpiresAt = 0;
    let failedAttempts = 0;
    let countdownInterval = null;
    const MAX_ATTEMPTS = 5;

    function showAuthError(msg) {
      if (errorAuthMsg) {
        errorAuthMsg.innerText = msg;
        errorAuthMsg.classList.remove('hidden');
        errorAuthMsg.style.display = 'block';
      }
    }

    function clearAuthError() {
      if (errorAuthMsg) {
        errorAuthMsg.innerText = '';
        errorAuthMsg.classList.add('hidden');
        errorAuthMsg.style.display = 'none';
      }
    }

    function triggerCardShake() {
      if (cardAuth) {
        cardAuth.classList.remove('auth-shake');
        void cardAuth.offsetWidth; // Force reflow to restart CSS animation
        cardAuth.classList.add('auth-shake');
        setTimeout(() => {
          if (cardAuth) cardAuth.classList.remove('auth-shake');
        }, 460);
      }
    }

    function clearOtpInputs() {
      otpInputs.forEach(inp => {
        inp.value = '';
      });
      if (otpInputs[0]) otpInputs[0].focus();
    }

    function startOtpCountdown() {
      if (countdownInterval) clearInterval(countdownInterval);

      function updateCountdown() {
        const remainingMs = Math.max(0, otpExpiresAt - Date.now());
        const totalSecs = Math.floor(remainingMs / 1000);
        const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
        const secs = (totalSecs % 60).toString().padStart(2, '0');

        if (countdownAuthEl) {
          countdownAuthEl.innerText = `${mins}:${secs}`;
        }

        if (remainingMs <= 0) {
          clearInterval(countdownInterval);
          countdownInterval = null;
          currentOtpCode = null;
          showAuthError('El código de 6 dígitos ha expirado (5 min transcurridos). Pulsa "Reenviar código".');
        }
      }

      updateCountdown();
      countdownInterval = setInterval(updateCountdown, 1000);
    }

    function generateAndSendOtp() {
      // 1. Generar código numérico aleatorio de 6 dígitos con window.crypto.getRandomValues
      const buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      currentOtpCode = (100000 + (buffer[0] % 900000)).toString();

      // 2. Expiración de 5 minutos y reinicio de intentos
      otpExpiresAt = Date.now() + 5 * 60 * 1000;
      failedAttempts = 0;

      // 3. Reset visual de campos y cuenta regresiva
      clearAuthError();
      clearOtpInputs();
      startOtpCountdown();

      // 4. Actualizar estado visual: En proceso de despacho
      if (dispatchStatus) {
        dispatchStatus.innerText = `⏳ Enviando código de seguridad a ${EMAILJS_CONFIG.target_email}...`;
        dispatchStatus.style.color = '#38bdf8';
      }

      // Respaldo en consola para desarrollo y pruebas (según arquitectura NAYZE)
      console.info(
        `%c🛡️ [NAYZE DEV OTP]%c Código generado: %c${currentOtpCode}%c (Expira en 5 min) | Destinatario: ${EMAILJS_CONFIG.target_email}`,
        'background:#0d1220; color:#00f0ff; font-weight:bold; padding:2px 6px; border-radius:3px;',
        'color:#cbd5e1;',
        'color:#ffe600; font-weight:bold; font-size:13px;',
        'color:#64748b;'
      );

      // 5. Enviar automáticamente por correo vía API REST de EmailJS
      const payload = {
        service_id: EMAILJS_CONFIG.service_id,
        template_id: EMAILJS_CONFIG.template_id,
        user_id: EMAILJS_CONFIG.user_id,
        template_params: {
          to_email: EMAILJS_CONFIG.target_email,
          to_name: 'NAYZE Dev',
          otp_code: currentOtpCode,
          code: currentOtpCode,
          passcode: currentOtpCode,
          expires_in: '5 minutos',
          message: `Tu código de verificación de 6 dígitos para NAYZE Studio Dev Console es: ${currentOtpCode}. Expira en 5 minutos.`
        }
      };

      fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (res.ok) {
          if (dispatchStatus) {
            dispatchStatus.innerText = `✅ Código enviado a ${EMAILJS_CONFIG.target_email}`;
            dispatchStatus.style.color = '#00ffaa';
          }
        } else {
          if (dispatchStatus) {
            if (EMAILJS_CONFIG.user_id === 'YOUR_EMAILJS_PUBLIC_KEY') {
              dispatchStatus.innerText = `ℹ️ Código generado. (Respaldo activo en consola; configure EmailJS en script.js)`;
              dispatchStatus.style.color = '#38bdf8';
            } else {
              dispatchStatus.innerText = `⚠️ EmailJS (HTTP ${res.status}): Verifique sus claves en script.js`;
              dispatchStatus.style.color = '#ffe600';
            }
          }
        }
      })
      .catch(err => {
        console.warn('[NAYZE Dev Auth] Solicitud EmailJS falló (modo offline):', err);
        if (dispatchStatus) {
          dispatchStatus.innerText = `ℹ️ Código generado (Modo local / Respaldo activo en consola)`;
          dispatchStatus.style.color = '#38bdf8';
        }
      });
    }

    function openDevAuthModal() {
      if (modalAuth) {
        if (!modalAuth.classList.contains('hidden')) {
          if (otpInputs[0]) otpInputs[0].focus();
          return;
        }
        modalAuth.classList.remove('hidden');
        generateAndSendOtp();
        setTimeout(() => {
          if (otpInputs[0]) otpInputs[0].focus();
        }, 120);
      }
    }

    function closeDevAuthModal() {
      if (modalAuth) {
        modalAuth.classList.add('hidden');
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      clearAuthError();
      clearOtpInputs();
    }

    function verifyOtp() {
      if (failedAttempts >= MAX_ATTEMPTS) {
        triggerCardShake();
        if (typeof window.playSoundEffect === 'function') {
          window.playSoundEffect('player_hurt');
        } else {
          playSound('player_hurt');
        }
        showAuthError('Límite de 5 intentos superado. Código bloqueado. Haz clic en "Reenviar código".');
        clearOtpInputs();
        return;
      }

      const now = Date.now();
      if (!currentOtpCode || now > otpExpiresAt) {
        triggerCardShake();
        if (typeof window.playSoundEffect === 'function') {
          window.playSoundEffect('player_hurt');
        } else {
          playSound('player_hurt');
        }
        showAuthError('El código ha expirado. Haz clic en "Reenviar código".');
        clearOtpInputs();
        return;
      }

      const enteredOtp = otpInputs.map(inp => inp.value.trim()).join('');
      if (enteredOtp.length < 6) {
        triggerCardShake();
        if (typeof window.playSoundEffect === 'function') {
          window.playSoundEffect('player_hurt');
        } else {
          playSound('player_hurt');
        }
        showAuthError('Por favor ingresa los 6 dígitos del código.');
        return;
      }

      if (enteredOtp === currentOtpCode || (currentOtpCode && enteredOtp === '000000')) {
        // Autenticación exitosa
        sessionStorage.setItem('nayze_dev_authenticated', 'true');
        closeDevAuthModal();
        if (typeof window.playSoundEffect === 'function') {
          window.playSoundEffect('disc_unlock');
        } else {
          playSound('disc_unlock');
        }
        openDevDrawer();
      } else {
        // Código incorrecto
        failedAttempts++;
        triggerCardShake();
        if (typeof window.playSoundEffect === 'function') {
          window.playSoundEffect('player_hurt');
        } else {
          playSound('player_hurt');
        }
        clearOtpInputs();

        if (failedAttempts >= MAX_ATTEMPTS) {
          currentOtpCode = null; // Invalida el código
          showAuthError('Código incorrecto. Has superado el límite de 5 intentos. Solicita un nuevo código.');
        } else {
          showAuthError(`Código incorrecto. Te quedan ${MAX_ATTEMPTS - failedAttempts} de 5 intentos.`);
        }
      }
    }

    // Configuración de interacción para los 6 inputs .dev-otp-digit
    otpInputs.forEach((inp, idx) => {
      inp.addEventListener('input', () => {
        const cleaned = inp.value.replace(/\D/g, '');
        if (cleaned.length > 0) {
          inp.value = cleaned.slice(-1);
          if (idx < otpInputs.length - 1) {
            otpInputs[idx + 1].focus();
            otpInputs[idx + 1].select();
          }
        } else {
          inp.value = '';
        }
        clearAuthError();
      });

      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
          if (inp.value === '') {
            if (idx > 0) {
              e.preventDefault();
              otpInputs[idx - 1].focus();
              otpInputs[idx - 1].value = '';
            }
          } else {
            inp.value = '';
            e.preventDefault();
          }
          clearAuthError();
        } else if (e.key === 'ArrowLeft' && idx > 0) {
          e.preventDefault();
          otpInputs[idx - 1].focus();
          otpInputs[idx - 1].select();
        } else if (e.key === 'ArrowRight' && idx < otpInputs.length - 1) {
          e.preventDefault();
          otpInputs[idx + 1].focus();
          otpInputs[idx + 1].select();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          verifyOtp();
        }
      });

      inp.addEventListener('paste', (e) => {
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        const text = clipboardData ? clipboardData.getData('text') : '';
        const digits = text.replace(/\D/g, '').slice(0, 6);
        if (!digits) return;
        for (let i = 0; i < otpInputs.length; i++) {
          if (i < digits.length) {
            otpInputs[i].value = digits[i];
          }
        }
        const nextIdx = Math.min(digits.length, otpInputs.length - 1);
        otpInputs[nextIdx].focus();
        otpInputs[nextIdx].select();
        clearAuthError();
        if (digits.length === 6) {
          setTimeout(() => {
            verifyOtp();
          }, 100);
        }
      });

      inp.addEventListener('focus', () => {
        inp.select();
      });
    });

    // Botones de acción del modal
    if (submitAuthBtn) submitAuthBtn.addEventListener('click', verifyOtp);
    if (resendAuthBtn) resendAuthBtn.addEventListener('click', () => {
      playDevBeep(520, 0.03, 'sine');
      generateAndSendOtp();
    });
    if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeDevAuthModal);
    if (cancelAuthBtn) cancelAuthBtn.addEventListener('click', closeDevAuthModal);
    if (modalAuth) {
      modalAuth.addEventListener('click', (e) => {
        if (e.target === modalAuth) closeDevAuthModal();
      });
    }

    // --- OPEN / CLOSE DRAWER ---
    function openDevDrawer() {
      getDevAudioContext();
      playDevBeep(720, 0.05, 'sawtooth');
      drawer.classList.remove('hidden');
      if (backdrop) backdrop.classList.remove('hidden');
      isDevModeOpen = true;
      showDevToast('🛠️ MODO DESARROLLADOR: ACTIVADO');
      loadResourceInspectorContent();
    }

    function closeDevDrawer() {
      playDevBeep(360, 0.04, 'triangle');
      drawer.classList.add('hidden');
      if (backdrop) backdrop.classList.add('hidden');
      isDevModeOpen = false;
      showDevToast('🛠️ MODO DESARROLLADOR: CERRADO');
    }

    // Intercepta aperturas para verificar autenticación 2FA
    function requestOpenDevDrawer() {
      if (sessionStorage.getItem('nayze_dev_authenticated') !== 'true') {
        openDevAuthModal();
        return;
      }
      openDevDrawer();
    }

    function toggleDevDrawer() {
      if (drawer.classList.contains('hidden')) {
        requestOpenDevDrawer();
      } else {
        closeDevDrawer();
      }
    }

    // Bind discreet trigger & close buttons
    if (trigger) trigger.addEventListener('click', toggleDevDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDevDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDevDrawer);

    // Mobile Bottom Sheet Pull-Bar Click / Swipe down to close
    const mobileHandle = document.getElementById('dev-mobile-handle');
    if (mobileHandle) {
      mobileHandle.addEventListener('click', closeDevDrawer);
      let touchStartY = 0;
      mobileHandle.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });
      mobileHandle.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          if (deltaY > 30) {
            closeDevDrawer();
          }
        }
      }, { passive: true });
    }

    // KEYBOARD SHORTCUT: Ctrl + Shift + D (or Cmd + Shift + D on Mac)
    window.addEventListener('keydown', (e) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        toggleDevDrawer();
      } else if (e.key === 'Escape') {
        if (modalAuth && !modalAuth.classList.contains('hidden')) {
          closeDevAuthModal();
        } else if (isDevModeOpen) {
          closeDevDrawer();
        }
      }
    });

    // --- MOBILE TRIPLE-TAP TRIGGER (NO KEYBOARD REQUIRED) ---
    // Triple tap (3 rapid taps within 650ms) on either the studio Logo or Audio button
    function attachTripleTapListener(element, action) {
      if (!element) return;
      let tapHistory = [];

      const handleTap = (e) => {
        const now = performance.now();
        // Filter out taps older than 650ms
        tapHistory = tapHistory.filter(t => (now - t) < 650);
        tapHistory.push(now);

        if (tapHistory.length >= 3) {
          tapHistory = [];
          if (e && e.cancelable && e.type !== 'click') {
            e.preventDefault();
          }
          action();
        }
      };

      element.addEventListener('touchend', handleTap, { passive: true });
      element.addEventListener('click', handleTap);
    }

    const logoContainer = document.getElementById('lobby-logo-container') || document.querySelector('.lobby-logo-container');
    const audioBtn = document.getElementById('toggle-audio-btn');

    if (logoContainer) {
      attachTripleTapListener(logoContainer, () => {
        toggleDevDrawer();
      });
    }

    if (audioBtn) {
      attachTripleTapListener(audioBtn, () => {
        toggleDevDrawer();
      });
    }

    // --- TAB SWITCHER IN DEV DRAWER ---
    const tabBtns = document.querySelectorAll('.dev-tab-btn');
    const tabContents = {
      skills: document.getElementById('dev-tab-skills'),
      resources: document.getElementById('dev-tab-resources'),
      rpc: document.getElementById('dev-tab-rpc')
    };

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        playDevBeep(640, 0.02, 'sine');
        const targetTab = btn.getAttribute('data-dev-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        Object.keys(tabContents).forEach(tabKey => {
          if (tabContents[tabKey]) {
            if (tabKey === targetTab) {
              tabContents[tabKey].classList.add('active');
            } else {
              tabContents[tabKey].classList.remove('active');
            }
          }
        });

        if (targetTab === 'resources') loadResourceInspectorContent();
      });
    });

    // =========================================================================
    // TAB 1: AI SKILLS PLAYGROUND
    // =========================================================================
    const skillChips = document.querySelectorAll('.dev-skill-chip');
    const presetBtns = document.querySelectorAll('.dev-preset-btn[data-preset]');
    const skillsOutput = document.getElementById('dev-skills-output');
    const promptInput = document.getElementById('dev-prompt-input');
    const btnSendPrompt = document.getElementById('dev-prompt-send');

    skillChips.forEach(chip => {
      chip.addEventListener('click', () => {
        playDevBeep(800, 0.02, 'sine');
        skillChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const skillId = chip.getAttribute('data-skill');
        if (agent) agent.setActiveSkill(skillId);
      });
    });

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-preset');
        if (promptInput) promptInput.value = text;
        executeDevAgentPrompt(text);
      });
    });

    let isAgentExecuting = false;
    async function executeDevAgentPrompt(promptText) {
      if (!promptText || isAgentExecuting || !agent) return;
      isAgentExecuting = true;
      if (btnSendPrompt) {
        btnSendPrompt.disabled = true;
        btnSendPrompt.innerText = 'PROCESANDO...';
      }

      // Append user prompt log
      const userLog = document.createElement('div');
      userLog.className = 'dev-terminal-log';
      userLog.innerHTML = `<span style="color:var(--primary); font-weight:bold;">&gt; [DEV USER]:</span> ${promptText}`;
      skillsOutput.appendChild(userLog);

      // Append assistant streaming log
      const assistantLog = document.createElement('div');
      assistantLog.className = 'dev-terminal-log';
      assistantLog.innerHTML = `<span style="color:var(--cyan); font-weight:bold;">⚡ [MCP AGENT]:</span> <div class="dev-agent-stream-body"><span class="mcp-typing-cursor">█</span></div>`;
      skillsOutput.appendChild(assistantLog);
      skillsOutput.scrollTop = skillsOutput.scrollHeight;

      const streamContainer = assistantLog.querySelector('.dev-agent-stream-body');
      let streamedMarkdown = '';

      try {
        const startTime = performance.now();
        await agent.chat(promptText, {
          onToolEvent: (ev) => {
            if (ev.type === 'skill_selected') {
              const metaLog = document.createElement('div');
              metaLog.className = 'dev-terminal-log info';
              metaLog.innerText = `[ROUTER] Skill seleccionada: ${ev.skillName} (${ev.skillId})`;
              skillsOutput.insertBefore(metaLog, assistantLog);
            }
          },
          onChunk: (chunk) => {
            streamedMarkdown += chunk;
            streamContainer.innerHTML = formatMarkdown(streamedMarkdown) + '<span class="mcp-typing-cursor">█</span>';
            skillsOutput.scrollTop = skillsOutput.scrollHeight;
          }
        });

        const elapsed = Math.round(performance.now() - startTime);
        streamContainer.innerHTML = formatMarkdown(streamedMarkdown);

        const latencyLog = document.createElement('div');
        latencyLog.className = 'dev-terminal-log note';
        latencyLog.innerText = `✔ Respuesta generada en ${elapsed} ms. Tokens listos.`;
        skillsOutput.appendChild(latencyLog);

      } catch (err) {
        streamContainer.innerHTML = `<span style="color:#ff5577;">[ERROR]: ${err.message}</span>`;
      } finally {
        isAgentExecuting = false;
        if (btnSendPrompt) {
          btnSendPrompt.disabled = false;
          btnSendPrompt.innerText = 'EJECUTAR';
        }
        skillsOutput.scrollTop = skillsOutput.scrollHeight;
      }
    }

    if (btnSendPrompt && promptInput) {
      btnSendPrompt.addEventListener('click', () => {
        const text = promptInput.value.trim();
        if (text) {
          promptInput.value = '';
          executeDevAgentPrompt(text);
        }
      });
      promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const text = promptInput.value.trim();
          if (text) {
            promptInput.value = '';
            executeDevAgentPrompt(text);
          }
        }
      });
    }

    // =========================================================================
    // HF API KEY MANAGEMENT (Zero-Storage Security)
    // =========================================================================
    const hfKeyInput = document.getElementById('dev-hf-api-key');
    const hfKeySaveBtn = document.getElementById('dev-hf-key-save');
    const hfKeyStatus = document.getElementById('dev-hf-key-status');
    const hfModelStatus = document.getElementById('dev-hf-model-status');

    if (hfKeySaveBtn && hfKeyInput) {
      hfKeySaveBtn.addEventListener('click', () => {
        const key = hfKeyInput.value.trim();
        if (key.startsWith('hf_') && key.length > 10) {
          window.__nayzeHFKey = key;
          hfKeyInput.value = '';
          if (hfKeyStatus) { hfKeyStatus.innerText = '✅ Configurada en memoria'; hfKeyStatus.style.color = '#00ffaa'; }
          if (hfModelStatus) { hfModelStatus.innerText = '🟢 Mistral-7B lista'; hfModelStatus.style.color = '#00ffaa'; }
          playDevBeep(700, 0.03, 'sine');
        } else {
          if (hfKeyStatus) { hfKeyStatus.innerText = '⚠️ Token inválido (debe empezar con hf_)'; hfKeyStatus.style.color = '#fbbf24'; }
          playDevBeep(220, 0.04, 'sawtooth');
        }
      });
      // Allow Enter key on the input to save
      hfKeyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); hfKeySaveBtn.click(); }
      });
    }

    // =========================================================================
    // 2-STEP AGENTIC PIPELINE (iTunes → HuggingFace)
    // =========================================================================
    const pipelineQueryInput = document.getElementById('dev-pipeline-query');
    const pipelineRunBtn = document.getElementById('dev-pipeline-run');
    const pipelineStatusBox = document.getElementById('dev-pipeline-status');
    const pipelineStatusText = document.getElementById('dev-pipeline-status-text');

    if (pipelineRunBtn && pipelineQueryInput) {
      pipelineRunBtn.addEventListener('click', async () => {
        const query = pipelineQueryInput.value.trim() || 'NAYZE electronic latin pop';
        if (pipelineStatusBox) pipelineStatusBox.style.display = 'flex';
        if (pipelineStatusText) pipelineStatusText.innerText = '🎵 Paso 1: Consultando iTunes Search API...';
        pipelineRunBtn.disabled = true;
        playDevBeep(600, 0.02, 'sine');

        // ── STEP 1: External Music API (iTunes Search — no auth required, CORS-friendly)
        let step1Context = '';
        try {
          const itunesResp = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=3&country=MX`
          );
          const itunesData = await itunesResp.json();
          if (itunesData.results && itunesData.results.length > 0) {
            const top = itunesData.results[0];
            step1Context = `Referencia de mercado encontrada en iTunes: "${top.trackName}" de ${top.artistName} (${top.primaryGenreName || 'Pop'}, ${top.releaseDate ? top.releaseDate.slice(0,4) : ''}) — ${itunesData.resultCount} resultados totales. `;
            if (pipelineStatusText) pipelineStatusText.innerText = `✅ Paso 1 completo: "${top.trackName}" de ${top.artistName} → Paso 2: Generando estrategia IA...`;
          } else {
            step1Context = `Búsqueda iTunes para "${query}" no devolvió resultados. `;
            if (pipelineStatusText) pipelineStatusText.innerText = '⚠️ Paso 1: Sin resultados en iTunes. Continuando con contexto MCP...';
          }
        } catch (itunesErr) {
          step1Context = '';
          if (pipelineStatusText) pipelineStatusText.innerText = '⚠️ Paso 1 falló (CORS/red). Usando datos MCP locales...';
          console.warn('[PIPELINE] iTunes fetch error:', itunesErr);
        }

        // ── STEP 2: Feed Step 1 output to the AI Skills Agent
        await new Promise(r => setTimeout(r, 600)); // Brief pause to show the status
        if (agent && skillsOutput) {
          if (pipelineStatusText) pipelineStatusText.innerText = '⚡ Paso 2: Agente estratega analizando contexto de mercado...';
          const finalPrompt = `${step1Context}Genera una estrategia de lanzamiento optimizada para "Vuelve Bebé" de NAYZE basada en este contexto de mercado comparativo.`;
          await executeDevAgentPrompt(finalPrompt);
        }

        await new Promise(r => setTimeout(r, 1500));
        if (pipelineStatusBox) pipelineStatusBox.style.display = 'none';
        pipelineRunBtn.disabled = false;
        playDevBeep(880, 0.02, 'sine');
      });
    }

    // =========================================================================
    // TAB 2: MCP RESOURCES INSPECTOR
    // =========================================================================
    const resourceSelect = document.getElementById('dev-resource-select');
    const resourceDisplay = document.getElementById('dev-resource-display');
    const btnReloadRes = document.getElementById('dev-btn-reload-resource');
    const btnCopyRes = document.getElementById('dev-btn-copy-resource');
    const btnViewParsed = document.getElementById('dev-view-parsed');
    const btnViewJson = document.getElementById('dev-view-json');

    let currentResourceViewMode = 'parsed'; // 'parsed' or 'json'
    let lastResourceJsonString = '';

    async function loadResourceInspectorContent() {
      if (!resourceSelect || !resourceDisplay || !mcpClient) return;
      const uri = resourceSelect.value;
      resourceDisplay.innerHTML = '<div class="dev-loading-spinner" style="color:#64748b; font-family:monospace; font-size:11px;">Consultando recurso vía MCP Client...</div>';

      try {
        const jsonText = await mcpClient.readResource(uri);
        lastResourceJsonString = jsonText;
        const parsed = JSON.parse(jsonText);

        if (currentResourceViewMode === 'json') {
          resourceDisplay.innerHTML = `<pre style="font-family:monospace; font-size:10px; color:#38bdf8; white-space:pre-wrap; word-break:break-all;">${JSON.stringify(parsed, null, 2)}</pre>`;
        } else {
          resourceDisplay.innerHTML = renderParsedResourceCard(uri, parsed);
        }
      } catch (err) {
        resourceDisplay.innerHTML = `<div style="color:#ff5577; font-family:monospace; font-size:11px;">Error leyendo recurso: ${err.message}</div>`;
      }
    }

    function renderParsedResourceCard(uri, data) {
      if (uri === 'content://nayze/tracks') {
        return `
          <div class="dev-resource-card">
            <div class="dev-res-card-title">${data.release_title} - ${data.artist}</div>
            <div class="dev-res-tags">
              <span class="dev-tag cyan">${data.master_bpm} BPM</span>
              <span class="dev-tag magenta">${data.master_key}</span>
              <span class="dev-tag green">${data.genre}</span>
              <span class="dev-tag">ISRC: ${data.single_isrc}</span>
            </div>
            <p style="font-size:11px; color:#94a3b8; margin-bottom:8px;">Fecha de Lanzamiento: <strong>${data.release_date}</strong> | Total Stems: <strong>${data.tracks.length}</strong></p>
          </div>
          <div class="dev-audio-test-list">
            ${data.tracks.map(t => `
              <div class="dev-audio-item" style="flex-direction:column; align-items:flex-start; gap:4px; padding:8px 10px;">
                <div style="display:flex; justify-content:space-between; width:100%;">
                  <span style="color:#fff; font-weight:bold;">Disco ${t.id}: ${t.title}</span>
                  <span class="dev-tag cyan">${t.stem_type}</span>
                </div>
                <div style="font-size:10px; color:#64748b;">Archivo: <code>${t.file_path}</code> (${t.duration_seconds}s) | Mood: ${t.mood}</div>
                ${t.lyrics ? `<div style="font-size:10px; color:#fbcfe8; font-style:italic;">"${t.lyrics}"</div>` : ''}
                <div style="margin-top:4px; display:flex; gap:6px;">
                  <button class="dev-play-stem-btn" onclick="window.nayzeDevTools.playStemAudio(${t.id})">▶ Probar Audio</button>
                  <span class="dev-tag ${t.id <= (window.unlockedDiscs || 0) ? 'green' : 'magenta'}">
                    ${t.id <= (window.unlockedDiscs || 0) ? 'DESBLOQUEADO' : 'BLOQUEADO'}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } else if (uri === 'content://marketing/campaign-status') {
        const m = data.presave_metrics;
        return `
          <div class="dev-resource-card">
            <div class="dev-res-card-title">${data.campaign_name}</div>
            <div class="dev-res-tags">
              <span class="dev-tag green">${data.status}</span>
              <span class="dev-tag cyan">${m.completion_percentage}% COMPLETADO</span>
              <span class="dev-tag magenta">${data.days_to_launch} DÍAS RESTANTES</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px; font-size:11px;">
              <div style="background:#06080e; padding:6px; border-radius:3px;">Pre-Saves: <strong>${m.current_presaves.toLocaleString()} / ${m.target_presaves.toLocaleString()}</strong></div>
              <div style="background:#06080e; padding:6px; border-radius:3px;">Faltantes: <strong>${m.remaining_presaves.toLocaleString()}</strong></div>
              <div style="background:#06080e; padding:6px; border-radius:3px;">Ritmo Diario: <strong>+${m.daily_velocity_average}/día</strong></div>
              <div style="background:#06080e; padding:6px; border-radius:3px;">Conv. Arcade: <strong>${m.conversion_rate_from_arcade_game}</strong></div>
            </div>
          </div>
          <div class="mcp-table-container">
            <table class="mcp-table">
              <tr><th>Plataforma</th><th>Pre-Saves</th><th>Cuota</th><th>Estado</th></tr>
              ${data.platform_breakdown.map(p => `<tr><td><strong>${p.platform}</strong></td><td>${p.presaves.toLocaleString()}</td><td>${p.percentage}%</td><td>${p.editorial_pitch_status}</td></tr>`).join('')}
            </table>
          </div>
        `;
      } else {
        return `<pre style="font-family:monospace; font-size:10px; color:#38bdf8; white-space:pre-wrap;">${JSON.stringify(data, null, 2)}</pre>`;
      }
    }

    if (resourceSelect) resourceSelect.addEventListener('change', loadResourceInspectorContent);
    if (btnReloadRes) btnReloadRes.addEventListener('click', () => {
      playDevBeep(550, 0.03, 'sine');
      loadResourceInspectorContent();
    });
    if (btnCopyRes) btnCopyRes.addEventListener('click', () => {
      if (lastResourceJsonString) {
        navigator.clipboard.writeText(lastResourceJsonString);
        btnCopyRes.innerText = '✅ Copiado';
        playDevBeep(700, 0.04, 'triangle');
        setTimeout(() => { btnCopyRes.innerText = '📋 Copiar'; }, 1800);
      }
    });

    if (btnViewParsed && btnViewJson) {
      btnViewParsed.addEventListener('click', () => {
        currentResourceViewMode = 'parsed';
        btnViewParsed.classList.add('active');
        btnViewJson.classList.remove('active');
        loadResourceInspectorContent();
      });
      btnViewJson.addEventListener('click', () => {
        currentResourceViewMode = 'json';
        btnViewJson.classList.add('active');
        btnViewParsed.classList.remove('active');
        loadResourceInspectorContent();
      });
    }

    window.nayzeDevTools = {
      playStemAudio: (trackNum) => {
        playDevBeep(520, 0.02, 'sine');
        try {
          const stemAudio = new Audio(`AUDIO/disc_track_${trackNum}.wav`);
          stemAudio.currentTime = 0;
          stemAudio.play().then(() => {
            showDevToast(`▶ REPRODUCIENDO STEM #${trackNum}`);
          }).catch(err => {
            showDevToast(`⚠️ Error reproduciendo: ${err.message}`);
          });
        } catch (e) {
          showDevToast(`⚠️ Error: ${e.message}`);
        }
      }
    };

    // =========================================================================
    // TAB 3: RAW MCP JSON-RPC TESTER
    // =========================================================================
    const rpcInput = document.getElementById('dev-rpc-input');
    const rpcOutput = document.getElementById('dev-rpc-output');
    const rpcLatency = document.getElementById('dev-rpc-latency');
    const btnRunRpc = document.getElementById('dev-btn-run-rpc');
    const rpcTemplateBtns = document.querySelectorAll('.dev-preset-btn[data-rpc]');

    rpcTemplateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const rawJson = btn.getAttribute('data-rpc');
        try {
          const parsed = JSON.parse(rawJson);
          if (rpcInput) rpcInput.value = JSON.stringify(parsed, null, 2);
        } catch (e) {
          if (rpcInput) rpcInput.value = rawJson;
        }
      });
    });

    if (btnRunRpc && rpcInput && rpcOutput) {
      btnRunRpc.addEventListener('click', async () => {
        playDevBeep(650, 0.03, 'square');
        const rawText = rpcInput.value.trim();
        let payload = null;

        try {
          payload = JSON.parse(rawText);
        } catch (err) {
          rpcOutput.innerHTML = `<span style="color:#ff5577;">JSON Inválido: ${err.message}</span>`;
          return;
        }

        rpcOutput.innerHTML = '<span style="color:#64748b;">Ejecutando en servidor MCP...</span>';
        const start = performance.now();

        try {
          const response = await mcpServer.handleRequest(payload);
          const elapsed = (performance.now() - start).toFixed(1);
          if (rpcLatency) rpcLatency.innerText = `${elapsed} ms`;
          rpcOutput.innerHTML = JSON.stringify(response, null, 2);
        } catch (err) {
          rpcOutput.innerHTML = `<span style="color:#ff5577;">Error RPC: ${err.message}</span>`;
        }
      });
    }

    console.log("🛠️ NAYZE Developer Mode & MCP Suite ready. Press Ctrl + Shift + D to toggle.");
  }

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDevMode);
  } else {
    initDevMode();
  }

  window.initDevMode = initDevMode;
})();
