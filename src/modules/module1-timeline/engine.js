import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { vertexShader, fragmentShader } from './shaders.js';

gsap.registerPlugin(ScrollTrigger);

export function initTimelineExperience(rootEl, ERAS, options = {}) {
  // Idempotencia: si ya había una instancia viva (HMR, StrictMode, re-init
  // por resize), desmontarla primero para no duplicar triggers/tweens.
  if (rootEl._tlCleanup) {
    try { rootEl._tlCleanup(); } catch (e) { /* noop */ }
    rootEl._tlCleanup = null;
  }
  // Aislamiento: el cleanup solo mata los ScrollTriggers creados por este
  // módulo, nunca los de otros módulos del App.
  const foreignTriggers = new Set(ScrollTrigger.getAll());

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ITEM_VW = 180;
  const GAP_VW = 40;

  function getItemCenterVw(i) {
    return 100 + GAP_VW + i * ITEM_VW + ITEM_VW * 0.5;
  }

  function getStageTrackShiftVw(type, eraIdx) {
    if (type === 'overview') return 0;
    const center = getItemCenterVw(eraIdx);
    if (type === 'polaroid') {
      // -84: centra la polaroid en el viewport compensando el avance del
      // stageFrame (FASE 2 ya desplazó ~+235px cuando la foto se centra).
      return center - 84 + (3.0 / 10.0) * 154;
    }
    if (type === 'fullview') {
      return center - 92 + (6.1 / 10.0) * 154;
    }
    return 0;
  }

  // Geometría exacta del contenido: overview 100 + gap + N hitos de 180 +
  // tramo final de salida (para que 2026 comprima el túnel y vuelva a
  // polaroid antes del footer). El track mide EXACTO el contenido y el
  // contenedor (lo que realmente se desplaza) es TOTAL - 100. TODAS las
  // fracciones de stage se normalizan contra CONTAINER_VW.
  const END_CAP_VW = 60;
  const TOTAL_TRACK_VW = 100 + GAP_VW + ERAS.length * ITEM_VW + END_CAP_VW;
  const CONTAINER_VW = TOTAL_TRACK_VW - 100;

  const track = rootEl.querySelector('#timeline-track');
  const nodesBox = rootEl.querySelector('#track-nodes');
  const overview = rootEl.querySelector('#overview');
  const hud = rootEl.querySelector('#hud');
  const hudYear = rootEl.querySelector('#hud-year');
  const progressNav = rootEl.querySelector('#progress');
  const progressBar = rootEl.querySelector('#progress-bar');
  const progressFill = rootEl.querySelector('#progress-fill');
  const railProgress = rootEl.querySelector('#rail-progress');
  const dotsBox = rootEl.querySelector('#dots');
  const speedEl = rootEl.querySelector('#speed');
  const canvas = rootEl.querySelector('#tunnel-canvas');
  const fvCard = rootEl.querySelector('#fullview-card');

  // =============================================================================
  // 1. Escena WebGL Three.js con Fondo Transparente (Túnel 3D)
  // =============================================================================
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 4);

  const geometry = new THREE.PlaneGeometry(1, 1, 48, 48);
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');

  function placeholderTex(hex) {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 16;
    const ctx = c.getContext('2d');
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, 16, 16);
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    return t;
  }

  function coverFor(imgAspect, frameAspect) {
    if (imgAspect > frameAspect) {
      const w = frameAspect / imgAspect;
      return new THREE.Vector4(w, 1.0, (1.0 - w) * 0.5, 0.0);
    }
    const h = imgAspect / frameAspect;
    return new THREE.Vector4(1.0, h, 0.0, (1.0 - h) * 0.5);
  }

  const coversSquare = new Array(ERAS.length);
  const coversScreen = new Array(ERAS.length);

  function refreshCovers() {
    const screenAsp = window.innerWidth / window.innerHeight;
    for (let i = 0; i < ERAS.length; i++) {
      const t = textures[i];
      if (t && t.image && t.image.width) {
        const imgAsp = t.image.width / t.image.height;
        coversSquare[i] = coverFor(imgAsp, 1.0);
        coversScreen[i] = coverFor(imgAsp, screenAsp);
      } else {
        coversSquare[i] = new THREE.Vector4(1, 1, 0, 0);
        coversScreen[i] = new THREE.Vector4(1, 1, 0, 0);
      }
    }
  }

  const textures = ERAS.map((era, i) => {
    coversSquare[i] = new THREE.Vector4(1, 1, 0, 0);
    coversScreen[i] = new THREE.Vector4(1, 1, 0, 0);
    const tex = loader.load(era.full, () => {
      refreshCovers();
    });
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  });

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTex1: { value: textures[0] || placeholderTex('#000000') },
      uTex2: { value: textures[0] || placeholderTex('#000000') },
      uProgress: { value: 0.0 },
      uSepia1: { value: 0.0 },
      uSepia2: { value: 0.0 },
      uCalm: { value: reduceMotion ? 1.0 : 0.0 },
      uCover1: { value: new THREE.Vector4(1, 1, 0, 0) },
      uCover2: { value: new THREE.Vector4(1, 1, 0, 0) },
    },
    transparent: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.visible = false;
  scene.add(mesh);

  function getVisibleSize() {
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const visibleH = 2 * Math.tan(vFOV / 2) * camera.position.z;
    const visibleW = visibleH * camera.aspect;
    return { visibleW, visibleH };
  }

  function screenToWorld(cx, cy, w, h) {
    const { visibleW, visibleH } = getVisibleSize();
    return {
      x: (cx / window.innerWidth - 0.5) * visibleW,
      y: -(cy / window.innerHeight - 0.5) * visibleH,
      w: (w / window.innerWidth) * visibleW,
      h: (h / window.innerHeight) * visibleH,
    };
  }

  // Rotación de reposo de la polaroid: constante fijada por CSS
  // (.polaroid-card { transform: rotate(-3.5deg) }). No se parsea la matriz
  // computada durante la animación GSAP porque mezcla escala+rotación y
  // produce pops al arrancar la expansión del túnel.
  const REST_ROT = 3.5 * (Math.PI / 180);

  function captureRestSnapshot(eraIndex) {
    const item = items[eraIndex];
    const photoFrame = item?.querySelector('.polaroid-photo-frame');

    let snap = {
      cx: window.innerWidth * 0.5,
      cy: window.innerHeight * 0.72,
      w: 150,
      h: 150,
      rot: REST_ROT,
    };

    if (photoFrame) {
      const r = photoFrame.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        snap.cx = r.left + r.width * 0.5;
        snap.cy = r.top + r.height * 0.5;
        snap.w = photoFrame.offsetWidth || r.width;
        snap.h = photoFrame.offsetHeight || r.height;
      }
    }
    return snap;
  }

  function applyTransitionState(eraIndex, t, frozenRest = null) {
    // Estado fullview → CSS (HUD centrado solo fuera de fullview, año del HUD
    // solo dentro). Se conmuta aquí porque el scrub es la fuente de verdad.
    rootEl.classList.toggle('is-fullview', t > 0.5);

    // Card de fullview (overlay fijo al viewport): fade+rise scrubbeados con
    // t — visible durante el hold (t≈1), fuera el resto.
    if (fvCard) {
      const k = THREE.MathUtils.clamp((t - 0.45) / 0.2, 0, 1);
      fvCard.style.opacity = k.toFixed(3);
      fvCard.style.transform = `translateY(calc(-50% + ${((1 - k) * 24).toFixed(1)}px))`;
    }

    if (eraIndex < 0 || eraIndex >= ERAS.length) {
      mesh.visible = false;
      return;
    }

    if (t <= 0.001) {
      mesh.visible = false;
      material.uniforms.uProgress.value = 0.0;
      renderer.clear();
      return;
    }

    mesh.visible = true;
    material.uniforms.uProgress.value = THREE.MathUtils.clamp(t, 0, 1);

    if (textures[eraIndex]) {
      if (material.uniforms.uTex1.value !== textures[eraIndex]) {
        material.uniforms.uTex1.value = textures[eraIndex];
        material.uniforms.uTex2.value = textures[eraIndex];
      }
      if (coversSquare[eraIndex]) {
        material.uniforms.uCover1.value.copy(coversSquare[eraIndex]);
      }
      if (coversScreen[eraIndex]) {
        material.uniforms.uCover2.value.copy(coversScreen[eraIndex]);
      }
      material.uniforms.uSepia1.value = ERAS[eraIndex].sepiaVal ?? 0.0;
      material.uniforms.uSepia2.value = ERAS[eraIndex].sepiaVal ?? 0.0;
    }

    const item = items[eraIndex];
    // Origen congelado: se captura una vez en onStart del tween del túnel.
    // Releer getBoundingClientRect() en cada frame bailaba porque el track
    // (scrollTween) + stageFrame se mueven a la vez que t: 0→1 interpola.
    const rest = frozenRest ?? captureRestSnapshot(eraIndex);
    const restCx = rest.cx;
    const restCy = rest.cy;
    const restW = rest.w;
    const restH = rest.h;
    const restRot = rest.rot;

    const restWorld = screenToWorld(restCx, restCy, restW, restH);
    const { visibleW, visibleH } = getVisibleSize();

    mesh.position.x = THREE.MathUtils.lerp(restWorld.x, 0, t);
    mesh.position.y = THREE.MathUtils.lerp(restWorld.y, 0, t);
    mesh.scale.x = THREE.MathUtils.lerp(restWorld.w, visibleW, t);
    mesh.scale.y = THREE.MathUtils.lerp(restWorld.h, visibleH, t);
    mesh.rotation.z = THREE.MathUtils.lerp(restRot, 0, t);
  }

  let animFrameId = null;
  let lastScrollProgress = 0;
  let scrollSpeed = 0;
  let overviewTitleEls = null;

  function tick() {
    animFrameId = requestAnimationFrame(tick);
    // Aislamiento: sin trabajo GPU fuera del recorrido del módulo.
    if (!rootEl.classList.contains('module-active')) return;
    // Titular persistente: contrarresta el desplazamiento horizontal del
    // track para que quede fijo en viewport en X, pero sigue atado a la
    // página en Y (se va con el módulo al hacer scroll up/down). Set directo,
    // sin transiciones.
    if (overviewTitleEls && overviewTitleEls.length) {
      const tx = Number(gsap.getProperty(track, 'x')) || 0;
      gsap.set(overviewTitleEls, { x: -tx });
    }
    if (!reduceMotion && speedEl) {
      speedEl.style.opacity = scrollSpeed.toFixed(3);
    }
    if (mesh.visible) {
      renderer.render(scene, camera);
    } else {
      renderer.clear();
    }
  }
  tick();

  // =============================================================================
  // 2. Render Dinámico: Overview (Timeline Clásica) + Hitos (Polaroids SX-70)
  // =============================================================================
  track.style.width = `${TOTAL_TRACK_VW}vw`;
  const gapStageEl = rootEl.querySelector('.gap-stage');
  if (gapStageEl) gapStageEl.style.width = `${GAP_VW}vw`;

  // Overview con todas las polaroids sobre el eje cronológico
  overview.innerHTML = `
    <div class="overview-inner">
      <p class="overview-kicker">Barrio Abajo del Río · la memoria sigue viva</p>
      <h2 class="overview-title">LA LÍNEA DEL BARRIO ABAJO</h2>
      <div class="classic-timeline" role="list" style="--eras-count: ${ERAS.length};">
        <div class="classic-axis" aria-hidden="true">
          <span class="classic-end classic-start">${ERAS[0].year}</span>
          <span class="classic-now">Hoy</span>
        </div>
        ${ERAS.map(
          (era, i) => `
          <div class="classic-node ${i % 2 === 0 ? 'is-top' : 'is-bottom'}" role="listitem">
            <button class="overview-polaroid" data-goto="${i}" aria-label="Ir a ${era.year} — ${era.label}">
              <div class="overview-photo-frame">
                <img src="${era.full}" alt="Barrio Abajo ${era.year}" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async" />
              </div>
              <span class="classic-year">${era.year}</span>
              <span class="classic-caption">${era.label}</span>
            </button>
            <span class="classic-tick" aria-hidden="true"></span>
            <span class="classic-dot" aria-hidden="true"></span>
          </div>`,
        ).join('')}
      </div>
      <p class="overview-note">Cada foto es un tiempo del barrio que todavía respira — déjate llevar por la corriente.</p>
    </div>`;

  // Titular dentro del overview, en flujo normal: se cachean sus nodos para
  // el counter-x del tick (persiste horizontalmente sin salir del panel).
  overviewTitleEls = overview.querySelectorAll('.overview-kicker, .overview-title');

  // Copy del módulo (acotado a module1): hints de entrada/salida en tono
  // ambiente. El dato compartido queda neutro; el módulo resuelve su copy.
  const hintFor = (i) => {
    if (i === 0) return 'Sigue bajando, el río continúa ↓';
    if (i === ERAS.length - 1) return '↑ Sube para volver al pasado';
    return ERAS[i].hint || '';
  };

  // Limpiar y renderizar nodos de hitos (sin elementos flotantes / burbujas)
  nodesBox.innerHTML = '';
  ERAS.forEach((era, i) => {
    const article = document.createElement('article');
    article.className = 'timeline-item';
    article.dataset.year = era.year;
    article.dataset.index = String(i);
    const hint = hintFor(i);

    article.innerHTML = `
      <div class="stage-frame">
        <div class="snapshot" aria-hidden="true">
          <figure class="polaroid-card">
            <div class="polaroid-photo-frame">
              <img src="${era.full}" alt="Barrio Abajo en ${era.year}"
                ${i === 0 ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'} />
              <div class="polaroid-glare"></div>
            </div>
            <figcaption class="polaroid-chin">
              <span class="year-text">${era.year}</span>
              <span class="label-text">${era.label}</span>
            </figcaption>
          </figure>
          <div class="snapshot-anchor">
            <span class="snapshot-tick"></span>
            <span class="snapshot-dot"></span>
          </div>
          <span class="snapshot-label">${era.year} · ${era.label}</span>
        </div>
        <div class="info-card">
          <div class="card-badge-row">
            <span class="card-badge-year">${era.year}</span>
            <span class="card-chip-cat">${era.label}</span>
          </div>
          <h2>${era.title}</h2>
          <p>${era.text}</p>
          ${hint ? `<span class="hint">${hint}</span>` : ''}
        </div>
      </div>`;

    nodesBox.appendChild(article);
  });

  const items = gsap.utils.toArray(nodesBox.querySelectorAll('.timeline-item'));

  // Stages discretos: cada hito tiene Polaroid y Full View; 2026 cierra
  // el recorrido quedándose en fullview al final del pin.
  const STAGES = [
    { type: 'overview', eraIdx: -1, title: 'Overview', fraction: 0 },
  ];
  ERAS.forEach((era, i) => {
    STAGES.push({
      type: 'polaroid',
      eraIdx: i,
      title: `${era.year} Polaroid`,
      fraction: getStageTrackShiftVw('polaroid', i) / CONTAINER_VW,
    });
    // Fullview: clamp de seguridad a 1.0 (con el tramo final, el de 2026
    // queda en ~0.98, dentro del pin y en hold).
    STAGES.push({
      type: 'fullview',
      eraIdx: i,
      title: `${era.year} Full View`,
      fraction: Math.min(1.0, getStageTrackShiftVw('fullview', i) / CONTAINER_VW),
    });
  });
  // Stage final: la polaroid de 2026 ya comprimida y de vuelta (local 8.8:
  // túnel cerrado, polaroid sólida, rail de vuelta). Parada obligatoria para
  // que el scroll no salga del fullview directo al footer sin la animación
  // de retorno. Tras ella solo queda la salida (FASE 7 parcial) al footer.
  {
    const last = ERAS.length - 1;
    STAGES.push({
      type: 'polaroid',
      eraIdx: last,
      title: `${ERAS[last].year} Final`,
      fraction: (getItemCenterVw(last) - 92 + 0.88 * 154) / CONTAINER_VW,
    });
  }

  // Construcción limpia de la barra de progreso inferior y dots (sin burbujas)
  if (progressBar && dotsBox) {
    const existingNodes = progressBar.querySelectorAll('.progress-node');
    existingNodes.forEach((n) => n.remove());
    dotsBox.innerHTML = '';

    ERAS.forEach((era, i) => {
      const b = document.createElement('button');
      b.textContent = era.year;
      b.setAttribute('aria-label', `Ir a ${era.year}`);
      b.addEventListener('click', () => {
        const step = STAGES.findIndex((s) => s.eraIdx === i && s.type === 'polaroid');
        if (step >= 0) goToStageStep(step);
      });
      dotsBox.appendChild(b);
    });
  }

  let currentStageStep = 0;
  let isStageTransitioning = false;
  let stageTween = null;
  let dead = false;

  function goToStageStep(stepIndex, customDuration = null) {
    const boundedStep = Math.max(0, Math.min(STAGES.length - 1, stepIndex));
    if (boundedStep === currentStageStep && isStageTransitioning) return;
    const fromStep = currentStageStep;
    currentStageStep = boundedStep;
    const stage = STAGES[boundedStep];
    const fromStage = STAGES[fromStep];
    const st = scrollTween?.scrollTrigger;
    if (!st) return;

    const targetScroll = st.start + (st.end - st.start) * stage.fraction;
    isStageTransitioning = true;

    // Duraciones cinematográficas calibradas para apreciar el túnel 3D con calma
    let duration = 2.4;
    if (fromStep === 0 || boundedStep === 0) {
      duration = 2.6;
    } else if (stage.type === 'fullview') {
      duration = 2.4;
    } else if (stage.type === 'polaroid' && fromStage?.type === 'fullview') {
      duration = 2.8;
    } else {
      const stepDiff = Math.abs(boundedStep - fromStep);
      duration = Math.min(3.6, 2.0 + stepDiff * 0.4);
    }
    if (customDuration) duration = customDuration;

    const ease = 'power2.inOut';

    const proxy = { y: window.scrollY };
    stageTween?.kill();
    stageTween = gsap.to(proxy, {
      y: targetScroll,
      duration,
      ease,
      overwrite: 'auto',
      onUpdate: () => {
        window.scrollTo(0, proxy.y);
      },
      onComplete: () => {
        if (dead) return;
        // No forzar t=1.0 persistente: el scrub del timeline (Fase 4-6) es la
        // única fuente de verdad del estado del túnel. Fijar el mesh aquí
        // peleaba con el scrub fino dentro del hold y producía saltos.
        // Solo se limpia a polaroid/overview; el fullview lo deja el scrub.
        if (stage.type === 'polaroid') {
          applyTransitionState(stage.eraIdx, 0.0);
        } else if (stage.type === 'overview') {
          if (mesh) mesh.visible = false;
          rootEl.classList.remove('is-fullview');
          renderer.clear();
        }
        setTimeout(() => {
          if (dead) return;
          isStageTransitioning = false;
          lastWheelTime = Date.now();
        }, 500);
      },
    });
  }

  // Interacción de clicks en overview
  overview.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetEra = Number(btn.dataset.goto);
      const step = STAGES.findIndex((s) => s.eraIdx === targetEra && s.type === 'polaroid');
      if (step >= 0) goToStageStep(step);
    });
  });

  const dotBtns = [...dotsBox.querySelectorAll('button')];
  let currentActiveEra = -1;
  let shownYear = -1;
  let rollTimer = 0;

  function renderYear(val) {
    if (val === 'Línea') {
      hudYear.textContent = 'Línea';
      return;
    }
    const y = Math.round(val);
    if (y === shownYear) return;
    shownYear = y;
    hudYear.textContent = y;
    hudYear.classList.add('rolling');
    clearTimeout(rollTimer);
    rollTimer = setTimeout(() => hudYear.classList.remove('rolling'), 140);
  }

  function setActive(i) {
    if (currentActiveEra === i) return;
    currentActiveEra = i;

    if (i === -1) {
      // En el overview la esquina muestra el año inicial de la línea,
      // nunca el texto "Línea".
      renderYear(Number(ERAS[0]?.year));
    } else {
      renderYear(Number(ERAS[i]?.year));
    }

    dotBtns.forEach((d, k) => d.classList.toggle('active', k === i));
    items.forEach((el, k) => el.classList.toggle('is-active', k === i));
    overview.classList.toggle('is-active', i === -1);
    // Card de fullview (overlay fijo): contenido por era + lado alterno
    // (hitos impares a la derecha, igual que el nth-child original).
    if (fvCard) {
      if (i < 0) {
        fvCard.style.opacity = '0';
      } else {
        const era = ERAS[i];
        const hint = hintFor(i);
        fvCard.classList.toggle('is-right', i % 2 === 1);
        fvCard.innerHTML = `
          <div class="card-badge-row">
            <span class="card-badge-year">${era.year}</span>
            <span class="card-chip-cat">${era.label}</span>
          </div>
          <h2>${era.title}</h2>
          <p>${era.text}</p>
          ${hint ? `<span class="hint">${hint}</span>` : ''}`;
      }
    }

    if (!isStageTransitioning) {
      const matchedStep = STAGES.findIndex((s) => s.eraIdx === i);
      if (matchedStep >= 0 && Math.abs(currentStageStep - matchedStep) > 1) {
        currentStageStep = matchedStep;
      }
    }
  }

  // =============================================================================
  // 3. Master Scroll: Scroll Vertical -> Desplazamiento Horizontal (Pin + Scrub)
  // =============================================================================
  const timelineWrapper = rootEl.querySelector('.timeline-wrapper');

  const scrollTween = gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: timelineWrapper,
      pin: true,
      scrub: true,
      start: 'top top',
      end: () => `+=${track.scrollWidth}`,
      invalidateOnRefresh: true,
      // Overview como primer stage: el scroll largo desde el hero frena en
      // stages discretos (overview primero) en vez de patinar de largo.
      snap: {
        snapTo: (value) => {
          // Sin snap durante navegación programada (dots/teclado/wheel): el
          // tween propio ya aterriza exacto en la fracción; snapear a mitad
          // del vuelo pelea por el scroll y desincroniza el scrub del track.
          if (isStageTransitioning) return value;
          const fracs = STAGES.map((s) => s.fraction);
          let best = fracs[0];
          let bd = Math.abs(value - fracs[0]);
          for (let k = 1; k < fracs.length; k++) {
            const d = Math.abs(value - fracs[k]);
            if (d < bd) { bd = d; best = fracs[k]; }
          }
          return best;
        },
        duration: { min: 0.12, max: 0.3 },
        delay: 0.12,
        ease: 'power2.out',
      },
      onToggle: (self) => {
        options.onActiveChange?.(self.isActive);
      },
      onUpdate: (self) => {
        const p = self.progress;

        // Barra de progreso y HUD visibility control
        const isPinned = self.isActive;
        hud?.classList.toggle('is-active', isPinned);
        progressNav?.classList.toggle('is-active', isPinned);
        // Titular acotado al módulo: visible solo durante el recorrido
        // (ni en otros módulos ni fuera de la sección pineada).
        rootEl.classList.toggle('module-active', isPinned);

        const currentVw = p * CONTAINER_VW;

        const speedDelta = Math.abs(p - lastScrollProgress) * 65;
        scrollSpeed += (Math.min(1, speedDelta) - scrollSpeed) * 0.15;
        lastScrollProgress = p;

        let best = -1;
        const overviewRect = overview.getBoundingClientRect();
        if (overviewRect.right > window.innerWidth * 0.45) {
          best = -1;
        } else {
          let activeIdx = 0;
          for (let i = 0; i < ERAS.length; i++) {
            const polVw = getStageTrackShiftVw('polaroid', i);
            const nextPolVw = i < ERAS.length - 1 ? getStageTrackShiftVw('polaroid', i + 1) : Infinity;
            const threshold = (polVw + nextPolVw) * 0.5;
            if (currentVw < threshold) {
              activeIdx = i;
              break;
            }
            activeIdx = i;
          }
          best = activeIdx;
        }
        setActive(best);

        // Fill por años discretos: al centro del botón de su año (no al
        // final), quieto durante sus 2 stages (polaroid + fullview).
        if (progressFill) {
          const eraFrac = best < 0 ? 0 : (best + 0.5) / ERAS.length;
          progressFill.style.width = `${(eraFrac * 100).toFixed(2)}%`;
        }

        if (!isStageTransitioning) {
          let closest = 0;
          let minDiff = Infinity;
          const currentScroll = window.scrollY;
          STAGES.forEach((stg, idx) => {
            const sPos = self.start + (self.end - self.start) * stg.fraction;
            const diff = Math.abs(currentScroll - sPos);
            if (diff < minDiff) {
              minDiff = diff;
              closest = idx;
            }
          });
          currentStageStep = closest;
        }

        if (railProgress) {
          const trackRect = track.getBoundingClientRect();
          if (best === -1 || trackRect.width <= 0) {
            railProgress.style.transform = 'scaleX(0)';
          } else {
            const activeDot = items[best]?.querySelector('.snapshot-dot');
            if (activeDot) {
              const dotRect = activeDot.getBoundingClientRect();
              const dotScreenX = dotRect.left + dotRect.width * 0.5;
              const dotTrackX = dotScreenX - trackRect.left;
              const railFraction = THREE.MathUtils.clamp(dotTrackX / trackRect.width, 0, 1);
              railProgress.style.transform = `scaleX(${railFraction})`;
            }
          }
        }
      },
    },
  });

  if (scrollTween?.scrollTrigger) {
    options.onActiveChange?.(scrollTween.scrollTrigger.isActive);
  }

  setActive(-1);

  // Estado inicial nítido del Overview
  gsap.set(overview.querySelectorAll('.overview-polaroid'), { opacity: 1, y: 0 });
  const railLineEl = rootEl.querySelector('.rail-line');
  if (railLineEl) gsap.set(railLineEl, { opacity: 0 });

  // Transición del Overview hacia el Rail cuando el usuario avanza
  gsap.timeline({
    scrollTrigger: {
      trigger: overview,
      containerAnimation: scrollTween,
      start: 'left left',
      end: 'right left',
      scrub: true,
      invalidateOnRefresh: true,
    },
  })
    .to(overview.querySelectorAll('.overview-note'), { y: -30, opacity: 0, ease: 'power1.in', duration: 0.3 }, 0)
    .to(overview.querySelector('.classic-timeline'), { y: () => window.innerHeight * 0.22, ease: 'power1.inOut', duration: 0.5 }, 0)
    .to(overview.querySelector('.classic-axis'), { opacity: 0, ease: 'power1.in', duration: 0.35 }, 0.15)
    .to(
      overview.querySelectorAll('.classic-node'),
      {
        x: (i) => window.innerWidth * (1.5 + i * 0.15),
        y: (i) => (i % 2 === 0 ? -50 : 50),
        rotation: (i) => 10 + i * 3,
        opacity: 0,
        ease: 'power2.in',
        stagger: { each: 0.04, from: 'end' },
        duration: 0.65,
      },
      0.2,
    )
    .to(railLineEl, { opacity: 1, ease: 'power1.out', duration: 0.4 }, 0.45);

  // =============================================================================
  // 4. Coreografía por Hito: Llegada -> Hold sobre el Rail -> Túnel 3D -> Full View -> Retorno
  // =============================================================================
  items.forEach((item, index) => {
    const stageFrame = item.querySelector('.stage-frame');    const polaroidCard = item.querySelector('.polaroid-card');
    const snapAnchor = item.querySelector('.snapshot-anchor');
    const snapLabel = item.querySelector('.snapshot-label');

    // Todos los hitos (incluido 2026) corren el ciclo inmersivo completo:
    // llegada, pin central, túnel 3D, fullview y retorno. 2026 cierra el
    // recorrido en su fullview al final del pin.

    // Hitos 0 a N-1: Ciclo inmersivo con Túnel 3D
    const tunnelState = { t: 0 };
    // Snapshot congelado del origen de la expansión: se captura una vez al
    // entrar al túnel para que el mesh no persiga al DOM mientras el track
    // sigue desplazándose. Se comparte entre expansión y compresión.
    let tunnelOrigin = null;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: item,
        containerAnimation: scrollTween,
        start: 'center 92%',
        end: 'center -62%',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    // FASE 1: Llegada suave sobre el rail (0.0 a 2.2)
    tl.fromTo(
      polaroidCard,
      { scale: 0.9, rotation: -5, opacity: 0.6 },
      { scale: 1, rotation: -3.5, opacity: 1, ease: 'power1.out', duration: 2.0 },
      0,
    )
      .fromTo(snapAnchor, { opacity: 0 }, { opacity: 1, duration: 1.0 }, 0.8)
      .fromTo(snapLabel, { opacity: 0 }, { opacity: 1, duration: 1.0 }, 1.0);

    // FASE 2: Pin del stage completo en el centro (2.2 a 8.6)
    tl.fromTo(
      stageFrame,
      { x: 0 },
      { x: () => window.innerWidth * 0.9856, ease: 'none', duration: 6.4 },
      2.2,
    );

    // FASE 4: TRANSICIÓN TÚNEL 3D: EXPANSIÓN (3.8 a 5.2)
    // La línea central se oculta durante el fullview y regresa al comprimir.
    // Son tweens del mismo timeline scrubbeado → reversibles sin parpadeo.
    // (Ventanas por hito no se solapan: los hitos distan 180vw y el rango del
    // trigger cubre ~1.5 viewports, así que no pelean por el mismo elemento.)
    tl.to(
      tunnelState,
      {
        t: 1.0,
        ease: 'power2.inOut',
        duration: 1.4,
        onStart: () => {
          tunnelOrigin = captureRestSnapshot(index);
          applyTransitionState(index, 0.002, tunnelOrigin);
        },
        onUpdate: () => {
          applyTransitionState(index, tunnelState.t, tunnelOrigin);
        },
        onReverseComplete: () => {
          applyTransitionState(index, 0.0, tunnelOrigin);
          tunnelOrigin = null;
        },
      },
      3.8,
    )
      .to(polaroidCard, { opacity: 0, duration: 0.5, ease: 'power1.in' }, 3.8)
      .to([snapAnchor, snapLabel], { opacity: 0, duration: 0.4 }, 3.8)
      .to(railLineEl, { opacity: 0, duration: 0.4, ease: 'power1.in' }, 3.8);

    // FASE 5: FULL VIEW NÍTIDO (5.2 a 7.0)
    // La card la muestra el overlay fijo #fullview-card (drive por t en
    // applyTransitionState); la in-frame queda apagada para no duplicar.

    // FASE 6: TRANSICIÓN TÚNEL INVERSA: COMPRESIÓN (7.3 a 8.7)
    // Solapada con el regreso de la polaroid (7.5): antes había un hueco
    // 7.3→7.9 con la card ya fuera y el mesh encogiendo — de ahí la
    // sensación de que "desaparece todo de repente".
    // (La card in-frame no se anima: la muestra el overlay #fullview-card.)
    tl.to(
        tunnelState,
        {
          t: 0.0,
          ease: 'power2.inOut',
          duration: 1.4,
          onStart: () => {
            if (!tunnelOrigin) tunnelOrigin = captureRestSnapshot(index);
          },
          onUpdate: () => {
            applyTransitionState(index, tunnelState.t, tunnelOrigin);
          },
          onComplete: () => {
            applyTransitionState(index, 0.0, tunnelOrigin);
            tunnelOrigin = null;
          },
          onReverseStart: () => {
            if (!tunnelOrigin) tunnelOrigin = captureRestSnapshot(index);
          },
        },
        7.3,
      )
      .to(polaroidCard, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 7.5)
      .to([snapAnchor, snapLabel], { opacity: 1, duration: 0.4 }, 7.7)
      .to(railLineEl, { opacity: 1, duration: 0.4, ease: 'power1.out' }, 7.7);

    // FASE 7: SALIDA POR LA IZQUIERDA (8.6 a 10.0)
    tl.to(
      polaroidCard,
      { scale: 0.9, opacity: 0.5, ease: 'power1.in', duration: 1.2 },
      8.8,
    ).to(snapLabel, { opacity: 0.4, duration: 1.2 }, 8.8);
  });

  // Redimensionado dinámico
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    refreshCovers();
    ScrollTrigger.refresh();
    const currentStage = STAGES[currentStageStep];
    if (currentStage && currentStage.type === 'fullview') {
      applyTransitionState(currentStage.eraIdx, 1.0);
    } else if (currentStage && currentStage.type === 'polaroid') {
      applyTransitionState(currentStage.eraIdx, 0.0);
    }
  };
  window.addEventListener('resize', onResize);

  // =============================================================================
  // 5. Navegación Estricta por Stages Integrada con el Home
  // (Scroll nativo en Hero y Footer; 1 gesto = 1 stage dentro del Timeline)
  // =============================================================================
  let lastWheelTime = 0;

  const onWheel = (e) => {
    const st = scrollTween?.scrollTrigger;
    if (!st) return;

    const scrollY = window.scrollY;
    const isTimelineActive = scrollY >= st.start - 10 && scrollY <= st.end + 10;

    // Si el usuario está fuera del timeline (en el Hero o Footer), permitir scroll nativo
    if (!isTimelineActive) {
      return;
    }

    if (isStageTransitioning) {
      e.preventDefault();
      return;
    }

    // Caso 1: En Overview (stage 0) haciendo scroll hacia arriba -> Salir al Hero
    if (currentStageStep === 0 && e.deltaY < 0) {
      return;
    }

    // Caso 2: En el último stage haciendo scroll hacia abajo -> Salir al Footer
    if (currentStageStep === STAGES.length - 1 && e.deltaY > 0) {
      return;
    }

    const now = Date.now();
    if (now - lastWheelTime < 450) {
      e.preventDefault();
      return;
    }

    if (Math.abs(e.deltaY) > 20) {
      e.preventDefault();
      lastWheelTime = now;
      if (e.deltaY > 0 && currentStageStep < STAGES.length - 1) {
        goToStageStep(currentStageStep + 1);
      } else if (e.deltaY < 0 && currentStageStep > 0) {
        goToStageStep(currentStageStep - 1);
      }
    }
  };
  window.addEventListener('wheel', onWheel, { passive: false });

  // Gestos táctiles
  let touchStartY = 0;
  const onTouchStart = (e) => {
    if (e.touches.length > 0) {
      touchStartY = e.touches[0].clientY;
    }
  };
  const onTouchMove = (e) => {
    const st = scrollTween?.scrollTrigger;
    if (!st) return;

    const scrollY = window.scrollY;
    const isTimelineActive = scrollY >= st.start - 10 && scrollY <= st.end + 10;
    if (!isTimelineActive) return;

    if (isStageTransitioning) {
      e.preventDefault();
      return;
    }

    if (e.touches.length > 0) {
      const deltaY = touchStartY - e.touches[0].clientY;
      if (currentStageStep === 0 && deltaY < 0) return; // Hacia el Hero
      if (currentStageStep === STAGES.length - 1 && deltaY > 0) return; // Hacia el Footer

      if (Math.abs(deltaY) > 45) {
        e.preventDefault();
        touchStartY = e.touches[0].clientY;
        if (deltaY > 0 && currentStageStep < STAGES.length - 1) {
          goToStageStep(currentStageStep + 1);
        } else if (deltaY < 0 && currentStageStep > 0) {
          goToStageStep(currentStageStep - 1);
        }
      }
    }
  };
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });

  // Teclado
  const onKeyDown = (e) => {
    const st = scrollTween?.scrollTrigger;
    if (!st) return;

    const scrollY = window.scrollY;
    const isTimelineActive = scrollY >= st.start - 10 && scrollY <= st.end + 10;
    if (!isTimelineActive) return;

    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(e.key)) {
      if (currentStageStep === STAGES.length - 1) return; // Ceder scroll al footer
      e.preventDefault();
      if (!isStageTransitioning && currentStageStep < STAGES.length - 1) {
        goToStageStep(currentStageStep + 1);
      }
    } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
      if (currentStageStep === 0) return; // Ceder scroll al hero
      e.preventDefault();
      if (!isStageTransitioning && currentStageStep > 0) {
        goToStageStep(currentStageStep - 1);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToStageStep(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToStageStep(STAGES.length - 1);
    }
  };
  window.addEventListener('keydown', onKeyDown);

  // Blindaje viewport: si el viewport/layout cambió durante la carga (el pin
  // y el shift se calculan con el ancho real), recalcular al estabilizar.
  const refreshOnStable = () => ScrollTrigger.refresh();
  ScrollTrigger.refresh();
  window.addEventListener('load', refreshOnStable);
  if (document.fonts?.ready) document.fonts.ready.then(refreshOnStable);

  // Retorno de limpieza completa (con getST para restaurar progreso en re-init)
  const cleanup = () => {
    dead = true;
    stageTween?.kill();
    stageTween = null;
    cancelAnimationFrame(animFrameId);
    window.removeEventListener('load', refreshOnStable);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('keydown', onKeyDown);

    ScrollTrigger.getAll().forEach((t) => {
      if (!foreignTriggers.has(t)) t.kill();
    });
    renderer.dispose();
    rootEl._tlCleanup = null;
  };
  cleanup.getST = () => scrollTween?.scrollTrigger ?? null;
  cleanup.getGeom = () => ({ w: window.innerWidth, sw: track.scrollWidth });
  rootEl._tlCleanup = cleanup;
  return cleanup;
}
