/* script.js
   - controla: apertura del sobre + redirección (index.html)
             - genera birretes que caen en carta.html
             - controla reproducción de audio en carta.html (play fallback)
*/

/* --- COMMON UTIL: small random helper --- */
function rand(min, max){ return Math.random()*(max-min)+min }

/* ---------- INDEX.HTML behavior (sobre) ---------- */
(function indexHandler(){
  const sobre = document.getElementById('sobre');
  if(!sobre) return; // si no estamos en index, salir

  // Al hacer click, animar la tapa y después redirigir
  sobre.addEventListener('click', () => {
    sobre.classList.add('abierto'); // esto rotará la tapa (CSS)
    // sonido opcional al abrir (puedes añadir un mp3 si quieres)
    setTimeout(() => {
      // pequeña transición antes de navegar
      window.location.href = 'carta.html';
    }, 950);
  });
})();

/* ---------- CARTA.HTML behavior (birretes + audio) ---------- */
(function cartaHandler(){
  // verificamos si estamos en carta
  const fallingContainer = document.getElementById('falling-container');
  const audioEl = document.getElementById('bgAudio');
  const audioControl = document.getElementById('audioControl');
  const toggleAudioBtn = document.getElementById('toggleAudio');

  if(fallingContainer){
    // generar N birretes con posiciones y velocidades aleatorias
    const COUNT = 14;
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

    for(let i=0;i<COUNT;i++){
      const img = document.createElement('img');
      img.src = 'img/birrete.png';               // usa la misma imagen, pero en escala de grises (CSS)
      img.className = 'falling-birrete';
      // pos inicial horizontal
      const left = rand(-5, 105); // puede empezar ligeramente fuera del viewport para naturalidad
      img.style.left = left + 'vw';

      // tamaño aleatorio para profundidad
      const scale = rand(0.55, 1.0);
      img.style.width = (28 * scale) + 'px';

      // delay y duration aleatorios
      const delay = rand(0, 6); // segundos
      const duration = rand(6, 14); // segundos

      img.style.animation = `fall ${duration}s linear ${delay}s forwards`;
      // subtle horizontal sway via CSS transform (use JS to add small rotate initial)
      img.style.transform = `translateY(-120px) rotate(${rand(-25,25)}deg)`;
      img.style.opacity = rand(0.12, 0.28);

      // append
      fallingContainer.appendChild(img);

      // cuando termine la animación, reiniciamos la pieza (loop feel)
      (function resetOnEnd(el, dur){
        el.addEventListener('animationend', () => {
          // tiny timeout to avoid layout thrash
          setTimeout(()=>{
            // reposition and restart animation by replacing node
            el.remove();
            const n = el.cloneNode();
            fallingContainer.appendChild(n);
            // recompute random values
            n.style.left = rand(-5, 105) + 'vw';
            const s = rand(0.55, 1.0);
            n.style.width = (28 * s) + 'px';
            const d = rand(6, 14);
            const del = rand(0, 6);
            n.style.animation = `fall ${d}s linear ${del}s forwards`;
            n.style.transform = `translateY(-120px) rotate(${rand(-25,25)}deg)`;
            n.style.opacity = rand(0.12, 0.28);
            resetOnEnd(n, d);
          }, 250);
        }, { once:true });
      })(img, duration);
    }
  }

  // AUDIO: intentar autoplay; si no, mostrar control para que usuario lo active
  if(audioEl){
    // try to play (browsers may block)
    const playPromise = audioEl.play();
    if(playPromise !== undefined){
      playPromise.then(()=> {
        // autoplay succeeded -> hide control
        if(audioControl) audioControl.style.display = 'none';
      }).catch(() => {
        // autoplay blocked -> show control
        if(audioControl){
          audioControl.style.display = 'block';
          // toggle button attaches below
        }
      });
    }
  }

  if(toggleAudioBtn && audioEl){
    toggleAudioBtn.addEventListener('click', () => {
      if(audioEl.paused){
        audioEl.play().catch(()=>{ /* ignore */ });
        toggleAudioBtn.textContent = '⏸︎ Pausar música';
      } else {
        audioEl.pause();
        toggleAudioBtn.textContent = '⏵︎ Reproducir música';
      }
    });
  }
})();
