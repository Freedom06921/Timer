import { ref, computed, onUnmounted } from 'vue';

const pad2 = (n) => String(n).padStart(2, '0');
const pad3 = (n) => String(n).padStart(3, '0');

/**
 * 计时器核心逻辑：秒表正计时 + 倒计时，10ms 刷新一次
 */
export function useTimer() {
  const mode = ref('stopwatch'); // 'stopwatch' | 'countdown'
  const isRunning = ref(false);
  const elapsed = ref(0); // 秒表累计毫秒
  const remaining = ref(0); // 倒计时剩余毫秒
  const isFlashing = ref(false); // 倒计时结束闪烁

  let startTime = 0;
  let tickerId = null;
  let flashId = null;

  const currentMs = computed(() => (mode.value === 'countdown' ? remaining.value : elapsed.value));

  const timeText = computed(() => {
    const total = Math.floor(currentMs.value / 1000);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  });

  const msText = computed(() => `.${pad3(Math.floor(currentMs.value % 1000))}`);

  // 倒计时最后 10 秒进入警告状态
  const isWarning = computed(
    () => mode.value === 'countdown' && remaining.value <= 10000 && remaining.value > 0
  );

  function stopTicker() {
    if (tickerId) {
      clearInterval(tickerId);
      tickerId = null;
    }
  }

  function flash() {
    let count = 0;
    if (flashId) clearInterval(flashId);
    flashId = setInterval(() => {
      isFlashing.value = !isFlashing.value;
      count += 1;
      if (count >= 6) {
        clearInterval(flashId);
        flashId = null;
        isFlashing.value = false;
      }
    }, 500);
  }

  function start() {
    if (isRunning.value) return;
    isRunning.value = true;
    isFlashing.value = false;

    if (mode.value === 'stopwatch') {
      startTime = Date.now() - elapsed.value;
      tickerId = setInterval(() => {
        elapsed.value = Date.now() - startTime;
      }, 10);
    } else {
      if (!remaining.value) remaining.value = elapsed.value;
      tickerId = setInterval(() => {
        remaining.value = Math.max(0, remaining.value - 10);
        if (remaining.value <= 0) {
          pause();
          flash();
        }
      }, 10);
    }
  }

  function pause() {
    isRunning.value = false;
    stopTicker();
  }

  function toggle() {
    if (isRunning.value) pause();
    else start();
  }

  function reset() {
    pause();
    elapsed.value = 0;
    remaining.value = 0;
    isFlashing.value = false;
  }

  function setMode(next) {
    pause();
    mode.value = next;
    elapsed.value = 0;
    remaining.value = 0;
    isFlashing.value = false;
  }

  function setCountdown(hours, minutes, seconds) {
    const total = ((hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0)) * 1000;
    remaining.value = total;
    elapsed.value = total;
  }

  onUnmounted(() => {
    stopTicker();
    if (flashId) clearInterval(flashId);
  });

  return {
    mode,
    isRunning,
    isFlashing,
    isWarning,
    currentMs,
    timeText,
    msText,
    start,
    pause,
    toggle,
    reset,
    setMode,
    setCountdown,
  };
}
