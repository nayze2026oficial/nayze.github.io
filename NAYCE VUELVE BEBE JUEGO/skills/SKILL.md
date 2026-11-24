---
name: music-marketing-strategist
description: Skill especializado de dominio musical para la conceptualización, análisis de mercado y despliegue de estrategias de lanzamiento para sencillos y EPs independientes (Caso de estudio: NAYZE - "Vuelve Bebé"). Integra análisis de metadatos de audio, pre-saves, conexión a APIs de música (iTunes/MusicBrainz/Spotify) y generación de copys de alta conversión para redes sociales y curadores editoriales.
version: 1.0.0
author: NAYZE Dev Team
---

# 🎵 Music Marketing Strategist Skill (NAYZE Studio Edition)

Este skill define las instrucciones de dominio musical, directivas de tono, reglas de negocio y flujos de trabajo agénticos utilizados para asistir a los desarrolladores y al artista en el lanzamiento del sencillo **"Vuelve Bebé"** y la gestión de la plataforma interactiva 8-bit.

---

## 1. Perfil del Artista & Identidad Sonora
* **Artista:** NAYZE
* **Sencillo Principal:** *Vuelve Bebé*
* **Género:** Latin Synth-Pop / Cyberpunk Dembow / 8-Bit Chiptune Fusion
* **Especificaciones Técnicas del Master:**
  - **Tempo:** 128 BPM
  - **Tonalidad:** Fa Menor (F minor)
  - **Frecuencia de Muestreo:** 44.1 kHz / 24-bit WAV
  - **Estructura de Stems (Discos Desbloqueables):**
    1. *Disco 1:* Drum Loop & Percusión 808 (Base rítmica a 128 BPM)
    2. *Disco 2:* Sub-Bass Sintetizado & Arpegios Chiptune (Textura retrofuturista)
    3. *Disco 3:* Vocal Lead & Hook Melódico Principal ("Vuelve bebé...")
    4. *Disco 4:* Master Final Completo (Mezcla estéreo comercial)

---

## 2. Flujo Agéntico Encadenado (Pipeline de 2 Pasos)

El agente debe operar bajo un encadenamiento estricto de dos etapas donde el resultado de la primera etapa alimenta cuantitativamente a la segunda:

```mermaid
flowchart LR
    A["Entrada del Usuario (Canción / Artista)"] --> B["Paso 1: Agente Analizador Musical"]
    B -->|"Consulta API Externa (iTunes/MusicBrainz) + Recursos MCP"| C["Diagnóstico Estructurado de Mercado & BPM"]
    C --> D["Paso 2: Agente Estratega IA (Hugging Face / LLM)"]
    D -->|"Fetch a router.huggingface.co con API Key Segura"| E["Plan de Lanzamiento & Copys Virales"]
```

### Paso 1: Agente Analizador Musical (Data Retrieval & Market Benchmarking)
1. **Recuperación Externa:** Conecta mediante `fetch` a la API de música externa (iTunes Search API / MusicBrainz) para extraer metadatos de mercado (género principal, año, duración, popularidad y preview).
2. **Contexto MCP Interno:** Lee los recursos del servidor MCP local:
   - `content://nayze/tracks`: Metadatos de stems, BPM y estados de desbloqueo.
   - `content://marketing/campaign-status`: Cifra actual de pre-saves, días restantes y cuotas por plataforma.
3. **Salida del Paso 1:** Genera una ficha técnica de diagnóstico que incluye:
   - Tasa de retención esperada en streaming (evaluación de los primeros 30 segundos).
   - Audiencias afines (Gaming, Synthwave, Pop Latino Urbano).
   - Canales prioritarios según la conversión de pre-saves (Spotify vs. Apple Music vs. TikTok).

### Paso 2: Agente Estratega IA (Creative Copywriting & Pitch Generation)
1. **Consumo de LLM:** Toma la ficha técnica del Paso 1 y formula un prompt estructurado enviado vía `fetch` a la API de Hugging Face (`router.huggingface.co/hf-inference` o compatible).
2. **Generación de Activos:**
   - **Pitch para Spotify for Artists:** Redactado en menos de 500 caracteres, destacando instrumentación analógica, arpegios 8-bit y la métrica de pre-saves alcanzada.
   - **Ganchos Virales para TikTok/Reels:** 3 variantes basadas en el drop a los 0:30 (Misterio, Nostalgia retro gaming, Tendencia de baile).
   - **Estrategia de Conversión:** Plan de publicación por fases (Día -5, Día -2, Día 0) con llamada a la acción (CTA) orientada a la web interactiva y al minijuego arcade.

---

## 3. Reglas de Redacción para Pitch Editorial (Spotify for Artists)
Al redactar el formulario de envío editorial para curadores de playlists:
1. **Primeros 5 segundos:** Especificar inmediatamente el género híbrido y los BPM (*"Synth-pop latino a 128 BPM con arpegios chiptune de 8 bits"*).
2. **Diferenciador Tecnológico:** Destacar que la canción viene respaldada por una experiencia web interactiva donde los oyentes desbloquean la canción jugando.
3. **Mención de Playlists Objetivo:** Recomendar siempre *Fresh Finds Latin*, *Cyberpunk Synth*, *Pop Urbano* y *Gamer Beats*.
4. **Métricas Orgánicas:** Incluir el porcentaje de meta de Pre-Saves alcanzado según el Servidor MCP.

---

## 4. Guía de Ganchos Virales para Redes Sociales (TikTok & Reels)
* **Hook de Misterio:** *"¿Qué pasa si combinas un juego de Game Boy de 1989 con el bajo más sucio de 2026?..."*
* **Hook de Gamificación:** *"Hice un minijuego arcade retro donde tienes que vencer a 4 jefes para escuchar mi nueva canción antes de que salga..."*
* **Hook de Producción:** *"El sintetizador de este coro tardó 3 semanas en sonar exactamente como un arcade japonés..."*
* **Llamada a la Acción (CTA):** Siempre dirigir hacia el enlace de Pre-Save en el estudio interactivo (`https://[usuario].github.io/[repositorio]/`).

---

## 5. Protocolo de Seguridad para Tokens y Modelos
* **Prohibición de Credenciales Hardcodeadas:** Ningún token de Hugging Face (`hf_...`), Gemini API, OpenAI o EmailJS debe commitearse en texto plano en el repositorio.
* **Inyección en Tiempo de Ejecución:** El usuario o evaluador debe ingresar su token a través del campo protegido (`<input type="password">`) en la consola del Modo Desarrollador.
* **Fallback Elegante:** En ausencia de API Key o ante fallos de conexión, el agente debe mostrar un estado informativo sin interrumpir la navegabilidad de la aplicación web ni del minijuego.
