/**
 * ============================================================================
 * NAYZE STUDIO - LOCAL MODEL CONTEXT PROTOCOL (MCP) SERVER
 * ============================================================================
 * Standard-compliant Model Context Protocol implementation for NAYZE.
 * Exposes resources (content://nayze/tracks, content://marketing/campaign-status)
 * and tools for AI agents to query music releases, stems, and marketing KPIs.
 * 
 * Spec: Model Context Protocol (MCP) JSON-RPC 2.0
 * ============================================================================
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.NayzeMCPServer = exports.NayzeMCPServer;
    root.LocalMCPClient = exports.LocalMCPClient;
    root.localMcpServer = exports.localMcpServer;
    root.localMcpClient = exports.localMcpClient;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  // --- RAW DATABASE & RESOURCE FIXTURES ---
  const NAYZE_TRACKS_DATABASE = {
    release_title: "Vuelve Bebé",
    artist: "NAYZE",
    label: "NAYZE Studios Independent / RetroFuture Records",
    release_date: "2026-11-22",
    master_bpm: 128,
    master_key: "F minor (Fa menor)",
    genre: "Retro Cyber-Pop / 8-Bit Synthwave / Urban Dembow",
    single_isrc: "QZ-NYZ-26-00101",
    total_tracks: 4,
    tracks: [
      {
        id: 1,
        title: "Vuelve Bebé - Synthwave Intro / Arp 8-Bit",
        short_title: "TRACK 01: INTRO SYNTH",
        stem_type: "Melodic Intro / Arpeggiator",
        file_path: "AUDIO/disc_track_1.wav",
        disc_image: "DISK/disc_track_1.png",
        duration_seconds: 32,
        bpm: 128,
        key: "F minor",
        energy_level: 68,
        mood: "Nostálgico, misterioso, atmósfera cinematográfica retro",
        instruments: ["Roland Juno-106 Synth", "Chiptune Arp 2A03", "Analog Reverb Pad"],
        hook_text: "Las luces parpadean en la habitación vacía...",
        recommended_social_use: {
          platform: "TikTok / Reels",
          timestamp_start: "0:00",
          timestamp_end: "0:15",
          best_for: "Videos estéticos Y2K, 'POV: Estás en 1989 pero con internet del 2026', transiciones melancólicas."
        },
        unlock_requirement: "Derrotar al primer guardia Glitch X-36 (Oleada 1)."
      },
      {
        id: 2,
        title: "Vuelve Bebé - Cyber Bass Drop & Beat Urbano",
        short_title: "TRACK 02: BASS DROP",
        stem_type: "Rhythm & Bass Drop",
        file_path: "AUDIO/disc_track_2.wav",
        disc_image: "DISK/disc_track_2.png",
        duration_seconds: 36,
        bpm: 128,
        key: "F minor",
        energy_level: 92,
        mood: "Energético, agresivo, club nocturno cyberpunk",
        instruments: ["Moog Sub 37 Bassline", "808 Kick saturado", "Snare 8-Bit Lo-Fi", "Hi-Hats rodantes"],
        hook_text: "Siente el golpe del bajo en el pecho...",
        recommended_social_use: {
          platform: "TikTok / YouTube Shorts",
          timestamp_start: "0:15",
          timestamp_end: "0:30",
          best_for: "Drops de alto impacto, bailes con drops rápidos, reveals de outfits o videojuegos arcade."
        },
        unlock_requirement: "Superar la Oleada 2 del minijuego arcade."
      },
      {
        id: 3,
        title: "Vuelve Bebé - Lead Vocals & Coro Pegajoso",
        short_title: "TRACK 03: VOCAL HOOK",
        stem_type: "Lead Vocals & Main Chorus",
        file_path: "AUDIO/disc_track_3.wav",
        disc_image: "DISK/disc_track_3.png",
        duration_seconds: 40,
        bpm: 128,
        key: "F minor",
        energy_level: 88,
        mood: "Romántico, eufórico, pegadizo al instante",
        instruments: ["Voz Principal NAYZE", "Vocoder TC-Helicon Vintage", "Armonías en capas", "Pluck Synth"],
        lyrics: "¿Dónde estás mi amor? Vuelve bebé... La ciudad se apaga si no estás tú, sigo atrapado en este loop de 8 bits buscando tu luz.",
        hook_text: "¿Dónde estás mi amor? Vuelve bebé...",
        recommended_social_use: {
          platform: "TikTok / Instagram Reels / Spotify Canvas",
          timestamp_start: "0:30",
          timestamp_end: "0:48",
          best_for: "Trends de lip-sync, dedicatorias sentimentales, videos virales de parejas o desamor con estética arcade."
        },
        unlock_requirement: "Vencer al jefe de la Oleada 3."
      },
      {
        id: 4,
        title: "Vuelve Bebé - Master Extended & Outro Arcade",
        short_title: "TRACK 04: FULL MASTER",
        stem_type: "Full Mix / Arcade Climax",
        file_path: "AUDIO/disc_track_4.wav",
        disc_image: "DISK/disc_track_4.png",
        duration_seconds: 45,
        bpm: 128,
        key: "F minor",
        energy_level: 98,
        mood: "Clímax triunfal, victoria arcade, himno dance retro",
        instruments: ["Full Stems", "Solo Chiptune GameBoy", "Crash Cymbal Retro", "Vocals + Bass + Arps"],
        hook_text: "¡El loop se rompe, la música queda para siempre!",
        recommended_social_use: {
          platform: "YouTube / Twitch / TikTok",
          timestamp_start: "0:45",
          timestamp_end: "1:15",
          best_for: "Trailers de lanzamiento, momentos de victoria en streams, compilaciones de gaming épico."
        },
        unlock_requirement: "Derrotar a la oleada final y desbloquear el iPod completo."
      }
    ]
  };

  const MARKETING_CAMPAIGN_DATABASE = {
    campaign_id: "CAMP-NAYZE-VB-2026",
    campaign_name: "Lanzamiento Oficial 'Vuelve Bebé' - Estrategia 8-Bit Pre-Save",
    status: "EN CURSO (Fase 2 de 4)",
    days_to_launch: 5,
    launch_date: "2026-11-22T00:00:00Z",
    presave_metrics: {
      target_presaves: 25000,
      current_presaves: 18420,
      completion_percentage: 73.68,
      remaining_presaves: 6580,
      daily_velocity_average: 740,
      projected_day_one_presaves: 26800,
      conversion_rate_from_arcade_game: "42.8% (Jugadores que completan oleadas y hacen click en Pre-Save)"
    },
    platform_breakdown: [
      {
        platform: "Spotify",
        presaves: 9946,
        percentage: 54.0,
        editorial_pitch_status: "Borrador preparado para envío a Spotify for Artists",
        target_playlists: ["Fresh Finds Latin", "Cyberpunk Synth", "Pop Urbano 2026", "Gamer Beats"]
      },
      {
        platform: "Apple Music",
        presaves: 5157,
        percentage: 28.0,
        editorial_pitch_status: "Pendiente confirmación de banner regional",
        target_playlists: ["Vibras del Momento", "Retro Pop", "Chiptune Moderno"]
      },
      {
        platform: "YouTube Music",
        presaves: 1842,
        percentage: 10.0,
        editorial_pitch_status: "Teaser video publicado (125k reproducciones)",
        target_playlists: ["Tendencias Pop Español", "Musica Gamer"]
      },
      {
        platform: "TikTok Audio Bookmarks",
        presaves: 1475,
        percentage: 8.0,
        editorial_pitch_status: "Sonido oficial subido como audio original",
        target_playlists: ["Sonidos Virales México / España / Argentina"]
      }
    ],
    official_hashtags: [
      "#VuelveBebe",
      "#NAYZE",
      "#Nayze8Bit",
      "#VuelveBebeChallenge",
      "#RetroCyberPop",
      "#SynthwaveLatino"
    ],
    campaign_phases: [
      { phase: 1, name: "Teaser Visual Pixel Art & Lore", status: "COMPLETADA", reach: "180K visualizaciones orgánicas" },
      { phase: 2, name: "Experiencia Arcade & Desbloqueo de Discos iPod", status: "ACTIVA", engagement: "Alto (+4,200 partidas jugadas)" },
      { phase: 3, name: "Drop Oficial Medianoche & Curaduría Editorial", status: "PROGRAMADA", target_streams_24h: 75000 },
      { phase: 4, name: "Challenge de Baile en TikTok & Tour Virtual", status: "EN PREPARACIÓN", creator_partners: 12 }
    ],
    smart_links: {
      spotify: "https://open.spotify.com/artist/NAYZE_ID",
      apple_music: "https://music.apple.com/artist/NAYZE_ID",
      youtube: "https://www.youtube.com/@NAYZE",
      tiktok: "https://www.tiktok.com/@NAYZE"
    }
  };

  /**
   * Reads the current live game progression from browser localStorage or globals.
   */
  function getLiveGameSessionState() {
    let unlocked = 0;
    let round = 1;
    let kills = 0;

    if (typeof window !== 'undefined') {
      try {
        const storedDiscs = localStorage.getItem('nayze_unlocked_discs');
        if (storedDiscs !== null) unlocked = parseInt(storedDiscs, 10) || 0;
        const storedRound = localStorage.getItem('nayze_current_round');
        if (storedRound !== null) round = parseInt(storedRound, 10) || 1;
      } catch (e) {
        // Fallback to in-memory variables if available
        if (typeof window.unlockedDiscs === 'number') unlocked = window.unlockedDiscs;
        if (typeof window.currentRound === 'number') round = window.currentRound;
      }
    }

    return {
      unlocked_discs_count: unlocked,
      total_discs: 4,
      current_game_round: round,
      all_unlocked: unlocked >= 4,
      tracks_status: [1, 2, 3, 4].map(id => ({
        track_id: id,
        title: NAYZE_TRACKS_DATABASE.tracks[id - 1].short_title,
        status: id <= unlocked ? "DESBLOQUEADO (REPRODUCIBLE)" : "BLOQUEADO (GANA EN EL ARCADE)",
        playable: id <= unlocked
      }))
    };
  }

  // --- MCP SERVER CLASS DEFINITION ---
  class NayzeMCPServer {
    constructor() {
      this.serverInfo = {
        name: "nayze-mcp-server",
        title: "NAYZE Studio Local MCP Server",
        version: "1.0.0",
        protocolVersion: "2024-11-05",
        capabilities: {
          resources: {
            subscribe: false,
            listChanged: true
          },
          tools: {
            listChanged: true
          },
          prompts: {
            listChanged: false
          }
        }
      };

      this.listeners = new Map();
      this.resourceMap = new Map();
      this.toolMap = new Map();
      this.promptMap = new Map();

      this._registerBuiltinResources();
      this._registerBuiltinTools();
      this._registerBuiltinPrompts();
    }

    // --- RESOURCE REGISTRATION ---
    _registerBuiltinResources() {
      // 1. content://nayze/tracks
      this.registerResource({
        uri: "content://nayze/tracks",
        name: "NAYZE Tracks Catalog & Stems",
        description: "Catálogo completo de pistas, stems, BPM, tonalidades y metadatos de audio del lanzamiento 'Vuelve Bebé' de NAYZE.",
        mimeType: "application/json",
        read: async () => {
          const liveState = getLiveGameSessionState();
          const enriched = {
            ...NAYZE_TRACKS_DATABASE,
            live_session_unlocks: liveState,
            _retrieved_at: new Date().toISOString()
          };
          return JSON.stringify(enriched, null, 2);
        }
      });

      // 2. content://marketing/campaign-status
      this.registerResource({
        uri: "content://marketing/campaign-status",
        name: "Marketing & Pre-Save Campaign Status",
        description: "Estado en tiempo real de la campaña de marketing, métricas de pre-save, metas y playlists objetivo para 'Vuelve Bebé'.",
        mimeType: "application/json",
        read: async () => {
          const liveState = getLiveGameSessionState();
          const enriched = {
            ...MARKETING_CAMPAIGN_DATABASE,
            live_arcade_sync: {
              active_player_unlocked_tracks: `${liveState.unlocked_discs_count}/4`,
              player_game_round: liveState.current_game_round
            },
            _retrieved_at: new Date().toISOString()
          };
          return JSON.stringify(enriched, null, 2);
        }
      });

      // 3. content://nayze/live-game-progress
      this.registerResource({
        uri: "content://nayze/live-game-progress",
        name: "Live Game Progression Sync",
        description: "Progreso interactivo del usuario en el minijuego 8-bit (discos conseguidos, oleada activa y estado de tracks).",
        mimeType: "application/json",
        read: async () => {
          return JSON.stringify(getLiveGameSessionState(), null, 2);
        }
      });

      // 4. content://nayze/artist-lore
      this.registerResource({
        uri: "content://nayze/artist-lore",
        name: "NAYZE Artist Lore & 8-Bit World",
        description: "Historia narrativa, estética chiptune/cyberpunk y biografía del artista NAYZE.",
        mimeType: "application/json",
        read: async () => {
          const lore = {
            artist_name: "NAYZE",
            bio: "Productor, cantante y diseñador musical que habita la intersección entre el sonido club latino del 2026 y la estética de consolas chiptune de finales de los 80.",
            storyline: "NAYZE ha quedado atrapado dentro de su propio sintetizador analógico de estudio por un glitch llamado X-36. Para recuperar las pistas maestras de 'Vuelve Bebé', debe vencer a los clones del glitch y restaurar los 4 discos en el iPod central.",
            visual_style: "Pixel art 8-bit, luces de neón magenta (#ff0055) y cyan (#00f0ff), tipografía arcade y texturas CRT.",
            target_audience: "Gen Z, gamers retro, entusiastas del synthwave, fans de música urbana vanguardista."
          };
          return JSON.stringify(lore, null, 2);
        }
      });
    }

    registerResource(def) {
      this.resourceMap.set(def.uri, def);
      this.emit('resource-registered', def);
    }

    // --- TOOL REGISTRATION ---
    _registerBuiltinTools() {
      // 1. Tool: get_track_details
      this.registerTool({
        name: "get_track_details",
        description: "Consulta los detalles técnicos, stem de audio, BPM, tonalidad, fragmento lírico y estado de desbloqueo de una pista específica de NAYZE (1 a 4).",
        inputSchema: {
          type: "object",
          properties: {
            track_id: {
              type: "number",
              description: "Número del track o disco (1, 2, 3 o 4)"
            },
            search_query: {
              type: "string",
              description: "Palabra clave para buscar en las pistas (ej: 'bajo', 'vocal', 'intro', 'coro')"
            }
          }
        },
        execute: async (args) => {
          const liveState = getLiveGameSessionState();
          let track = null;

          if (args.track_id) {
            const id = parseInt(args.track_id, 10);
            track = NAYZE_TRACKS_DATABASE.tracks.find(t => t.id === id);
          } else if (args.search_query) {
            const q = args.search_query.toLowerCase();
            track = NAYZE_TRACKS_DATABASE.tracks.find(t =>
              t.title.toLowerCase().includes(q) ||
              t.stem_type.toLowerCase().includes(q) ||
              t.mood.toLowerCase().includes(q)
            );
          }

          if (!track) {
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  error: "Track no encontrado",
                  available_tracks: NAYZE_TRACKS_DATABASE.tracks.map(t => ({ id: t.id, title: t.short_title }))
                })
              }],
              isError: true
            };
          }

          const isUnlocked = track.id <= liveState.unlocked_discs_count;
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                track_info: track,
                current_player_unlock_status: isUnlocked ? "DESBLOQUEADO" : "BLOQUEADO EN EL JUEGO",
                instructions: isUnlocked
                  ? "Esta pista ya está lista para reproducirse en el iPod del estudio."
                  : `Derrota a la oleada ${track.id} en el arcade para escuchar este stem completo.`
              }, null, 2)
            }]
          };
        }
      });

      // 2. Tool: get_campaign_kpis
      this.registerTool({
        name: "get_campaign_kpis",
        description: "Obtiene las métricas clave de rendimiento (KPIs), porcentaje de pre-save completado, desglose por plataforma y velocidad diaria de la campaña de NAYZE.",
        inputSchema: {
          type: "object",
          properties: {
            platform_filter: {
              type: "string",
              enum: ["all", "spotify", "apple_music", "youtube", "tiktok"],
              description: "Filtrar por una plataforma en particular o ver 'all'."
            }
          }
        },
        execute: async (args) => {
          const filter = args.platform_filter || "all";
          const metrics = MARKETING_CAMPAIGN_DATABASE.presave_metrics;
          let platforms = MARKETING_CAMPAIGN_DATABASE.platform_breakdown;

          if (filter !== "all") {
            platforms = platforms.filter(p => p.platform.toLowerCase().includes(filter.replace('_', ' ')));
          }

          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                campaign_name: MARKETING_CAMPAIGN_DATABASE.campaign_name,
                status: MARKETING_CAMPAIGN_DATABASE.status,
                days_left: MARKETING_CAMPAIGN_DATABASE.days_to_launch,
                summary: {
                  goal: metrics.target_presaves,
                  current: metrics.current_presaves,
                  percentage: `${metrics.completion_percentage}%`,
                  needed: metrics.remaining_presaves,
                  estimated_reach_day_one: metrics.projected_day_one_presaves
                },
                platforms: platforms,
                conversion_from_minigame: metrics.conversion_rate_from_arcade_game
              }, null, 2)
            }]
          };
        }
      });

      // 3. Tool: generate_social_hook
      this.registerTool({
        name: "generate_social_hook",
        description: "Herramienta creativa para generar ganchos virales, textos de copy y sugerencias de sincronización de audio basados en los stems de NAYZE.",
        inputSchema: {
          type: "object",
          properties: {
            platform: {
              type: "string",
              enum: ["tiktok", "instagram_reels", "twitter_x", "spotify_pitch"],
              description: "Red social o destino del copy publicitario."
            },
            track_focus: {
              type: "number",
              description: "ID de la pista en la cual basar el gancho (1: Intro, 2: Drop, 3: Coro/Vocals, 4: Full Mix)"
            },
            tone: {
              type: "string",
              enum: ["hype_viral", "nostalgic_cyberpunk", "direct_cta_presave", "editorial_pitch"],
              description: "Tono o estilo comunicativo."
            }
          },
          required: ["platform"]
        },
        execute: async (args) => {
          const trackId = args.track_focus || 3;
          const track = NAYZE_TRACKS_DATABASE.tracks.find(t => t.id === trackId) || NAYZE_TRACKS_DATABASE.tracks[2];
          const tone = args.tone || "hype_viral";
          const platform = args.platform;

          let hookDraft = "";
          let copyDraft = "";
          let callToAction = "";

          if (platform === "tiktok" || platform === "instagram_reels") {
            hookDraft = `POV: Te quedaste atrapado en 1989 y la única forma de volver es este tema... 🕹️✨`;
            copyDraft = `No puedo sacarme del pecho este beat de 8 bits. ¿Alguien más siente que nació en la época equivocada? 'Vuelve Bebé' sale este 22 de Noviembre pero ya puedes probar los stems secretos en el juego retro linkeado en bio.`;
            callToAction = `Guarda el audio oficial en TikTok y desbloquea el Track ${track.id} en nuestro arcade web oficial. 💿👾`;
          } else if (platform === "spotify_pitch") {
            hookDraft = `Pitch Editorial: 'Vuelve Bebé' de NAYZE (Latin Synth-Pop / Retro Cyberpunk)`;
            copyDraft = `Producido íntegramente por NAYZE a 128 BPM en Fa menor. Fusiona arpegios clásicos de consolas de 8 bits con un drop de bajo Moog contemporáneo y un gancho vocal urbano ultra pegadizo. Desarrollado con una campaña inmersiva donde miles de oyentes desbloquean los stems jugando un beat-'em-up interactivo.`;
            callToAction = `Recomendado para playlists: Fresh Finds Latin, Cyberpunk Synth, Pop Urbano 2026.`;
          } else {
            hookDraft = `⚠️ ALERTA DE NUEVO DROP: 128 BPM de pura nostalgia retro-futurista.`;
            copyDraft = `Llegamos al 73.6% de la meta de Pre-Saves de 'Vuelve Bebé'. Si amas la vibra arcade y el desamor en 8 bits, dale pre-save ya mismo antes de que el servidor colapse.`;
            callToAction = `Enlace directo al estudio interactivo: https://api.nayzemusic.com/v1/presave 🚀`;
          }

          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                strategy: {
                  selected_platform: platform,
                  track_used: track.title,
                  sound_timestamp: track.recommended_social_use.timestamp_start + " - " + track.recommended_social_use.timestamp_end,
                  recommended_vibe: tone,
                  hook: hookDraft,
                  copy: copyDraft,
                  hashtags: MARKETING_CAMPAIGN_DATABASE.official_hashtags.slice(0, 4).join(" "),
                  call_to_action: callToAction
                }
              }, null, 2)
            }]
          };
        }
      });

      // 4. Tool: check_unlock_status
      this.registerTool({
        name: "check_unlock_status",
        description: "Verifica qué canciones y discos del iPod están actualmente liberados por el jugador en su sesión activa de juego.",
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          const live = getLiveGameSessionState();
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                session_summary: `El jugador ha desbloqueado ${live.unlocked_discs_count} de 4 discos.`,
                is_all_complete: live.all_unlocked,
                round_number: live.current_game_round,
                discs: live.tracks_status,
                next_objective: live.all_unlocked
                  ? "¡Has completado toda la suite! Todos los stems están liberados en el iPod del estudio."
                  : `Juega la Oleada ${live.unlocked_discs_count + 1} en el minijuego arcade para desbloquear el siguiente disco.`
              }, null, 2)
            }]
          };
        }
      });

      // 5. Tool: estimate_streaming_projection
      this.registerTool({
        name: "estimate_streaming_projection",
        description: "Modela la proyección de streams en Spotify/Apple Music basándose en la tasa actual de Pre-Saves de 'Vuelve Bebé'.",
        inputSchema: {
          type: "object",
          properties: {
            daily_growth_presaves: {
              type: "number",
              description: "Incremento diario estimado de pre-saves (por defecto 740)"
            }
          }
        },
        execute: async (args) => {
          const current = MARKETING_CAMPAIGN_DATABASE.presave_metrics.current_presaves;
          const daily = args.daily_growth_presaves || MARKETING_CAMPAIGN_DATABASE.presave_metrics.daily_velocity_average;
          const daysLeft = MARKETING_CAMPAIGN_DATABASE.days_to_launch;
          const projectedFinalPresaves = current + (daily * daysLeft);

          // Algorithmic multiplier: each pre-save generates ~4.2 day-1 streams on average
          const dayOneStreams = Math.round(projectedFinalPresaves * 4.2);
          const firstWeekStreams = Math.round(dayOneStreams * 4.8);
          const algorithmicPlaylistChance = projectedFinalPresaves > 20000 ? "92% (Release Radar + Discover Weekly Triggered)" : "64%";

          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                projection_model: "NAYZE Algorithmic Music Model v2.6",
                inputs: {
                  current_presaves: current,
                  daily_velocity: daily,
                  days_until_drop: daysLeft
                },
                projected_totals: {
                  estimated_presaves_at_launch: projectedFinalPresaves,
                  day_one_streams_projected: dayOneStreams.toLocaleString(),
                  first_week_streams_projected: firstWeekStreams.toLocaleString(),
                  algorithmic_trigger_probability: algorithmicPlaylistChance,
                  verdict: projectedFinalPresaves >= 25000
                    ? "META SUPERADA: Se espera un debut en Top Debut Songs Latin."
                    : "EN OBJETIVO: Con un último empuje en TikTok se superarán los 25,000 pre-saves con comodidad."
                }
              }, null, 2)
            }]
          };
        }
      });
    }

    registerTool(def) {
      this.toolMap.set(def.name, def);
      this.emit('tool-registered', def);
    }

    // --- PROMPT REGISTRATION (MCP Prompts API) ---
    _registerBuiltinPrompts() {
      this.promptMap.set("viral-tiktok-script", {
        name: "viral-tiktok-script",
        description: "Plantilla para estructurar guiones de TikTok con los stems de NAYZE.",
        arguments: [
          { name: "track_id", description: "Pista a utilizar", required: true }
        ]
      });

      this.promptMap.set("curator-editorial-pitch", {
        name: "curator-editorial-pitch",
        description: "Plantilla para enviar a editores de playlist de Spotify / Apple Music.",
        arguments: []
      });
    }

    // --- EVENT SYSTEM ---
    on(event, handler) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(handler);
    }

    emit(event, payload) {
      const list = this.listeners.get(event);
      if (list) {
        list.forEach(fn => {
          try { fn(payload); } catch (e) { console.error(`Error in listener for ${event}:`, e); }
        });
      }
    }

    // --- CORE MCP PROTOCOL REQUEST HANDLER (JSON-RPC 2.0) ---
    async handleRequest(request) {
      if (!request || request.jsonrpc !== "2.0") {
        return {
          jsonrpc: "2.0",
          id: request ? request.id : null,
          error: { code: -32600, message: "Invalid Request: Must be JSON-RPC 2.0" }
        };
      }

      const { id, method, params } = request;

      try {
        switch (method) {
          case "initialize": {
            return {
              jsonrpc: "2.0",
              id,
              result: {
                protocolVersion: this.serverInfo.protocolVersion,
                capabilities: this.serverInfo.capabilities,
                serverInfo: {
                  name: this.serverInfo.name,
                  title: this.serverInfo.title,
                  version: this.serverInfo.version
                }
              }
            };
          }

          case "ping": {
            return { jsonrpc: "2.0", id, result: {} };
          }

          case "resources/list": {
            const list = Array.from(this.resourceMap.values()).map(r => ({
              uri: r.uri,
              name: r.name,
              description: r.description,
              mimeType: r.mimeType
            }));
            return { jsonrpc: "2.0", id, result: { resources: list } };
          }

          case "resources/read": {
            if (!params || !params.uri) {
              return {
                jsonrpc: "2.0",
                id,
                error: { code: -32602, message: "Missing required parameter 'uri'" }
              };
            }
            const resource = this.resourceMap.get(params.uri);
            if (!resource) {
              return {
                jsonrpc: "2.0",
                id,
                error: { code: -32601, message: `Resource not found: ${params.uri}` }
              };
            }
            const contentText = await resource.read();
            return {
              jsonrpc: "2.0",
              id,
              result: {
                contents: [
                  {
                    uri: resource.uri,
                    mimeType: resource.mimeType,
                    text: contentText
                  }
                ]
              }
            };
          }

          case "tools/list": {
            const list = Array.from(this.toolMap.values()).map(t => ({
              name: t.name,
              description: t.description,
              inputSchema: t.inputSchema
            }));
            return { jsonrpc: "2.0", id, result: { tools: list } };
          }

          case "tools/call": {
            if (!params || !params.name) {
              return {
                jsonrpc: "2.0",
                id,
                error: { code: -32602, message: "Missing tool 'name' parameter" }
              };
            }
            const tool = this.toolMap.get(params.name);
            if (!tool) {
              return {
                jsonrpc: "2.0",
                id,
                error: { code: -32601, message: `Tool not found: ${params.name}` }
              };
            }
            const result = await tool.execute(params.arguments || {});
            return { jsonrpc: "2.0", id, result };
          }

          case "prompts/list": {
            const list = Array.from(this.promptMap.values());
            return { jsonrpc: "2.0", id, result: { prompts: list } };
          }

          default:
            return {
              jsonrpc: "2.0",
              id,
              error: { code: -32601, message: `Method not found: ${method}` }
            };
        }
      } catch (err) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32000, message: err.message || "Internal server error" }
        };
      }
    }

    // --- PROGRAMMATIC DIRECT CONVENIENCE HELPERS ---
    async listResources() {
      const resp = await this.handleRequest({ jsonrpc: "2.0", id: 1, method: "resources/list" });
      return resp.result ? resp.result.resources : [];
    }

    async readResource(uri) {
      const resp = await this.handleRequest({
        jsonrpc: "2.0",
        id: 2,
        method: "resources/read",
        params: { uri }
      });
      if (resp.error) throw new Error(resp.error.message);
      return resp.result.contents[0];
    }

    async listTools() {
      const resp = await this.handleRequest({ jsonrpc: "2.0", id: 3, method: "tools/list" });
      return resp.result ? resp.result.tools : [];
    }

    async callTool(name, args = {}) {
      const resp = await this.handleRequest({
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: { name, arguments: args }
      });
      if (resp.error) throw new Error(resp.error.message);
      return resp.result;
    }
  }

  // --- LOCAL CLIENT ADAPTER FOR IN-BROWSER / IN-APP MCP CONSUMPTION ---
  class LocalMCPClient {
    constructor(server) {
      this.server = server;
      this.requestIdCounter = 1;
    }

    async request(method, params = {}) {
      const id = this.requestIdCounter++;
      const payload = {
        jsonrpc: "2.0",
        id,
        method,
        params
      };
      const response = await this.server.handleRequest(payload);
      if (response.error) {
        throw new Error(`MCP Error [${response.error.code}]: ${response.error.message}`);
      }
      return response.result;
    }

    async listResources() {
      const res = await this.request("resources/list");
      return res.resources;
    }

    async readResource(uri) {
      const res = await this.request("resources/read", { uri });
      return res.contents && res.contents[0] ? res.contents[0].text : null;
    }

    async listTools() {
      const res = await this.request("tools/list");
      return res.tools;
    }

    async callTool(name, args = {}) {
      const res = await this.request("tools/call", { name, arguments: args });
      return res;
    }
  }

  // Singletons for direct access
  const localMcpServer = new NayzeMCPServer();
  const localMcpClient = new LocalMCPClient(localMcpServer);

  return {
    NayzeMCPServer,
    LocalMCPClient,
    localMcpServer,
    localMcpClient,
    NAYZE_TRACKS_DATABASE,
    MARKETING_CAMPAIGN_DATABASE
  };
});
