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


// ===== Задачи =====
const taskList = document.querySelector('.js-task-list');
const taskTemplate = document.querySelector('.js-task-template');
const addButton = document.querySelector('.js-add-button');
const searchInput = document.querySelector('.js-search');

const modal = document.querySelector('.js-modal');
const modalForm = document.querySelector('.js-modal-form');
const modalTitle = document.querySelector('.js-modal-title');
const modalInput = document.querySelector('.js-modal-input');
const modalCancel = document.querySelector('.js-modal-cancel');

let tasks = [];
let nextId = 1;
let searchText = '';
let editingId = null; // null - добавляем новую задачу, иначе id редактируемой

function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem('tasks'));
    if (Array.isArray(data)) {
      tasks = data;
    }
  } catch (error) {
    tasks = [];
  }

  // следующий id = самый большой id + 1
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id >= nextId) {
      nextId = tasks[i].id + 1;
    }
  }
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function createTaskElement(task) {
  const item = taskTemplate.content.firstElementChild.cloneNode(true);
  const checkbox = item.querySelector('.js-task-checkbox');
  const title = item.querySelector('.js-task-title');
  const editButton = item.querySelector('.js-edit-button');
  const editText = item.querySelector('.js-edit-text');
  const deleteButton = item.querySelector('.js-delete-button');
  const deleteText = item.querySelector('.js-delete-text');

  const checkboxId = 'task-checkbox-' + task.id;
  const titleId = 'task-title-' + task.id;

  item.setAttribute('data-id', task.id);

  checkbox.id = checkboxId;
  checkbox.checked = task.done;

  title.id = titleId;
  title.setAttribute('for', checkboxId);
  title.textContent = task.title;

  // имя кнопки = скрытый текст + название задачи
  editText.id = 'task-edit-' + task.id;
  editButton.setAttribute('aria-labelledby', editText.id + ' ' + titleId);

  deleteText.id = 'task-delete-' + task.id;
  deleteButton.setAttribute('aria-labelledby', deleteText.id + ' ' + titleId);

  if (task.done) {
    item.classList.add('task--done');
  }

  return item;
}

function render() {
  taskList.textContent = '';

  // показываем только задачи, подходящие под поиск
  const visible = tasks.filter(function (task) {
    return task.title.toLowerCase().includes(searchText);
  });

  // сначала невыполненные, потом выполненные
  const notDone = visible.filter(function (task) {
    return !task.done;
  });
  const done = visible.filter(function (task) {
    return task.done;
  });
  const sorted = notDone.concat(done);

  for (let i = 0; i < sorted.length; i++) {
    taskList.appendChild(createTaskElement(sorted[i]));
  }
}

function findTask(id) {
  return tasks.find(function (task) {
    return task.id === id;
  });
}

// ищет кнопку нужной задачи в списке на странице
function findTaskButton(id, buttonClass) {
  return taskList.querySelector('[data-id="' + id + '"] .' + buttonClass);
}

function addTask(title) {
  tasks.push({ id: nextId, title: title, done: false });
  nextId++;
  saveTasks();
  render();
}

function editTask(id, title) {
  const task = findTask(id);
  task.title = title;
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = findTask(id);
  task.done = !task.done;
  saveTasks();
  render();

  // после перерисовки возвращаем фокус на тот же чекбокс
  document.getElementById('task-checkbox-' + id).focus();
}

function deleteTask(id) {
  // запоминаем соседнюю видимую задачу: сначала следующую, иначе предыдущую
  const items = taskList.querySelectorAll('[data-id]');
  let neighbourId = null;
  for (let i = 0; i < items.length; i++) {
    if (Number(items[i].getAttribute('data-id')) === id) {
      if (i + 1 < items.length) {
        neighbourId = items[i + 1].getAttribute('data-id');
      } else if (i > 0) {
        neighbourId = items[i - 1].getAttribute('data-id');
      }
    }
  }

  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });
  saveTasks();
  render();

  if (neighbourId !== null) {
    findTaskButton(neighbourId, 'js-delete-button').focus();
  } else {
    addButton.focus();
  }
}


// ===== Модальное окно =====
function openAddModal() {
  editingId = null;
  modalTitle.textContent = 'Новая задача';
  modalInput.value = '';
  modal.showModal();
}

function openEditModal(id) {
  editingId = id;
  modalTitle.textContent = 'Редактировать задачу';
  modalInput.value = findTask(id).title;
  modal.showModal();
}

addButton.addEventListener('click', openAddModal);

modalForm.addEventListener('submit', function (event) {
  const title = modalInput.value.trim();
  if (title === '') {
    event.preventDefault();
    modalInput.value = '';
    modalInput.focus();
    return;
  }

  if (editingId === null) {
    addTask(title);
  } else {
    editTask(editingId, title);
  }
});

modalCancel.addEventListener('click', function () {
  modal.close();
});

// срабатывает и после "Сохранить", и после "Отмена", и после Esc
modal.addEventListener('close', function () {
  if (editingId === null) {
    addButton.focus();
    return;
  }

  // список перерисован, поэтому ищем кнопку заново
  const editButton = findTaskButton(editingId, 'js-edit-button');
  if (editButton) {
    editButton.focus();
  } else {
    // задача не подходит под поиск после переименования
    addButton.focus();
  }
});


// ===== События списка =====
taskList.addEventListener('change', function (event) {
  if (event.target.classList.contains('js-task-checkbox')) {
    const id = Number(event.target.closest('[data-id]').getAttribute('data-id'));
    toggleTask(id);
  }
});

taskList.addEventListener('click', function (event) {
  const editButton = event.target.closest('.js-edit-button');
  const deleteButton = event.target.closest('.js-delete-button');

  if (editButton) {
    const id = Number(editButton.closest('[data-id]').getAttribute('data-id'));
    openEditModal(id);
  }

  if (deleteButton) {
    const id = Number(deleteButton.closest('[data-id]').getAttribute('data-id'));
    deleteTask(id);
  }
});


// ===== Поиск =====
searchInput.addEventListener('input', function () {
  searchText = searchInput.value.trim().toLowerCase();
  render();
});

loadTasks();
render();
