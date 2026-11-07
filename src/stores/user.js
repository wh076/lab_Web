import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanEmail(email) {
  return email.trim().toLowerCase();
}

function isUser(item) {
  return (
    item !== null &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.email === 'string' &&
    typeof item.password === 'string'
  );
}

export const useUserStore = defineStore(
  'user',
  function () {
    const users = ref([]);
    const currentUserId = ref(null);

    const currentUser = computed(function () {
      return users.value.find(function (user) {
        return user.id === currentUserId.value;
      });
    });

    const isLoggedIn = computed(function () {
      return currentUser.value !== undefined;
    });

    function findByEmail(email) {
      return users.value.find(function (user) {
        return user.email === email;
      });
    }

    // Возвращает null при успехе, иначе поле с ошибкой и текст
    function register(email, password, confirm) {
      const newEmail = cleanEmail(email);

      if (!emailPattern.test(newEmail)) {
        return { field: 'email', message: 'Неверный формат email' };
      }
      if (password === '') {
        return { field: 'password', message: 'Введите пароль' };
      }
      if (password !== confirm) {
        return { field: 'confirm', message: 'Пароли не совпадают' };
      }
      if (findByEmail(newEmail)) {
        return { field: 'email', message: 'Пользователь с таким email уже есть' };
      }

      users.value.push({ id: crypto.randomUUID(), email: newEmail, password: password });
      return null;
    }

    // Возвращает пустую строку при успехе, иначе текст ошибки
    function login(email, password) {
      const user = findByEmail(cleanEmail(email));

      if (!user || user.password !== password) {
        return 'Неверный email или пароль';
      }

      currentUserId.value = user.id;
      return '';
    }

    function logout() {
      currentUserId.value = null;
    }

    return { users, currentUserId, currentUser, isLoggedIn, register, login, logout };
  },
  {
    persist: {
      key: 'lab7-user',
      pick: ['users', 'currentUserId'],
      // Убираем испорченные записи, как при загрузке в лабе №6
      afterHydrate(context) {
        const saved = context.store.users;
        context.store.users = Array.isArray(saved) ? saved.filter(isUser) : [];
      },
    },
  }
);
