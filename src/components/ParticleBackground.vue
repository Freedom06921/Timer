<template>
  <canvas ref="canvasRef" class="particles-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';

const props = defineProps({
  // 主题色，粒子颜色跟随
  color: { type: String, default: '#6366f1' },
  // 粒子数量
  count: { type: Number, default: 1100 },
});

const canvasRef = ref(null);

const RANGE = 900; // 粒子分布的空间边长
const DEPTH = 700; // 深度范围

let renderer = null;
let scene = null;
let camera = null;
let points = null;
let geometry = null;
let material = null;
let texture = null;
let frameId = null;

let positions = null;
let speeds = null;
let drift = null;

let pointerX = 0;
let pointerY = 0;
let running = false;

/** 生成柔和的圆形光点贴图 */
function createParticleTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.5)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function initScene() {
  const canvas = canvasRef.value;
  const width = window.innerWidth;
  const height = window.innerHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 3000);
  camera.position.set(0, 0, 480);

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);

  const total = props.count;
  positions = new Float32Array(total * 3);
  speeds = new Float32Array(total);
  drift = new Float32Array(total);

  for (let i = 0; i < total; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * RANGE;
    positions[i * 3 + 1] = (Math.random() - 0.5) * RANGE;
    positions[i * 3 + 2] = (Math.random() - 0.5) * DEPTH;
    // 越远的粒子上升越慢，形成景深
    speeds[i] = 0.08 + Math.random() * 0.35;
    drift[i] = Math.random() * Math.PI * 2;
  }

  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  texture = createParticleTexture();
  material = new THREE.PointsMaterial({
    size: 5.5,
    sizeAttenuation: true,
    map: texture,
    color: new THREE.Color(props.color),
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
}

function animate() {
  frameId = requestAnimationFrame(animate);
  if (!geometry) return;

  const array = geometry.attributes.position.array;
  const time = Date.now() * 0.0006;

  for (let i = 0; i < props.count; i += 1) {
    const yi = i * 3 + 1;
    array[yi] += speeds[i];
    if (array[yi] > RANGE / 2) {
      array[yi] = -RANGE / 2;
    }
    // 轻微横向摆动，像悬浮的尘埃
    array[i * 3] += Math.sin(time + drift[i]) * 0.06;
  }
  geometry.attributes.position.needsUpdate = true;

  // 鼠标视差 + 整体缓慢自转
  camera.position.x += (pointerX * 70 - camera.position.x) * 0.03;
  camera.position.y += (-pointerY * 45 - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);
  points.rotation.y += 0.0004;
  points.rotation.x += 0.00015;

  renderer.render(scene, camera);
}

function startLoop() {
  if (running) return;
  running = true;
  animate();
}

function stopLoop() {
  running = false;
  if (frameId) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
}

function handleResize() {
  if (!renderer || !camera) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function handlePointerMove(event) {
  pointerX = (event.clientX / window.innerWidth) * 2 - 1;
  pointerY = (event.clientY / window.innerHeight) * 2 - 1;
}

function handleVisibility() {
  if (document.hidden) stopLoop();
  else startLoop();
}

watch(
  () => props.color,
  (next) => {
    if (material) material.color.set(next);
  }
);

onMounted(() => {
  initScene();
  startLoop();
  window.addEventListener('resize', handleResize);
  window.addEventListener('mousemove', handlePointerMove);
  document.addEventListener('visibilitychange', handleVisibility);
});

onBeforeUnmount(() => {
  stopLoop();
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('mousemove', handlePointerMove);
  document.removeEventListener('visibilitychange', handleVisibility);
  if (geometry) geometry.dispose();
  if (material) material.dispose();
  if (texture) texture.dispose();
  if (renderer) renderer.dispose();
  renderer = null;
  scene = null;
  camera = null;
  points = null;
});
</script>
