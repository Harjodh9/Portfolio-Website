const btn = document.getElementById('toggleBtn');
const profile = document.getElementById('sidebar');

btn.addEventListener('click', () => {
  // Option A: Toggle a 'hidden' attribute (Cleanest)
  profile.hidden = !profile.hidden;

  // Option B: Toggle a CSS class for animations
  // profile.classList.toggle('is-visible');
});

const btn1 = document.getElementById('themeToggle');
const html = document.documentElement;

// 1. Check for saved preference, otherwise use system setting
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  html.style.colorScheme = savedTheme;
}

btn1.addEventListener('click', () => {
  // 2. Determine the new theme
  const currentTheme = getComputedStyle(html).colorScheme;
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // 3. Apply and Save
  html.style.colorScheme = newTheme;
  localStorage.setItem('theme', newTheme);
});