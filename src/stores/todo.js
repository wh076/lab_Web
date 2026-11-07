import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useUserStore } from './user';

function isTask(item) {
  return (
    item !== null &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.userId === 'string' &&
    typeof item.title === 'string' &&
    typeof item.done === 'boolean'
  );
}

export const useTodoStore = defineStore(
  'todo',
  function () {
    const userStore = useUserStore();
    const tasks = ref([]);

    const currentTasks = computed(function () {
      return tasks.value.filter(function (task) {
        return task.userId === userStore.currentUserId;
      });
    });

    function findTask(id) {
      return currentTasks.value.find(function (task) {
        return task.id === id;
      });
    }

    function add(title) {
      tasks.value.push({
        id: crypto.randomUUID(),
        userId: userStore.currentUserId,
        title: title,
        done: false,
      });
    }

    function edit(id, title) {
      const task = findTask(id);
      if (task) {
        task.title = title;
      }
    }

    function remove(id) {
      if (findTask(id)) {
        tasks.value = tasks.value.filter(function (task) {
          return task.id !== id;
        });
      }
    }

    function toggle(id) {
      const task = findTask(id);
      if (task) {
        task.done = !task.done;
      }
    }

    // Поиск по названию, выполненные внизу списка
    function search(text) {
      const query = text.trim().toLowerCase();
      const found = currentTasks.value.filter(function (task) {
        return task.title.toLowerCase().includes(query);
      });
      const notDone = found.filter(function (task) {
        return !task.done;
      });
      const done = found.filter(function (task) {
        return task.done;
      });
      return notDone.concat(done);
    }

    return { tasks, currentTasks, findTask, add, edit, remove, toggle, search };
  },
  {
    persist: {
      key: 'lab7-tasks',
      pick: ['tasks'],
      // Убираем испорченные записи, как при загрузке в лабе №6
      afterHydrate(context) {
        const saved = context.store.tasks;
        context.store.tasks = Array.isArray(saved) ? saved.filter(isTask) : [];
      },
    },
  }
);
