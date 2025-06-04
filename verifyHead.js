// verifyHead.js – Simulated 3D Binary Face Decoder (Fallback version with sphere)

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, headModel, binaryParticles = [];
let clock = new THREE.Clock();

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 3);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(2, 2, 2);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0x404040);
  scene.add(ambient);

  new OrbitControls(camera, renderer.domElement);

  // 🧠 Fallback model (sphere head)
  const geometry = new THREE.SphereGeometry(1.2, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, wireframe: true });
  headModel = new THREE.Mesh(geometry, material);
  scene.add(headModel);

  createBinaryParticles();

  // ✅ After 5 seconds, load BinaryFlow engine
  setTimeout(() => {
    renderer.domElement.remove();
    const script = document.createElement('script');
    script.type = 'module';
    script.src = './main.js';
    document.body.appendChild(script);
  }, 5000);
}

function createBinaryParticles() {
  const font = 'monospace';
  const digits = '01';
  for (let i = 0; i < 150; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.font = '48px ' + font;
    ctx.fillText(digits[Math.floor(Math.random() * 2)], 16, 48);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(
      (Math.random() - 0.5) * 3,
      Math.random() * 3,
      (Math.random() - 0.5) * 3
    );
    sprite.scale.set(0.3, 0.3, 0.3);
    scene.add(sprite);
    binaryParticles.push(sprite);
  }
}

function animate() {
  requestAnimationFrame(animate);
  let delta = clock.getDelta();

  if (headModel) {
    headModel.rotation.y += 0.3 * delta;
  }

  binaryParticles.forEach(p => {
    p.position.y += 0.01;
    if (p.position.y > 3) p.position.y = 0;
  });

  renderer.render(scene, camera);
}
