import { ref, onMounted, watch } from 'vue';

const isDark = ref(true);

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    updateBodyClass();
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  };

  const updateBodyClass = () => {
    if (typeof document !== 'undefined') {
      if (isDark.value) {
        document.body.classList.remove('light-mode');
      } else {
        document.body.classList.add('light-mode');
      }
    }
  };

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      isDark.value = false;
    } else if (savedTheme === 'dark') {
      isDark.value = true;
    } else {
      // System preference fallback if no saved theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDark.value = prefersDark;
    }
    updateBodyClass();
  });

  return {
    isDark,
    toggleTheme
  };
}
