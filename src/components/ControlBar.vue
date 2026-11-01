<template>
  <div class="bottom-bar">
    <!-- 模式切换 -->
    <div class="bottom-section">
      <span class="section-label">模式</span>
      <div class="mode-selector">
        <button
          class="mode-btn"
          :class="{ active: mode === 'stopwatch' }"
          @click="emit('setMode', 'stopwatch')"
        >
          秒表
        </button>
        <button
          class="mode-btn"
          :class="{ active: mode === 'countdown' }"
          @click="emit('setMode', 'countdown')"
        >
          倒计时
        </button>
      </div>
    </div>

    <!-- 倒计时设定 -->
    <div v-show="mode === 'countdown'" class="bottom-section countdown-setup">
      <span class="section-label">设定时间</span>
      <div class="countdown-inputs">
        <div class="input-group">
          <label>时</label>
          <input v-model.number="hours" type="number" min="0" max="99" />
        </div>
        <span class="colon">:</span>
        <div class="input-group">
          <label>分</label>
          <input v-model.number="minutes" type="number" min="0" max="59" />
        </div>
        <span class="colon">:</span>
        <div class="input-group">
          <label>秒</label>
          <input v-model.number="seconds" type="number" min="0" max="59" />
        </div>
        <button class="set-btn" @click="applyCountdown">确认</button>
      </div>
    </div>

    <!-- 播放控制 -->
    <div class="bottom-section controls">
      <span class="section-label">控制</span>
      <div class="btn-group">
        <button v-if="!isRunning" class="btn start" @click="emit('toggle')">{{ startLabel }}</button>
        <button v-else class="btn pause" @click="emit('toggle')">暂停</button>
        <button class="btn reset" @click="emit('reset')">重置</button>
      </div>
    </div>

    <!-- 主题色 -->
    <div class="bottom-section color-picker">
      <span class="section-label">主题色</span>
      <div class="color-options">
        <button
          v-for="color in presetColors"
          :key="color"
          class="color-btn"
          :class="{ active: activeColor === color }"
          :style="{ background: color }"
          :title="color"
          @click="pickColor(color)"
        ></button>
        <div class="custom-color">
          <input
            type="color"
            :value="customColor"
            title="自定义颜色"
            @input="pickCustom"
          />
          <span>自定义</span>
        </div>
      </div>
    </div>

    <!-- 快捷键 -->
    <div class="bottom-section hints">
      <span class="section-label">快捷键</span>
      <div class="hints-row">
        <span><kbd>空格</kbd>开始/暂停</span>
        <span><kbd>R</kbd>重置</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  mode: { type: String, default: 'stopwatch' },
  isRunning: { type: Boolean, default: false },
  startLabel: { type: String, default: '开始' },
  themeColor: { type: String, default: '#6366f1' },
});

const emit = defineEmits(['setMode', 'toggle', 'reset', 'setCountdown', 'changeColor']);

const presetColors = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#14b8a6',
];

const hours = ref(0);
const minutes = ref(5);
const seconds = ref(0);

const activeColor = ref(props.themeColor);
const customColor = ref(props.themeColor);

watch(
  () => props.themeColor,
  (next) => {
    customColor.value = next;
    if (!presetColors.includes(next)) {
      activeColor.value = '';
    }
  }
);

function applyCountdown() {
  emit('setCountdown', {
    hours: hours.value || 0,
    minutes: minutes.value || 0,
    seconds: seconds.value || 0,
  });
}

function pickColor(color) {
  activeColor.value = color;
  customColor.value = color;
  emit('changeColor', color);
}

function pickCustom(event) {
  const value = event.target.value;
  activeColor.value = '';
  customColor.value = value;
  emit('changeColor', value);
}
</script>

<style scoped>
.colon {
  color: rgba(255, 255, 255, 0.4);
  font-size: 20px;
  font-weight: 300;
}
</style>
