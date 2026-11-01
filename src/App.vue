<template>
  <div class="app-root">
    <!-- three.js 星尘粒子背景 -->
    <ParticleBackground :color="themeColor" />

    <!-- 窗口控制按钮（右上角悬浮） -->
    <div class="window-controls">
      <button class="control-btn minimize" title="最小化" @click="control('minimize')">─</button>
      <button class="control-btn maximize" title="最大化" @click="control('maximize')">□</button>
      <button class="control-btn close" title="关闭" @click="control('close')">✕</button>
    </div>

    <div class="container">
      <TimerDisplay
        :mode="mode"
        :time-text="timeText"
        :ms-text="msText"
        :is-warning="isWarning"
        :is-flashing="isFlashing"
      />

      <ControlBar
        :mode="mode"
        :is-running="isRunning"
        :start-label="startLabel"
        :theme-color="themeColor"
        @set-mode="handleSetMode"
        @toggle="toggle"
        @reset="reset"
        @set-countdown="handleSetCountdown"
        @change-color="setThemeColor"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import ParticleBackground from './components/ParticleBackground.vue';
import TimerDisplay from './components/TimerDisplay.vue';
import ControlBar from './components/ControlBar.vue';
import { useTimer } from './composables/useTimer.js';

const {
  mode,
  isRunning,
  isFlashing,
  isWarning,
  timeText,
  msText,
  currentMs,
  toggle,
  reset,
  setMode,
  setCountdown,
} = useTimer();

const themeColor = ref('#6366f1');

// 主题色同步到 CSS 变量，按钮/时间/粒子都会跟着变
watch(
  themeColor,
  (value) => {
    document.documentElement.style.setProperty('--primary-color', value);
  },
  { immediate: true }
);

function setThemeColor(color) {
  themeColor.value = color;
}

const startLabel = computed(() => (currentMs.value > 0 ? '继续' : '开始'));

// 记住上次设定的倒计时，切回该模式时保留
const lastCountdown = ref({ hours: 0, minutes: 5, seconds: 0 });

function handleSetMode(next) {
  setMode(next);
  if (next === 'countdown') {
    const { hours, minutes, seconds } = lastCountdown.value;
    setCountdown(hours, minutes, seconds);
  }
}

function handleSetCountdown({ hours, minutes, seconds }) {
  lastCountdown.value = { hours, minutes, seconds };
  setCountdown(hours, minutes, seconds);
}

// 窗口控制（由 preload 暴露）
function control(action) {
  const api = window.timerAPI;
  if (api && typeof api[action] === 'function') api[action]();
}

function handleKeydown(event) {
  const tag = (event.target && event.target.tagName) || '';
  if (tag === 'INPUT') return; // 输入框内不响应快捷键
  if (event.code === 'Space') {
    event.preventDefault();
    toggle();
  } else if (event.code === 'KeyR') {
    reset();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
