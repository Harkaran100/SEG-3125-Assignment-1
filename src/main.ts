/**
 * main.ts — Portfolio TypeScript entry point
 * Handles: mobile navbar, smooth scroll, scroll-reveal animation, dynamic footer year
 */

// ─── 1. Dynamic footer year ──────────────────────────────────────────────────
const yearEls = document.querySelectorAll<HTMLSpanElement>('#footer-year');
const currentYear = new Date().getFullYear().toString();
yearEls.forEach((el) => {
  el.textContent = currentYear;
});

// ─── 2. Mobile navbar toggle ─────────────────────────────────────────────────
const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement | null;
const mobileMenu = document.getElementById('mobile-menu') as HTMLDivElement | null;

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('hidden');
    // isOpen is true when we just ADDED 'hidden' (closing), false when REMOVED (opening)
    menuBtn.setAttribute('aria-expanded', String(!isOpen));
    menuBtn.classList.toggle('menu-open', !isOpen);
  });

  // Close the mobile menu when any nav link inside it is clicked
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.classList.remove('menu-open');
    });
  });

  // Close the mobile menu when clicking outside of it
  document.addEventListener('click', (e: MouseEvent) => {
    const navbar = document.getElementById('navbar');
    if (navbar && !navbar.contains(e.target as Node)) {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.classList.remove('menu-open');
    }
  });
}

// ─── 3. Navbar shadow on scroll ──────────────────────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  const updateNavShadow = () => {
    if (window.scrollY > 10) {
      navbar.classList.add('shadow-md');
    } else {
      navbar.classList.remove('shadow-md');
    }
  };
  window.addEventListener('scroll', updateNavShadow, { passive: true });
}

// ─── 4. Smooth scroll for internal anchor links ──────────────────────────────
// HTML already has scroll-smooth via Tailwind, but we also handle offset
// for the fixed navbar height (64px = 4rem).
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e: MouseEvent) => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;

    e.preventDefault();
    const navbarHeight = 64; // matches h-16 = 4rem = 64px
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});

// ─── 5. Scroll-reveal animation ──────────────────────────────────────────────
// Elements with class "reveal" fade + slide in when they enter the viewport.
// Initial hidden state is set in style.css (.reveal).

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        revealObserver.unobserve(entry.target); // animate only once
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  }
);

document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
  revealObserver.observe(el);
});
