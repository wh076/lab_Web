// ===== Тема =====
const themeButton = document.querySelector('.js-theme-toggle');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeButton.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  localStorage.setItem('theme', theme);
}

function loadTheme() {
  let theme = localStorage.getItem('theme');
  if (theme !== 'dark') {
    theme = 'light';
  }
  setTheme(theme);
}

themeButton.addEventListener('click', function () {
  const current = document.documentElement.getAttribute('data-theme');
  if (current === 'dark') {
    setTheme('light');
  } else {
    setTheme('dark');
  }
});

loadTheme();
