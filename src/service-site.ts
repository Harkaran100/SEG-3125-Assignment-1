/**
 * service-site.ts — AutoFix Pro interactive TypeScript entry point
 * Handles: navbar, scroll-reveal, smooth scroll, footer year, multi-step booking form
 */
export {}; // treat as ES module — prevents global scope collisions with main.ts

// ─── Helpers (declared first so they are available anywhere in this file) ────
function showError(id: string, msg: string): void {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.classList.remove('hidden');
  }
}

function clearError(id: string): void {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = '';
    el.classList.add('hidden');
  }
}

// ─── 1. Dynamic footer year ──────────────────────────────────────────────────
document.querySelectorAll<HTMLSpanElement>('#footer-year').forEach((el) => {
  el.textContent = new Date().getFullYear().toString();
});

// ─── 2. Navbar scroll shadow ─────────────────────────────────────────────────
const navbar = document.getElementById('af-navbar');
if (navbar) {
  window.addEventListener(
    'scroll',
    () => navbar.classList.toggle('shadow-lg', window.scrollY > 10),
    { passive: true }
  );
}

// ─── 3. Mobile nav toggle ────────────────────────────────────────────────────
const menuBtn = document.getElementById('af-menu-btn') as HTMLButtonElement | null;
const mobileMenu = document.getElementById('af-mobile-menu') as HTMLDivElement | null;

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.toggle('hidden');
    menuBtn.setAttribute('aria-expanded', String(!isHidden));
    menuBtn.classList.toggle('menu-open', !isHidden);
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.classList.remove('menu-open');
    });
  });

  document.addEventListener('click', (e: MouseEvent) => {
    const header = document.querySelector('header');
    if (header && !header.contains(e.target as Node)) {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.classList.remove('menu-open');
    }
  });
}

// ─── 4. Smooth scroll with fixed-navbar offset ───────────────────────────────
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e: MouseEvent) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ─── 5. Scroll-reveal ────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        revealObserver.unobserve(entry.target);
      }
    }),
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => revealObserver.observe(el));

// ─── 6. Set min date on booking date input to today ──────────────────────────
const dateInput = document.getElementById('booking-date') as HTMLInputElement | null;
if (dateInput) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}

// ─── 7. Multi-step booking form ──────────────────────────────────────────────
interface BookingState {
  step: number;
  service: string;
  servicePrice: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  vehicleInfo: string;
}

const state: BookingState = {
  step: 1,
  service: '',
  servicePrice: '',
  date: '',
  time: '',
  name: '',
  phone: '',
  email: '',
  vehicleInfo: '',
};

const TOTAL_STEPS = 3;

function showStep(n: number): void {
  for (let i = 1; i <= TOTAL_STEPS + 1; i++) {
    const el = document.getElementById(`booking-step-${i}`);
    if (el) el.classList.toggle('hidden', i !== n);
  }
  // Update progress bar
  const fill = document.getElementById('progress-fill');
  if (fill) {
    const pct = n <= TOTAL_STEPS ? ((n - 1) / TOTAL_STEPS) * 100 : 100;
    fill.style.width = `${pct}%`;
  }
  // Update step dots
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.getElementById(`step-dot-${i}`);
    if (!dot) continue;
    const active = i <= n;
    dot.classList.toggle('bg-orange-500', active);
    dot.classList.toggle('text-white', active);
    dot.classList.toggle('border-orange-500', active);
    dot.classList.toggle('bg-white', !active);
    dot.classList.toggle('text-slate-400', !active);
    dot.classList.toggle('border-slate-300', !active);
  }
}

// ── Service card selection ────────────────────────────────────────────────────
document.querySelectorAll<HTMLElement>('.service-option').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll<HTMLElement>('.service-option').forEach((c) => {
      c.classList.remove('ring-2', 'ring-orange-500', 'bg-orange-50', 'border-orange-300');
      c.classList.add('border-slate-200');
    });
    card.classList.add('ring-2', 'ring-orange-500', 'bg-orange-50', 'border-orange-300');
    card.classList.remove('border-slate-200');
    state.service = card.dataset.service ?? '';
    state.servicePrice = card.dataset.price ?? '';
    clearError('error-step-1');
  });
});

// ── Time slot selection ───────────────────────────────────────────────────────
document.querySelectorAll<HTMLElement>('.time-slot').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll<HTMLElement>('.time-slot').forEach((b) => {
      b.classList.remove('bg-orange-500', 'text-white', 'border-orange-500');
      b.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
    });
    btn.classList.add('bg-orange-500', 'text-white', 'border-orange-500');
    btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-200');
    state.time = btn.dataset.time ?? '';
    clearError('error-step-2');
  });
});

// ── Navigation buttons ────────────────────────────────────────────────────────
document.getElementById('next-step-1')?.addEventListener('click', () => {
  if (!state.service) {
    showError('error-step-1', 'Please select a service to continue.');
    return;
  }
  clearError('error-step-1');
  state.step = 2;
  showStep(2);
  scrollToBooking();
});

document.getElementById('next-step-2')?.addEventListener('click', () => {
  const di = document.getElementById('booking-date') as HTMLInputElement | null;
  state.date = di?.value ?? '';
  if (!state.date) {
    showError('error-step-2', 'Please select a date.');
    return;
  }
  if (!state.time) {
    showError('error-step-2', 'Please select an available time slot.');
    return;
  }
  clearError('error-step-2');
  state.step = 3;
  showStep(3);
  scrollToBooking();
});

document.getElementById('back-step-2')?.addEventListener('click', () => {
  state.step = 1;
  showStep(1);
  scrollToBooking();
});

document.getElementById('back-step-3')?.addEventListener('click', () => {
  state.step = 2;
  showStep(2);
  scrollToBooking();
});

// ── Form submission ───────────────────────────────────────────────────────────
document.getElementById('booking-form')?.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;

  const nameEl = form.querySelector<HTMLInputElement>('#contact-name');
  const phoneEl = form.querySelector<HTMLInputElement>('#contact-phone');
  const emailEl = form.querySelector<HTMLInputElement>('#contact-email');
  const vehicleEl = form.querySelector<HTMLInputElement>('#contact-vehicle');

  state.name = nameEl?.value.trim() ?? '';
  state.phone = phoneEl?.value.trim() ?? '';
  state.email = emailEl?.value.trim() ?? '';
  state.vehicleInfo = vehicleEl?.value.trim() ?? '';

  if (!state.name || !state.phone || !state.email) {
    showError('error-step-3', 'Please fill in all required fields.');
    return;
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    showError('error-step-3', 'Please enter a valid email address.');
    return;
  }

  clearError('error-step-3');
  populateConfirmation();
  showStep(4);
  scrollToBooking();
});

function populateConfirmation(): void {
  const set = (id: string, text: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  set('conf-service', state.service);
  set('conf-price', state.servicePrice);
  set('conf-date', formatDate(state.date));
  set('conf-time', state.time);
  set('conf-name', state.name);
  set('conf-email', state.email);
  set('conf-phone', state.phone);
  set('conf-vehicle', state.vehicleInfo || 'Not provided');
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function scrollToBooking(): void {
  const section = document.getElementById('booking');
  if (!section) return;
  const top = section.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
}

// ── Reset / Book another ──────────────────────────────────────────────────────
document.getElementById('book-another')?.addEventListener('click', () => {
  Object.assign(state, {
    step: 1, service: '', servicePrice: '', date: '', time: '',
    name: '', phone: '', email: '', vehicleInfo: '',
  });

  document.querySelectorAll<HTMLElement>('.service-option').forEach((c) => {
    c.classList.remove('ring-2', 'ring-orange-500', 'bg-orange-50', 'border-orange-300');
    c.classList.add('border-slate-200');
  });
  document.querySelectorAll<HTMLElement>('.time-slot').forEach((b) => {
    b.classList.remove('bg-orange-500', 'text-white', 'border-orange-500');
    b.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
  });

  const di = document.getElementById('booking-date') as HTMLInputElement | null;
  if (di) di.value = '';

  (document.getElementById('booking-form') as HTMLFormElement | null)?.reset();
  showStep(1);
  scrollToBooking();
});

// Initialise at step 1
showStep(1);
