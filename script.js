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

// ---------- contact form ----------
// Requests are emailed to you through Web3Forms (web3forms.com).
// Paste the access key that Web3Forms emails you between the quotes below.
const WEB3FORMS_ACCESS_KEY = 'PASTE_YOUR_ACCESS_KEY_HERE';

const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const submitBtn = form.querySelector('button[type="submit"]');

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

form.addEventListener('submit', async (e) => {
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

  // lock the button so the request can't be double-sent
  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  status.style.color = '#4A6741';
  status.textContent = '';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `New quote request from ${name}`,
        from_name: 'JDSM Landscape Website',
        name: name,
        email: email,
        phone: form.phone.value.trim() || 'Not provided',
        service: form.service.value || 'Not specified',
        message: form.message.value.trim() || 'No details provided'
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Request failed');
    }

    status.style.color = '#4A6741';
    status.textContent = `Thanks, ${name.split(' ')[0]} — we'll be in touch within one to three business days.`;
    form.reset();
  } catch (err) {
    console.error(err);
    status.style.color = '#b3432f';
    status.textContent = 'Something went wrong sending that. Please call (480) 544-3994 or email jdsmlandscape@gmail.com.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  }
});

// ---------- footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();
