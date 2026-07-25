// footer year
document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());

// mobile nav
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

// scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
}

// gallery filters (gallery.html only)
const filterBtns = document.querySelectorAll('.gal-filters button');
const galCards = document.querySelectorAll('.gal-card');
if (filterBtns.length && galCards.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
      });
    });
  });
}

// gallery lightbox (gallery.html only)
const lightbox = document.getElementById('lightbox');
if (lightbox && galCards.length) {
  const lbArt = document.getElementById('lightboxArt');
  const lbCat = document.getElementById('lightboxCat');
  const lbTitle = document.getElementById('lightboxTitle');
  const lbClose = document.getElementById('lightboxClose');

  const openLightbox = (card) => {
    const svg = card.querySelector('.tone-art');
    const img = card.querySelector('img');
    const cat = card.querySelector('.cat')?.textContent || '';
    const title = card.querySelector('h4')?.textContent || '';
    lbArt.textContent = ''; // clear safely, no innerHTML string injection
    const media = svg || img;
    if (media) lbArt.appendChild(media.cloneNode(true));
    lbCat.textContent = cat;
    lbTitle.textContent = title;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  galCards.forEach(card => card.addEventListener('click', () => openLightbox(card)));
  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
}

// Web3Forms submission (contact.html only)
const form = document.getElementById('enquiryForm');
if (form) {
  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.className = 'form-status';
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: json
      });
      const result = await res.json();

      if (result.success) {
        statusEl.textContent = 'Thank you — we\'ll be in touch within two working days.';
        statusEl.classList.add('ok');
        form.reset();
      } else {
        statusEl.textContent = result.message || 'Something went wrong. Please try again.';
        statusEl.classList.add('err');
      }
    } catch (err) {
      statusEl.textContent = 'Network error — please try again or email us directly.';
      statusEl.classList.add('err');
    } finally {
      submitBtn.textContent = 'Send Enquiry';
      submitBtn.disabled = false;
    }
  });
}

// hero gallery auto-scroll (index.html only)
const scrollMask = document.querySelector('.scroll-mask');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (scrollMask && !prefersReducedMotion) {
  const track = scrollMask.querySelector('.scroll-track');
  let paused = false;
  let lastTime = null;
  const speed = 0.035; // px per ms

  const loopHeight = () => track.scrollHeight / 2; // content is duplicated once

  scrollMask.addEventListener('mouseenter', () => { paused = true; });
  scrollMask.addEventListener('mouseleave', () => { paused = false; });
  scrollMask.addEventListener('touchstart', () => { paused = true; }, { passive: true });
  scrollMask.addEventListener('touchend', () => { paused = false; }, { passive: true });
  scrollMask.addEventListener('wheel', () => {
    paused = true;
    clearTimeout(scrollMask._resumeTimer);
    scrollMask._resumeTimer = setTimeout(() => { paused = false; }, 1500);
  }, { passive: true });

  function step(time) {
    if (lastTime === null) lastTime = time;
    const delta = time - lastTime;
    lastTime = time;

    if (!paused) {
      scrollMask.scrollTop += speed * delta;
      if (scrollMask.scrollTop >= loopHeight()) {
        scrollMask.scrollTop -= loopHeight();
      }
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
