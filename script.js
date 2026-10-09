// ---------- mobile nav ----------
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ---------- header background on scroll ----------
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 20 ? '0 2px 12px rgba(0,0,0,0.15)' : 'none';
});

// ---------- scroll reveal for service rows ----------
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in-view'));
}

// ---------- contact form validation ----------
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

function setError(fieldName, message) {
  const row = form.querySelector(`#${fieldName}`).closest('.form-row');
  const errorEl = form.querySelector(`.form-error[data-for="${fieldName}"]`);
  if (message) {
    row.classList.add('error');
    if (errorEl) errorEl.textContent = message;
  } else {
    row.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  status.textContent = '';

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  let valid = true;

  if (!name) {
    setError('name', 'Please enter your name.');
    valid = false;
  } else {
    setError('name', '');
  }

  if (!email) {
    setError('email', 'Please enter your email.');
    valid = false;
  } else if (!isValidEmail(email)) {
    setError('email', 'That email doesn\'t look right.');
    valid = false;
  } else {
    setError('email', '');
  }

  if (!valid) {
    status.style.color = '#b3432f';
    status.textContent = 'Please fix the fields above.';
    return;
  }

  // No backend wired up yet — this simulates a successful send.
  status.style.color = '#4A6741';
  status.textContent = `Thanks, ${name.split(' ')[0]} — we'll be in touch within one business day.`;
  form.reset();
});

// ---------- footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();
