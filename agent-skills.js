/**
 * ============================================================================
 * NAYZE STUDIO - MODULAR AGENT SKILLS ARCHITECTURE
 * ============================================================================
 * Defines specialized modular skills for the AI assistant in NAYZE's Studio:
 * 1. content-strategist: Viral hooks, social copies, Spotify playlist pitch.
 * 2. mcp-resource-reader: Reads and formats MCP resources (content://nayze/tracks,
 *    content://marketing/campaign-status, live game progress).
 * Plus an Autonomous Agent Orchestrator with streaming response generation.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./mcp-server.js'));
  } else {
    const mcp = {
      localMcpClient: root.localMcpClient,
      localMcpServer: root.localMcpServer
    };
    const exports = factory(mcp);
    root.BaseAgentSkill = exports.BaseAgentSkill;
    root.ContentStrategistSkill = exports.ContentStrategistSkill;
    root.McpResourceReaderSkill = exports.McpResourceReaderSkill;
    root.SkillRegistry = exports.SkillRegistry;
    root.NayzeAIAgent = exports.NayzeAIAgent;
    root.agentInstance = exports.agentInstance;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (mcpModule) {
  const mcpClient = mcpModule.localMcpClient;

  // --- BASE AGENT SKILL CLASS ---
  class BaseAgentSkill {
    constructor(config) {
      this.id = config.id;
      this.name = config.name;
      this.icon = config.icon || "⚙️";
      this.badge = config.badge || "SKILL";
      this.description = config.description;
      this.systemPrompt = config.systemPrompt;
      this.capabilities = config.capabilities || [];
      this.exampleQueries = config.exampleQueries || [];
    }

    /**
     * Executes the skill. Can yield or stream chunks through onChunk callback.
     * @param {string} prompt User message or prompt
     * @param {Object} context Execution context (history, client, session)
     * @param {Function} onChunk Callback for real-time text streaming
     * @returns {Promise<Object>} Output response
     */
    async execute(prompt, context, onChunk) {
      throw new Error(`Execute not implemented for skill: ${this.id}`);
    }
  }

  // ============================================================================
  // SKILL 1: content-strategist
  // ============================================================================
  class ContentStrategistSkill extends BaseAgentSkill {
    constructor() {
      super({
        id: "content-strategist",
        name: "Content Strategist & Viral Copywriter",
        icon: "✍️",
        badge: "MARKETING & STREAMING",
        description: "Especialista en redactar ganchos virales (TikTok/Reels), copys publicitarios de alto impacto, pitches para curadores de Spotify y estrategias de lanzamiento musical para 'Vuelve Bebé'.",
        systemPrompt: `Eres el Estratega de Contenido Oficial de NAYZE. Tu misión es maximizar los pre-saves, el engagement y el streaming orgánico combinando la estética retro 8-bit/cyberpunk con formatos virales de alta conversión en TikTok, Instagram, YouTube y Spotify. Utilizas llamadas a la acción claras, ganchos emocionales o de misterio, y referencias al universo arcade del juego.`,
        capabilities: [
          "Ganchos virales (Hooks) de 3 segundos para TikTok y Reels con marcas de tiempo de audio exactas.",
          "Copys persuasivos para pre-save en Spotify y Apple Music.",
          "Pitch editorial profesional para curadores de Spotify for Artists (máx 500 caracteres).",
          "Calendario de lanzamiento de 5 días con llamadas a la acción (CTAs).",
          "Conceptos para trends (#VuelveBebeChallenge) y micro-videos arcade."
        ],
        exampleQueries: [
          "Escribe 3 ganchos virales para TikTok con el Drop de 'Vuelve Bebé'",
          "Redacta el Pitch editorial para enviar a los curadores de Spotify",
          "Dame una estrategia de copy para cerrar los últimos 6,500 pre-saves",
          "Crea un guion para un Reel de 15 segundos con el Track 03 (Vocal Hook)"
        ]
      });
    }

    async execute(prompt, context, onChunk) {
      const emit = (text) => { if (typeof onChunk === 'function') onChunk(text); };
      const q = prompt.toLowerCase();

      // Read current campaign status from MCP to ground the copywriting in real data
      emit(`⚡ _[Skill: content-strategist]_ Consultando métricas de campaña en Servidor MCP...\n\n`);
      
      let campaignData = null;
      let tracksData = null;
      try {
        const campaignJson = await context.mcpClient.readResource("content://marketing/campaign-status");
        campaignData = JSON.parse(campaignJson);
        const tracksJson = await context.mcpClient.readResource("content://nayze/tracks");
        tracksData = JSON.parse(tracksJson);
      } catch (e) {
        console.warn("Could not load MCP context directly in skill:", e);
      }

      const presaves = campaignData ? campaignData.presave_metrics.current_presaves.toLocaleString() : "18,420";
      const goal = campaignData ? campaignData.presave_metrics.target_presaves.toLocaleString() : "25,000";
      const percent = campaignData ? campaignData.presave_metrics.completion_percentage : "73.6%";

      let responseMarkdown = "";

      // 1. Spotify Editorial Pitch Query
      if (q.includes("pitch") || q.includes("curador") || q.includes("editorial") || q.includes("spotify for artists")) {
        responseMarkdown = `### 🎯 Pitch Editorial Oficial para Spotify for Artists

> **Track:** *Vuelve Bebé* | **Artista:** NAYZE | **BPM:** 128 | **Tonalidad:** Fa Menor (F minor)  
> **Género Primario:** Latin Synth-Pop / Cyberpunk Dembow | **Mood:** Nostálgico, Bailable, Enérgico

---

#### 📝 Texto de Pitch Recomendado (Listo para Copiar):
\`\`\`text
"Vuelve Bebé" es el nuevo sencillo del productor y cantante NAYZE. Producido a 128 BPM en Fa menor, fusiona sintetizadores analógicos vintage y arpegios retro de consolas de 8 bits con un potente drop contemporáneo y un coro urbano inolvidable. 

Acompañado de una innovadora experiencia web arcade interactiva donde la comunidad desbloquea los stems musicales jugando, el tema cuenta con más de ${presaves} pre-saves orgánicos verificados. Ideal para playlists que celebran la vanguardia del pop latino y la cultura gaming.
\`\`\`

#### 🎧 Playlists Objetivo Recomendadas:
* **Fresh Finds Latin** (Ideal por el perfil emergente de alta producción)
* **Cyberpunk Synth / Retrowave** (Por la textura de sintetizadores Roland y arpegios chiptune)
* **Pop Urbano 2026** (Por el hook vocal y la cadencia rítmica)
* **Gamer Beats & Arcade Vibes** (Por la integración directa con el minijuego 8-bit)

💡 **Consejo del Estratega:** Menciona en el formulario que el **Track 3 (Vocal Hook)** comienza con fuerza a los 0:30, lo cual asegura retención del 100% en los primeros 30 segundos evaluados por el algoritmo de Spotify.`;
      } 
      // 2. TikTok / Reels Viral Hooks Query
      else if (q.includes("gancho") || q.includes("hook") || q.includes("tiktok") || q.includes("reel") || q.includes("short")) {
        responseMarkdown = `### 🚀 3 Ganchos Virales (Hooks) & Copys para TikTok / Instagram Reels

Basados en los stems de audio de **"Vuelve Bebé"** y la meta actual de **${presaves} / ${goal} Pre-Saves (${percent})**.

---

#### 🪝 Opción 1: Enfoque "Misterio / Viaje en el Tiempo" (Audio: Track 01 Intro)
* **Marca de Tiempo de Audio:** 0:00 - 0:12 (Arpegio 8-Bit nostálgico)
* **Texto en Pantalla (Hook 0-3s):**  
  > *"POV: Encontraste este cassette en un estudio abandonado de 1989..."*
* **Desarrollo Visual:** Muestra la pantalla del juego arcade en CRT o el avatar de NAYZE en el estudio.
* **Copy para el Post:**  
  \`\`\`text
  ¿Soy solo yo o este sonido te desbloquea una vida que nunca viviste? 🕹️✨ 'Vuelve Bebé' sale en 5 días pero los 4 stems secretos ya están escondidos en nuestro juego retro interactivo (link en bio). #VuelveBebe #Nayze8Bit #SynthwaveLatino
  \`\`\`
* **CTA:** *"¡Juega y salva el cassette antes de que se agoten los pre-saves!"*

---

#### 🪝 Opción 2: Enfoque "Bass Drop / Transición" (Audio: Track 02 Bass Drop)
* **Marca de Tiempo de Audio:** 0:15 - 0:28 (Drop de bajo Moog saturado)
* **Texto en Pantalla (Hook 0-3s):**  
  > *"Espera a que el bajo golpee a los 0:18... 🎧💥"*
* **Desarrollo Visual:** Transición rápida de ropa casual a outfit cyberpunk neon justo cuando revienta el beat a 128 BPM.
* **Copy para el Post:**  
  \`\`\`text
  El bajo de 'Vuelve Bebé' no tiene sentido en audífonos de buena calidad. Ya somos más de ${presaves} en la lista de espera oficial de Spotify. Guarda el audio antes de que se haga trend. 🔥 #VuelveBebeDrop #CyberPop #NAYZE
  \`\`\`
* **CTA:** *"Guarda este audio en favoritos y úsalo para tu próximo outfit reveal."*

---

#### 🪝 Opción 3: Enfoque "Desamor en 8-Bits / Coro Viral" (Audio: Track 03 Vocal Hook)
* **Marca de Tiempo de Audio:** 0:30 - 0:45 (Voz principal de NAYZE + Vocoder)
* **Texto en Pantalla (Hook 0-3s):**  
  > *"Dedícaselo a esa persona que todavía no vuelve... 💔👾"*
* **Letra destacada:** *"¿Dónde estás mi amor? Vuelve bebé... La ciudad se apaga si no estás tú..."*
* **Copy para el Post:**  
  \`\`\`text
  Para los que extrañan a alguien en silencio mientras fingen que todo está bien. 'Vuelve Bebé' ya tiene pre-save activo con botón directo en mi perfil. Si llegamos a 25k desbloqueamos el video musical 8-bit. #VuelveBebeChallenge #MusicaParaLlorarBailando
  \`\`\`
* **CTA:** *"Dale Pre-Save en Spotify/Apple Music y desbloquea el Disco 3 en el estudio."*`;
      }
      // 3. Campaign & Pre-Save Strategy
      else {
        responseMarkdown = `### 📊 Plan de Conversión de Pre-Saves (Sprint Final de 5 Días)

Actualmente la campaña de **"Vuelve Bebé"** cuenta con **${presaves} Pre-Saves de ${goal} (${percent})**, restando **6,580 conversiones** para asegurar el empuje del algoritmo de Spotify.

---

#### 🗓️ Calendario de Acciones Diarias:

| Día | Plataforma | Acción Estratégica | Audio / Recurso |
| :--- | :--- | :--- | :--- |
| **Día -4** | TikTok / Reels | Lanzar el filtro/trend \`#VuelveBebeChallenge\` retando a creadores a superar la Oleada 2. | **Track 02 (Drop)** |
| **Día -3** | Instagram / X | Publicar la infografía de "Discos Desbloqueados en el Estudio" agradeciendo a los 18k jugadores. | **Track 01 (Intro)** |
| **Día -2** | Spotify / Correo | Enviar el correo exclusivo a fans con enlace directo al Pre-Save y pista oculta. | **Track 03 (Vocal)** |
| **Día -1** | YouTube / Twitch | Stream en vivo en el estudio de NAYZE jugando el arcade y revelando el Track 04 completo. | **Track 04 (Full Master)** |
| **Día 0 (Drop)** | Todas | Medianoche: Activación global de enlaces inteligentes y video oficial. | **Single Completo** |

---

#### 💬 Copy Universal de Conversión Rápida (Para Bio / Redes):
\`\`\`text
🕹️ ¿Ya desbloqueaste los 4 discos de 'Vuelve Bebé'? Entra al estudio virtual de NAYZE, juega el minijuego arcade y haz Pre-Save oficial para escuchar el tema antes que nadie: https://api.nayzemusic.com/v1/presave
\`\`\`

> 💡 **Tip Clave:** El minijuego web está convirtiendo al **42.8%** de los jugadores. Redirigir el tráfico hacia el juego interactivo genera 3x más pre-saves que un enlace estático tradicional.`;
      }

      // ======================================================================
      // REAL LLM CALL: Hugging Face Inference API (if key is configured)
      // ======================================================================
      const hfKey = typeof window !== 'undefined' && window.__nayzeHFKey;
      if (hfKey) {
        try {
          const llmPrompt = `Eres el Estratega de Contenido Oficial de NAYZE. Contexto de campaña: ${presaves} pre-saves de ${goal} (${percent}). Pregunta: ${prompt}`;
          const hfResponse = await fetch(
            'https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${hfKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'mistralai/Mistral-7B-Instruct-v0.3',
                messages: [{ role: 'user', content: llmPrompt }],
                max_tokens: 500,
                stream: false
              })
            }
          );
          if (hfResponse.ok) {
            const hfData = await hfResponse.json();
            const llmText = hfData.choices && hfData.choices[0] && hfData.choices[0].message && hfData.choices[0].message.content;
            if (llmText) {
              responseMarkdown = `### 🤖 Respuesta LLM (Hugging Face · Mistral-7B)\n\n${llmText}\n\n---\n*Generado por Mistral-7B-Instruct-v0.3 vía Hugging Face Inference API*`;
            }
          } else {
            const errText = await hfResponse.text().catch(() => '');
            responseMarkdown += `\n\n> ⚠️ **HF API:** ${hfResponse.status} ${hfResponse.statusText}${errText ? ' — ' + errText.slice(0, 100) : ''}`;
          }
        } catch (hfErr) {
          responseMarkdown += `\n\n> ⚠️ **HF API Error:** ${hfErr.message}`;
        }
      }

      // Stream response in smooth simulated chunks for realistic AI delivery
      const lines = responseMarkdown.split("\n");
      for (const line of lines) {
        emit(line + "\n");
        await new Promise(r => setTimeout(r, 22));
      }

      return {
        skillId: this.id,
        output: responseMarkdown
      };
    }
  }

  // ============================================================================
  // SKILL 2: mcp-resource-reader
  // ============================================================================
  class McpResourceReaderSkill extends BaseAgentSkill {
    constructor() {
      super({
        id: "mcp-resource-reader",
        name: "MCP Resource & Data Reader",
        icon: "📊",
        badge: "PROTOCOL READER",
        description: "Lector y formateador especializado en el Model Context Protocol (MCP). Consulta recursos (content://nayze/tracks, content://marketing/campaign-status), ejecuta tools de consulta y extrae fichas técnicas de audio y estado del juego en tiempo real.",
        systemPrompt: `Eres el Intérprete Técnico de Recursos MCP de NAYZE. Tu especialidad es consultar el servidor local MCP, leer URIs del protocolo 'content://', ejecutar herramientas de consulta musical y formatear los datos crudos en resúmenes legibles, fichas técnicas y tablas claras para el usuario y otros agentes.`,
        capabilities: [
          "Lectura directa de 'content://nayze/tracks' (BPM, tonalidad, stems de audio, requisitos de desbloqueo).",
          "Lectura directa de 'content://marketing/campaign-status' (Pre-saves, desglose Spotify/Apple, porcentaje de meta).",
          "Sincronización en vivo con el minijuego arcade ('content://nayze/live-game-progress').",
          "Inspección de herramientas (tools) del servidor MCP y ejecución bajo demanda.",
          "Generación de reportes de compatibilidad de audio y estado de stems."
        ],
        exampleQueries: [
          "Lee el recurso content://nayze/tracks y dame la ficha técnica",
          "¿Cómo va la campaña de pre-saves según content://marketing/campaign-status?",
          "Consulta qué discos del iPod tengo desbloqueados ahora mismo",
          "Muéstrame los detalles técnicos del Track 3 (Vocal Hook)"
        ]
      });
    }

    async execute(prompt, context, onChunk) {
      const emit = (text) => { if (typeof onChunk === 'function') onChunk(text); };
      const q = prompt.toLowerCase();

      emit(`🔍 _[Skill: mcp-resource-reader]_ Procesando consulta vía Model Context Protocol...\n\n`);

      // Determine which resource or tool to invoke based on prompt
      let responseMarkdown = "";

      // 1. In-game live unlock status
      if (q.includes("desbloque") || q.includes("disco") || q.includes("juego") || q.includes("oleada") || q.includes("ipod")) {
        emit(`⚡ _[MCP Tool: check_unlock_status]_ Leyendo sesión de juego activa...\n\n`);
        const result = await context.mcpClient.callTool("check_unlock_status", {});
        const data = JSON.parse(result.content[0].text);

        responseMarkdown = `### 🎧 Estado de Desbloqueo en Vivo (iPod Studio & Minijuego)

> **Protocolo:** \`content://nayze/live-game-progress\`  
> **Resumen:** **${data.session_summary}** (Oleada actual: ${data.round_number})

---

| Disco | Título de Pista | Estado en el Estudio | Cómo Desbloquear |
| :---: | :--- | :--- | :--- |
| **01** | TRACK 01: INTRO SYNTH | ${data.discs[0].playable ? "🟢 DISPONIBLE (Reproducible)" : "🔒 BLOQUEADO"} | Derrotar al primer enemigo X-36 |
| **02** | TRACK 02: BASS DROP | ${data.discs[1].playable ? "🟢 DISPONIBLE (Reproducible)" : "🔒 BLOQUEADO"} | Superar la Oleada 2 del arcade |
| **03** | TRACK 03: VOCAL HOOK | ${data.discs[2].playable ? "🟢 DISPONIBLE (Reproducible)" : "🔒 BLOQUEADO"} | Superar la Oleada 3 del arcade |
| **04** | TRACK 04: FULL MASTER | ${data.discs[3].playable ? "🟢 DISPONIBLE (Reproducible)" : "🔒 BLOQUEADO"} | Superar la Oleada 4 y vencer al jefe |

---

🎯 **Próximo Objetivo:**  
${data.next_objective}

💡 *Puedes reproducir cualquier disco desbloqueado directamente pulsando sobre la estación iPod a la derecha del estudio.*`;
      }
      // 2. Tracks technical catalog (content://nayze/tracks)
      else if (q.includes("track") || q.includes("cancion") || q.includes("pista") || q.includes("stem") || q.includes("bpm") || q.includes("tonalidad") || q.includes("audio")) {
        emit(`⚡ _[MCP Resource: read(content://nayze/tracks)]_ Obteniendo especificaciones maestras de audio...\n\n`);
        const jsonStr = await context.mcpClient.readResource("content://nayze/tracks");
        const db = JSON.parse(jsonStr);

        responseMarkdown = `### 🎵 Ficha Técnica del Lanzamiento: "${db.release_title}" de ${db.artist}

* **URI del Recurso:** \`content://nayze/tracks\`
* **Sello / Producción:** ${db.label}
* **Fecha de Estreno:** ${db.release_date}
* **BPM Maestro:** \`${db.master_bpm} BPM\` | **Tonalidad:** \`${db.master_key}\`
* **Género:** ${db.genre}
* **ISRC:** \`${db.single_isrc}\`

---

#### 🎛️ Desglose de Pistas & Stems (4 Tracks en Suite):

${db.tracks.map(t => `
##### 💿 Disco ${t.id}: ${t.title}
* **Tipo de Stem:** \`${t.stem_type}\` (${t.duration_seconds}s)
* **Archivo de Audio:** \`${t.file_path}\`
* **Vibra / Mood:** ${t.mood}
* **Instrumentos Clave:** ${t.instruments.join(", ")}
* **Uso Recomendado en Redes:** ${t.recommended_social_use.platform} (${t.recommended_social_use.timestamp_start} a ${t.recommended_social_use.timestamp_end}) - *${t.recommended_social_use.best_for}*
${t.lyrics ? `* **Letra Principal:** _"${t.lyrics}"_` : ""}
`).join("\n---")}

> 💡 **Nota del Lector MCP:** Todos los archivos están renderizados a 44.1 kHz / 16-bit PCM en formato \`.wav\` para fidelidad de estudio chiptune.`;
      }
      // 3. Marketing Campaign Status (content://marketing/campaign-status)
      else {
        emit(`⚡ _[MCP Resource: read(content://marketing/campaign-status)]_ Extrayendo estado de campaña...\n\n`);
        const jsonStr = await context.mcpClient.readResource("content://marketing/campaign-status");
        const mkt = JSON.parse(jsonStr);
        const m = mkt.presave_metrics;

        responseMarkdown = `### 📈 Reporte de Campaña en Tiempo Real

* **URI del Recurso:** \`content://marketing/campaign-status\`
* **ID de Campaña:** \`${mkt.campaign_id}\`
* **Estado:** **${mkt.status}** (${mkt.days_to_launch} días para el lanzamiento)
* **Fecha de Lanzamiento:** \`${mkt.launch_date}\`

---

#### 📊 Estado de Pre-Saves:
* **Progreso Actual:** **${m.current_presaves.toLocaleString()}** de **${m.target_presaves.toLocaleString()}** pre-saves (**${m.completion_percentage}%**)
* **Faltantes para la Meta:** **${m.remaining_presaves.toLocaleString()}** pre-saves
* **Ritmo Diario Promedio:** \`+${m.daily_velocity_average} pre-saves/día\`
* **Proyección Día 1:** **~${m.projected_day_one_presaves.toLocaleString()} pre-saves**
* **Tasa de Conversión Arcade:** \`${m.conversion_rate_from_arcade_game}\`

---

#### 🌐 Desglose por Plataforma:

| Plataforma | Pre-Saves | Cuota | Estado Editorial |
| :--- | :---: | :---: | :--- |
${mkt.platform_breakdown.map(p => `| **${p.platform}** | ${p.presaves.toLocaleString()} | ${p.percentage}% | ${p.editorial_pitch_status} |`).join("\n")}

---

#### 🏷️ Hashtags Oficiales:
${mkt.official_hashtags.map(h => `\`${h}\``).join(" ")}

> 🚀 **Conclusión MCP:** La campaña tiene una salud excelente con 73.6% alcanzado. El canal de mayor tracción es **Spotify (54%)**, seguido de **Apple Music (28%)**.`;
      }

      // Stream response in simulated chunks
      const lines = responseMarkdown.split("\n");
      for (const line of lines) {
        emit(line + "\n");
        await new Promise(r => setTimeout(r, 20));
      }

      return {
        skillId: this.id,
        output: responseMarkdown
      };
    }
  }

  // ============================================================================
  // SKILL REGISTRY
  // ============================================================================
  class SkillRegistry {
    constructor() {
      this.skills = new Map();
      this.register(new ContentStrategistSkill());
      this.register(new McpResourceReaderSkill());
    }

    register(skill) {
      this.skills.set(skill.id, skill);
    }

    get(skillId) {
      return this.skills.get(skillId);
    }

    list() {
      return Array.from(this.skills.values());
    }
  }

  // ============================================================================
  // NAYZE AI AGENT - MULTI-SKILL ORCHESTRATOR
  // ============================================================================
  class NayzeAIAgent {
    constructor(client, registry) {
      this.mcpClient = client || mcpClient;
      this.registry = registry || new SkillRegistry();
      this.conversationHistory = [];
      this.activeSkillId = "auto"; // "auto", "content-strategist", or "mcp-resource-reader"
    }

    setActiveSkill(skillId) {
      this.activeSkillId = skillId;
    }

    getActiveSkill() {
      return this.activeSkillId;
    }

    /**
     * Autonomous Skill Router: classifies user intent to route to the appropriate skill
     */
    classifySkill(prompt) {
      const p = prompt.toLowerCase();
      // Content Strategist triggers
      const strategistKeywords = [
        "gancho", "hook", "copy", "viral", "tiktok", "reel", "short", "pitch",
        "redact", "escribe", "instagram", "post", "texto", "estrategia", "hashtag",
        "campaña", "promocion", "lanzamiento", "guion"
      ];
      // MCP Resource Reader triggers
      const readerKeywords = [
        "mcp", "recurso", "resource", "content://", "leer", "lee", "status",
        "estado", "disco", "track", "pista", "desbloqueado", "desbloquear",
        "metrica", "kpi", "bpm", "tonalidad", "audio", "ipod", "wav", "stems"
      ];

      let strategistScore = 0;
      let readerScore = 0;

      for (const kw of strategistKeywords) {
        if (p.includes(kw)) strategistScore += 1;
      }
      for (const kw of readerKeywords) {
        if (p.includes(kw)) readerScore += 1;
      }

      if (strategistScore > readerScore) {
        return "content-strategist";
      } else if (readerScore > strategistScore) {
        return "mcp-resource-reader";
      } else {
        // Tie-breaker: default to content-strategist for creative queries, resource reader for data
        return p.includes("?") ? "mcp-resource-reader" : "content-strategist";
      }
    }

    /**
     * Executes a chat turn with full streaming support.
     * @param {string} userPrompt User's message
     * @param {Object} options { skillId, onChunk, onToolEvent }
     */
    async chat(userPrompt, options = {}) {
      const onChunk = options.onChunk || (() => {});
      const onToolEvent = options.onToolEvent || (() => {});

      let targetSkillId = options.skillId || this.activeSkillId;
      if (targetSkillId === "auto") {
        targetSkillId = this.classifySkill(userPrompt);
      }

      const skill = this.registry.get(targetSkillId);
      if (!skill) {
        throw new Error(`Skill desconocida: ${targetSkillId}`);
      }

      onToolEvent({
        type: "skill_selected",
        skillId: skill.id,
        skillName: skill.name,
        icon: skill.icon
      });

      const context = {
        mcpClient: this.mcpClient,
        history: this.conversationHistory,
        timestamp: new Date().toISOString()
      };

      this.conversationHistory.push({
        role: "user",
        content: userPrompt,
        timestamp: Date.now()
      });

      const result = await skill.execute(userPrompt, context, onChunk);

      this.conversationHistory.push({
        role: "assistant",
        skillUsed: skill.id,
        content: result.output,
        timestamp: Date.now()
      });

      return result;
    }
  }

  const agentInstance = new NayzeAIAgent(mcpClient, new SkillRegistry());

  return {
    BaseAgentSkill,
    ContentStrategistSkill,
    McpResourceReaderSkill,
    SkillRegistry,
    NayzeAIAgent,
    agentInstance
  };
});

