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

// ---------- header shadow on scroll ----------
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
// Quote requests are emailed to jdsmlandscape@gmail.com through Web3Forms (web3forms.com).
//
// ONE-TIME SETUP (2 minutes):
//   1. Go to https://web3forms.com and enter jdsmlandscape@gmail.com
//   2. They email you a free "access key"
//   3. Paste it between the quotes below (done)
const WEB3FORMS_ACCESS_KEY = '4b2fb20a-d293-47e0-8733-e4c0eab8570f';
const BUSINESS_EMAIL = 'jdsmlandscape@gmail.com';
const BUSINESS_PHONE = '(480) 544-3994';

const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const submitBtn = form.querySelector('button[type="submit"]');

function field(name) {
  return form.elements.namedItem(name);
}

function setError(fieldName, message) {
  const row = field(fieldName).closest('.form-row');
  const errorEl = form.querySelector('.form-error[data-for="' + fieldName + '"]');
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

// Builds a pre-filled email to the business so a request is never lost,
// even if the form service is unavailable.
function buildMailto(d) {
  const body =
    'Name: ' + d.name + '\n' +
    'Email: ' + d.email + '\n' +
    'Phone: ' + d.phone + '\n' +
    'Service: ' + d.service + '\n\n' +
    d.message;
  return 'mailto:' + BUSINESS_EMAIL +
    '?subject=' + encodeURIComponent('New quote request from ' + d.name) +
    '&body=' + encodeURIComponent(body);
}

function showStatus(text, color) {
  formStatus.style.color = color;
  formStatus.textContent = text;
}

function showFallback(d) {
  formStatus.style.color = '#b3432f';
  formStatus.textContent = 'We couldn\u2019t send that automatically. ';
  const link = document.createElement('a');
  link.href = buildMailto(d);
  link.textContent = 'Click here to email us instead';
  link.style.textDecoration = 'underline';
  formStatus.appendChild(link);
  formStatus.appendChild(document.createTextNode(' or call ' + BUSINESS_PHONE + '.'));
}

// Sends the request to Web3Forms. If the browser blocks the normal reply
// (network / CORS / offline-file quirks), it re-sends in a way that doesn't
// need a readable reply, so the email still goes through.
async function sendRequest(d) {
  const url = 'https://api.web3forms.com/submit';
  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: 'New quote request from ' + d.name,
    from_name: 'JDSM Landscape Website',
    name: d.name,
    email: d.email,
    phone: d.phone,
    service: d.service,
    message: d.message
  };

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (networkErr) {
    // Browser couldn't read the reply. Re-send as a simple form post.
    const fd = new FormData();
    Object.keys(payload).forEach(k => fd.append(k, payload[k]));
    await fetch(url, { method: 'POST', mode: 'no-cors', body: fd });
    return; // request was delivered; reply is intentionally unreadable
  }

  let result = {};
  try { result = await response.json(); } catch (parseErr) { /* non-JSON reply */ }

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Request failed (' + response.status + ')');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formStatus.textContent = '';

  const data = {
    name: field('name').value.trim(),
    email: field('email').value.trim(),
    phone: field('phone').value.trim() || 'Not provided',
    service: field('service').value || 'Not specified',
    message: field('message').value.trim() || 'No details provided'
  };

  let valid = true;

  if (!data.name) {
    setError('name', 'Please enter your name.');
    valid = false;
  } else {
    setError('name', '');
  }

  if (!data.email) {
    setError('email', 'Please enter your email.');
    valid = false;
  } else if (!isValidEmail(data.email)) {
    setError('email', 'That email doesn\u2019t look right.');
    valid = false;
  } else {
    setError('email', '');
  }

  if (!valid) {
    showStatus('Please fix the fields above.', '#b3432f');
    return;
  }

  // Access key not added yet: open a pre-filled email so the request still reaches the business.
  if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'PASTE_YOUR_ACCESS_KEY_HERE') {
    showStatus('Opening your email app to send this request\u2026', '#4A6741');
    window.location.href = buildMailto(data);
    return;
  }

  // lock the button so the request can't be double-sent
  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  showStatus('', '#4A6741');

  try {
    await sendRequest(data);
    showStatus('Thanks, ' + data.name.split(' ')[0] + ' \u2014 we\u2019ll be in touch within one to three business days.', '#4A6741');
    form.reset();
  } catch (err) {
    console.error(err);
    showFallback(data);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  }
});

// ---------- footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();