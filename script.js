// script.js - control de pestañas, navegación y tema
(function(){
  const tablinks = document.querySelectorAll('.tablink');
  const panels = document.querySelectorAll('.panel');
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');
  const toggleThemeBtn = document.getElementById('toggle-theme');

  function activateTab(name){
    tablinks.forEach(a=>{
      a.classList.toggle('active', a.dataset.tab===name);
    });
    panels.forEach(p=>{
      p.classList.toggle('active', p.id===name);
    });
    // close nav on mobile after click
    if(navList && navList.classList.contains('show')) navList.classList.remove('show');
  }

  tablinks.forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const tab = a.dataset.tab;
      activateTab(tab);
      history.replaceState(null, '', `#${tab}`);
    });
  });

  // inicializar desde hash si existe
  if(location.hash){
    const name = location.hash.replace('#','');
    const exists = Array.from(tablinks).some(a=>a.dataset.tab===name);
    if(exists) activateTab(name);
  }

  // nav toggle para mobile
  if(navToggle && navList){
    navToggle.addEventListener('click', ()=>{
      const open = navList.classList.toggle('show');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Suscribir - ejemplo pequeño
  const btnSub = document.getElementById('btn-suscribir');
  if(btnSub){
    btnSub.addEventListener('click', ()=>{
      btnSub.textContent = 'Gracias ✨';
      btnSub.classList.add('primary');
      setTimeout(()=> btnSub.textContent = 'Suscribirme', 2200);
    });
  }

  // alternar tema (dark/light) usando atributo data-theme en body
  const root = document.documentElement;
  function setTheme(theme){
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
  // cargar preferencia
  const saved = localStorage.getItem('theme');
  if(saved) setTheme(saved);
  else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches){
    setTheme('light');
  } else setTheme('dark');

  if(toggleThemeBtn){
    toggleThemeBtn.addEventListener('click', ()=>{
      const now = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      setTheme(now);
    });
  }

  // Manejo del formulario de login
  const loginForm = document.getElementById('login-form');
  const loginFeedback = document.getElementById('login-feedback');
  const togglePw = document.getElementById('toggle-pw');

  if(togglePw){
    togglePw.addEventListener('click', ()=>{
      const pw = document.getElementById('password');
      if(pw.type === 'password'){
        pw.type = 'text';
        togglePw.textContent = 'Ocultar';
      } else { pw.type = 'password'; togglePw.textContent = 'Mostrar'; }
    });
  }

  if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const form = new FormData(loginForm);
      const email = form.get('email');
      // simulación simple de inicio de sesión
      loginFeedback.textContent = 'Iniciando sesión...';
      setTimeout(()=>{
        loginFeedback.textContent = `Bienvenido, ${email || 'usuario'} 🎉`;
      }, 900);
    });
  }

  // ------------------ Reservas / booking ------------------
  const reserveButtons = document.querySelectorAll('.reserve-btn');
  const reserveModal = document.getElementById('reserve-modal');
  const reserveForm = document.getElementById('reserve-form');
  const reserveFeedback = document.getElementById('reserve-feedback');
  const modalClose = reserveModal && reserveModal.querySelector('.modal-close');
  const modalCancel = reserveModal && reserveModal.querySelector('.modal-cancel');

  function openModal(cls, time){
    if(!reserveModal) return;
    reserveModal.setAttribute('aria-hidden','false');
    document.getElementById('res-class').value = cls;
    document.getElementById('res-time').value = time;
    document.getElementById('res-name').focus();
  }
  function closeModal(){
    if(!reserveModal) return;
    reserveModal.setAttribute('aria-hidden','true');
    reserveFeedback.textContent = '';
    reserveForm.reset();
  }

  reserveButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      openModal(btn.dataset.class, btn.dataset.time);
    });
  });
  // inicializar contadores de plazas desde data-capacity o localStorage
  (function initCapacities(){
    const key = 'ananda_capacities_v1';
    const stored = JSON.parse(localStorage.getItem(key) || '{}');
    document.querySelectorAll('.class-card').forEach(card=>{
      const cls = card.querySelector('.class-head')?.textContent?.trim();
      const timeText = card.querySelector('.meta')?.textContent?.split('—')[0]?.trim();
      const id = `${cls}||${timeText}`;
      const base = parseInt(card.getAttribute('data-capacity')||'0',10);
      const current = (stored[id] !== undefined) ? stored[id] : base;
      const seatsEl = card.querySelector('.seats');
      if(seatsEl) seatsEl.textContent = current;
      // desactivar botón si no hay plazas
      const btn = card.querySelector('.reserve-btn');
      if(btn) btn.disabled = current <= 0;
    });
  })();
  if(modalClose) modalClose.addEventListener('click', closeModal);
  if(modalCancel) modalCancel.addEventListener('click', closeModal);

  if(reserveForm){
    reserveForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(reserveForm);
      const name = fd.get('name');
      const email = fd.get('email');
      const cls = fd.get('class');
      const time = fd.get('time');
      reserveFeedback.textContent = 'Confirmando reserva...';
      // guardar en localStorage como ejemplo (en producción llamar a API)
      const key = 'ananda_reservas_v1';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({name, email, class: cls, time, created: new Date().toISOString()});
      localStorage.setItem(key, JSON.stringify(existing));
      // decrementar plazas
      const capKey = 'ananda_capacities_v1';
      const capacities = JSON.parse(localStorage.getItem(capKey) || '{}');
      const id = `${cls}||${time}`;
      const getBaseCapacity = () => {
        const el = Array.from(document.querySelectorAll('.class-card')).find(c=> (c.querySelector('.class-head')?.textContent||'').trim()===cls);
        return parseInt(el?.getAttribute('data-capacity')||'0',10);
      };
      const currentCapacity = capacities[id] !== undefined ? capacities[id] : getBaseCapacity();
      capacities[id] = Math.max(0, currentCapacity - 1);
      localStorage.setItem(capKey, JSON.stringify(capacities));
      // actualizar UI
      const card = Array.from(document.querySelectorAll('.class-card')).find(c=> (c.querySelector('.class-head')?.textContent||'').trim()===cls && (c.querySelector('.meta')?.textContent||'').includes(time));
      if(card){
        const seatsEl = card.querySelector('.seats');
        if(seatsEl) seatsEl.textContent = capacities[id];
        const btn = card.querySelector('.reserve-btn');
        if(btn && capacities[id] <= 0) btn.disabled = true;
      }
      setTimeout(()=>{
        reserveFeedback.textContent = `Reserva confirmada para ${name} — ${cls} (${time})`;
        // cerrar modal después
        setTimeout(()=> closeModal(), 1600);
      }, 800);
    });
  }

  // hero reservar ahora
  const btnReservarHero = document.getElementById('btn-reservar-hero');
  if(btnReservarHero){
    btnReservarHero.addEventListener('click', ()=>{
      // activar panel reservas y hacer scroll
      if(typeof activateTab === 'function') activateTab('reservas');
      const r = document.getElementById('reservas');
      if(r) r.scrollIntoView({behavior:'smooth'});
    });
  }

})();
