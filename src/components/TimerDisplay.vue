<template>
  <div class="timer-display">
    <div class="mode-label">{{ modeLabel }}</div>
    <div class="time" :class="{ warning: isWarning }" :style="timeStyle">{{ timeText }}</div>
    <div class="milliseconds">{{ msText }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  mode: { type: String, default: 'stopwatch' },
  timeText: { type: String, default: '00:00:00' },
  msText: { type: String, default: '.000' },
  isWarning: { type: Boolean, default: false },
  isFlashing: { type: Boolean, default: false },
});

const modeLabel = computed(() => (props.mode === 'countdown' ? '倒计时' : '秒表'));
const timeStyle = computed(() => ({ opacity: props.isFlashing ? 0.3 : 1 }));
</script>

<style scoped>
.time.warning {
  color: #ef4444;
  text-shadow: 0 0 90px #ef4444;
}
</style>
