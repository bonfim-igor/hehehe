// seleciona elementos
const slides = Array.from(document.querySelectorAll('.slide'));
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const messageEl = document.getElementById('message');
const finalQuestionContainer = document.getElementById('finalQuestionContainer');
const yesBtn = document.getElementById('yes');
const noBtn = document.getElementById('no');
const finalText = document.getElementById('finalText');
const overlay = document.getElementById('overlay');
const music = document.getElementById('bgMusic');
const musicControl = document.getElementById('musicControl');

let current = 0;
const visited = new Set();

// mensagens do carrossel (opcional)
const messages = [
  "Uma de nossas primeiras lembranças juntos 🥰",
  "Dia 19/08 sempre será uma data muito especial 💙",
  "Essa foi a primeira vez que te vi, fiquei UAUUUU 😍",
  "Um dia iremos refazer essa foto porém IRL!!! ❤️"
];

// garantias: se não houver slides, aborta
if (!slides.length) {
  console.error('Nenhum slide encontrado.');
}

// função que atualiza classes left/active/right e toca vídeo central
function updateSlides() {
  slides.forEach(s => s.classList.remove('left','active','right'));
  const leftIndex = (current - 1 + slides.length) % slides.length;
  const rightIndex = (current + 1) % slides.length;
  slides[leftIndex].classList.add('left');
  slides[current].classList.add('active');
  slides[rightIndex].classList.add('right');

  // marcar como visitado
visited.add(current);

// mostrar pergunta final somente quando todos os slides forem visitados
if (visited.size === slides.length) {
  finalQuestionContainer.style.display = 'block'; // mostra o container
  setTimeout(() => { // fade-in suave
    finalQuestionContainer.style.opacity = '1';
  }, 50);
}

  // pausar todos os vídeos e tocar o central (se houver)
  slides.forEach(slide => {
    const v = slide.querySelector('video');
    if (v) v.pause();
  });
  const vid = slides[current].querySelector('video');
  if (vid) {
    vid.currentTime = 0;
    const playPromise = vid.play();
    // alguns navegadores bloqueiam autoplay — catch para não quebrar
    if (playPromise && playPromise.catch) playPromise.catch(()=>{/* autoplay bloqueado */});
  }

  // atualizar mensagem (máquina de escrever)
  typeMessage(messages[current] || "");
}

// navegação
nextBtn.addEventListener('click', () => {
  current = (current + 1) % slides.length;
  updateSlides();
});
prevBtn.addEventListener('click', () => {
  current = (current - 1 + slides.length) % slides.length;
  updateSlides();
});

// inicializa
updateSlides();

// máquina de escrever simples
function typeMessage(text){
  messageEl.textContent = '';
  messageEl.classList.add('typing');
  let i = 0;
  clearInterval(typeMessage._interval);
  typeMessage._interval = setInterval(()=>{
    if(i < text.length) { messageEl.textContent += text[i++]; }
    else { clearInterval(typeMessage._interval); messageEl.classList.remove('typing'); }
  }, 30);
}

// Função para tocar música com fade-in
function playMusicWithFade(maxVolume = 0.10, step = 0.02, interval = 200) {
  music.volume = 0;
  music.muted = false;

  const playPromise = music.play();
  if (playPromise && playPromise.catch) {
    playPromise.catch(() => {
      console.log("Autoplay bloqueado. Música tocará após interação do usuário.");
    });
  }

  // fade-in
  let vol = 0;
  const fadeIn = setInterval(() => {
    if (vol < maxVolume) {
      vol += step;
      if (vol > maxVolume) vol = maxVolume;
      music.volume = vol;
    } else {
      clearInterval(fadeIn);
    }
  }, interval);
}

// Quando toda a página carregar
window.addEventListener('load', () => {
  playMusicWithFade(); // chama a função para tocar a música após o alerta
});

// Botão de pausar/reproduzir música
musicControl.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    musicControl.textContent = 'Pausar Música';
  } else {
    music.pause();
    musicControl.textContent = 'Reproduzir Música';
  }
});

function moveNoButton() {
  const padding = 12; // distância da borda
  const w = noBtn.offsetWidth;
  const h = noBtn.offsetHeight;

  // posição visível da viewport
  const minX = padding;
  const maxX = window.innerWidth - w - padding;
  const minY = window.scrollY + padding; // adiciona scroll
  const maxY = window.scrollY + window.innerHeight - h - padding;

  const x = Math.random() * (maxX - minX) + minX;
  const y = Math.random() * (maxY - minY) + minY;

  noBtn.style.position = 'absolute';
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

// disparar ao passar o mouse
noBtn.addEventListener('mouseenter', moveNoButton);

// SIM -> mostra texto multilinha + confetes
yesBtn.addEventListener('click', () => {
  overlay.style.backdropFilter = 'blur(8px)';
  finalText.style.display = 'block';
  finalText.textContent = `UHUUUUUL\nnamoro oficializadoooo!! 🎉🥳\nAAAAAAAAAAAAAAAAAAAAAAAA`;
  
  noBtn.style.filter = 'blur(4px)'; // ajusta o valor conforme desejar

  confettiEffect();
  setTimeout(()=>{
    finalText.style.display = 'none';
    overlay.style.backdropFilter = 'blur(0px)';
    noBtn.style.filter = '';
  }, 6000);
});

// confetes com requestAnimationFrame para fluidez
function confettiEffect(){
  const confs = [];
  const colors = ['#ff6b6b','#ffd166','#4ecdc4','#6a4cff','#ff9f1c'];
  const count = 400;

  for (let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'confetti';
    const size = Math.random()*12 + 6;
    el.style.width = el.style.height = `${size}px`;
    el.style.left = `${Math.random()*window.innerWidth}px`;
    el.style.top = `${-Math.random()*300 - 20}px`;
    el.style.background = colors[Math.floor(Math.random()*colors.length)];
    el.style.opacity = 0.95;
    el.style.transform = `translate(0,0)`;
    document.body.appendChild(el);
    confs.push({
      el,
      x: parseFloat(el.style.left),
      y: parseFloat(el.style.top),
      vx: (Math.random()-0.5)*2.5,
      vy: Math.random()*2 + 2,
      vr: (Math.random()-0.5)*6
    });
  }

  let raf;
  function step(){
    confs.forEach(c=>{
      c.vy += 0.9; // gravidade
      c.x += c.vx;
      c.y += c.vy;
      c.vx *= 0.998;
      c.el.style.transform = `translate(${c.x}px, ${c.y}px) rotate(${c.vr}deg)`;
      // loop na vertical
      if (c.y > window.innerHeight + 60) {
        c.y = -60 - Math.random()*120;
        c.x = Math.random()*window.innerWidth;
        c.vy = Math.random()*2 + 1;
      }
    });
    raf = requestAnimationFrame(step);
  }
  raf = requestAnimationFrame(step);

  // remover tudo após 6s
  setTimeout(()=>{
    cancelAnimationFrame(raf);
    confs.forEach(c=>c.el.remove());
  },6000);
}

// Função para criar partículas caindo
function createParticles(count=50) {
  const particles = [];
  for(let i=0; i<count; i++){
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left = Math.random() * window.innerWidth + 'px';
    p.style.top = Math.random() * -window.innerHeight + 'px';
    document.body.appendChild(p);
    particles.push(p);
  }
  setInterval(() => {
    particles.forEach(p => {
      let y = parseFloat(p.style.top);
      let x = parseFloat(p.style.left);
      y += Math.random() * 2 + 1;
      if(y > window.innerHeight) y = -10;
      x += Math.random() * 1 - 0.5;
      p.style.top = y + 'px';
      p.style.left = x + 'px';
    });
  }, 16);
}

// Chama a função
createParticles(100);

// acessibilidade: fechar overlay e confetes se redeclocado (opcional)
window.addEventListener('resize', ()=> {
  // se o usuário redimensionar, reposicionar 'no' se estiver fora
  const rect = noBtn.getBoundingClientRect();
  if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
    moveNoButton();
  }
});
