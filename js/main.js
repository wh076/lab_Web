const gallery = document.getElementById('gallery');
const buttonsView = document.getElementById('buttons-view');
const boyfriendView = document.getElementById('boyfriend-view');
const zhdunView = document.getElementById('zhdun-view');
const editorView = document.getElementById('editor-view');

let lastCard = null;

function showView(name) {
  gallery.hidden = name !== 'gallery';
  buttonsView.hidden = name !== 'buttons';
  boyfriendView.hidden = name !== 'boyfriend';
  zhdunView.hidden = name !== 'zhdun';
  editorView.hidden = name !== 'editor';
  window.scrollTo(0, 0);
}

function openMeme(id) {
  if (id === 'buttons') {
    showView('buttons');
    resetButtons();
  } else if (id === 'boyfriend') {
    showView('boyfriend');
    resetBoyfriend();
  } else if (id === 'zhdun') {
    showView('zhdun');
    resetZhdun();
  } else {
    showView('editor');
    openEditor(id);
  }
}

document.querySelectorAll('.card').forEach(function (card) {
  card.addEventListener('click', function () {
    lastCard = card;
    openMeme(card.dataset.meme);
  });
});

document.querySelectorAll('[data-back]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    stopZhdun();
    stopBoyfriend();
    history.replaceState(null, '', location.pathname);
    showView('gallery');
    if (lastCard) {
      lastCard.focus();
    }
  });
});

// подставляем то, что вводили в прошлый раз
const savedBoyfriend = localStorage.getItem('boyfriend');
if (savedBoyfriend) {
  fillBoyfriendForm(JSON.parse(savedBoyfriend));
}
const savedZhdun = localStorage.getItem('zhdun');
if (savedZhdun) {
  fillZhdunForm(JSON.parse(savedZhdun));
}

// открываем мем по ссылке с параметрами
const params = new URLSearchParams(location.search);
const meme = params.get('meme');

if (meme === 'boyfriend' && params.get('who') && params.get('should') && params.get('lure')) {
  const data = { who: params.get('who'), should: params.get('should'), lure: params.get('lure') };
  fillBoyfriendForm(data);
  showView('boyfriend');
  startBoyfriend(data);
} else if (meme === 'zhdun' && params.get('what')) {
  let time = parseInt(params.get('time')) || 8;
  const data = { what: params.get('what'), time: Math.min(Math.max(time, 3), 120) };
  fillZhdunForm(data);
  showView('zhdun');
  startZhdun(data);
}
