// 计时器前端逻辑

// 计时器状态
let timerState = {
  isRunning: false,
  mode: 'stopwatch',  // 'stopwatch' 或 'countdown'
  startTime: 0,
  elapsed: 0,
  remaining: 0,
  interval: null
};

// DOM元素
const timeDisplay = document.getElementById('timeDisplay');
const msDisplay = document.getElementById('msDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const countdownSetup = document.getElementById('countdownSetup');

// 秒表模式
function startStopwatch() {
  timerState.startTime = Date.now() - timerState.elapsed;
  timerState.interval = setInterval(() => {
    timerState.elapsed = Date.now() - timerState.startTime;
    updateTimeDisplay(timerState.elapsed);
  }, 10);
}

// 倒计时模式
function startCountdown() {
  timerState.remaining = timerState.remaining || timerState.elapsed;
  timerState.interval = setInterval(() => {
    timerState.remaining -= 10;
    if (timerState.remaining <= 0) {
      timerState.remaining = 0;
      pauseTimer();
      handleCountdownEnd();
    }
    updateTimeDisplay(timerState.remaining);
  }, 10);
}

// 更新时间显示
function updateTimeDisplay(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  const timeStr = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  const msStr = `.${padZero3(milliseconds)}`;

  timeDisplay.textContent = timeStr;
  msDisplay.textContent = msStr;

  // 倒计时即将结束时变色提示
  if (timerState.mode === 'countdown' && timerState.remaining <= 10000 && timerState.remaining > 0) {
    timeDisplay.style.color = '#ef4444';
  } else {
    timeDisplay.style.color = '';
  }
}

// 补零函数
function padZero(num) {
  return num.toString().padStart(2, '0');
}

function padZero3(num) {
  return num.toString().padStart(3, '0');
}

// 开始计时
function startTimer() {
  if (timerState.isRunning) return;

  timerState.isRunning = true;
  startBtn.style.display = 'none';
  pauseBtn.style.display = 'inline-block';

  if (timerState.mode === 'stopwatch') {
    startStopwatch();
  } else {
    startCountdown();
  }
}

// 暂停计时
function pauseTimer() {
  if (!timerState.isRunning) return;

  timerState.isRunning = false;
  clearInterval(timerState.interval);
  startBtn.style.display = 'inline-block';
  pauseBtn.style.display = 'none';
  startBtn.textContent = '继续';
}

// 重置计时
function resetTimer() {
  timerState.isRunning = false;
  clearInterval(timerState.interval);

  if (timerState.mode === 'countdown') {
    timerState.elapsed = 0;
    timerState.remaining = 0;
  } else {
    timerState.elapsed = 0;
  }

  updateTimeDisplay(0);
  startBtn.style.display = 'inline-block';
  pauseBtn.style.display = 'none';
  startBtn.textContent = '开始';
  timeDisplay.style.color = '';
}

// 切换模式
function setMode(mode) {
  // 保存当前时间
  timerState.elapsed = timerState.remaining || timerState.elapsed;

  // 重置状态
  timerState.mode = mode;
  timerState.isRunning = false;
  clearInterval(timerState.interval);

  // 更新UI
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  countdownSetup.style.display = mode === 'countdown' ? 'flex' : 'none';
  startBtn.textContent = '开始';

  if (mode === 'countdown' && timerState.elapsed === 0) {
    // 使用输入框的值
    const hours = parseInt(document.getElementById('hoursInput').value) || 0;
    const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
    const seconds = parseInt(document.getElementById('secondsInput').value) || 0;
    timerState.elapsed = (hours * 3600 + minutes * 60 + seconds) * 1000;
    timerState.remaining = timerState.elapsed;
  }

  updateTimeDisplay(timerState.elapsed);
  startBtn.style.display = 'inline-block';
  pauseBtn.style.display = 'none';
  timeDisplay.style.color = '';
}

// 设置倒计时时间
function setCountdown() {
  const hours = parseInt(document.getElementById('hoursInput').value) || 0;
  const minutes = parseInt(document.getElementById('minutesInput').value) || 0;
  const seconds = parseInt(document.getElementById('secondsInput').value) || 0;

  timerState.elapsed = (hours * 3600 + minutes * 60 + seconds) * 1000;
  timerState.remaining = timerState.elapsed;

  updateTimeDisplay(timerState.elapsed);
}

// 倒计时结束处理
function handleCountdownEnd() {
  // 闪烁效果提示
  let flashCount = 0;
  const flashInterval = setInterval(() => {
    timeDisplay.style.opacity = timeDisplay.style.opacity === '0.3' ? '1' : '0.3';
    flashCount++;
    if (flashCount >= 6) {
      clearInterval(flashInterval);
      timeDisplay.style.opacity = '1';
    }
  }, 500);
}

// 设置主题颜色
function setColor(color) {
  document.documentElement.style.setProperty('--primary-color', color);
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === color);
  });
}

// 颜色选择器事件监听
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => setColor(btn.dataset.color));
});

document.getElementById('customColor').addEventListener('input', (e) => {
  setColor(e.target.value);
  document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (timerState.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  } else if (e.code === 'KeyR') {
    resetTimer();
  }
});

// 初始化
updateTimeDisplay(0);
