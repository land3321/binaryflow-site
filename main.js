// BinaryFlow v2 – Custom Shader + Exportable Portfolio Setup

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scene, camera, renderer, controls;
let binaryShapes = [];
let mouse = new THREE.Vector2(0, 0);
let audioLevel = 0;

init();
animate();

function init() {
  const loadingScreen = document.createElement('div');
  loadingScreen.innerText = 'Loading BinaryFlow...';
  loadingScreen.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;color:#0f0;font-family:monospace;font-size:2rem;display:flex;align-items:center;justify-content:center;z-index:9999';
  document.body.appendChild(loadingScreen);

  setTimeout(() => loadingScreen.remove(), 2000);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  generateBinaryShapes('101100111010101');
  initAudio();
}

function generateBinaryShapes(binaryString) {
  const geometry = new THREE.IcosahedronGeometry(0.3, 5);

  const vertexShader = `
    uniform float time;
    varying vec3 vNormal;
    void main() {
      vNormal = normal;
      vec3 pos = position + 0.1 * normal * sin(time + position.y * 5.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      gl_FragColor = vec4(0.2, 1.0, 0.8, 1.0) * intensity;
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 }
    },
    vertexShader,
    fragmentShader,
    wireframe: false
  });

  binaryString.split('').forEach((bit, i) => {
    let mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.x = (i - binaryString.length / 2) * 0.5;
    mesh.position.y = Math.sin(i * 0.4) * 0.6;
    mesh.userData.bit = bit;
    scene.add(mesh);
    binaryShapes.push(mesh);
  });

  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(10, 10, 10);
  scene.add(light);
}

function animate(time) {
  requestAnimationFrame(animate);

  binaryShapes.forEach((shape, i) => {
    if (shape.material.uniforms) {
      shape.material.uniforms.time.value = time * 0.001;
    }

    shape.rotation.x += 0.002 + audioLevel * 0.005;
    shape.rotation.y += 0.001 + Math.abs(mouse.x) * 0.001;

    if (shape.userData.bit === '1') {
      shape.scale.setScalar(1 + audioLevel * 0.15);
    } else {
      shape.scale.setScalar(1 + Math.abs(mouse.y) * 0.1);
    }
  });

  renderer.render(scene, camera);
}

function initAudio() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateAudio = () => {
      analyser.getByteFrequencyData(dataArray);
      let avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      audioLevel = avg / 256;
      requestAnimationFrame(updateAudio);
    };
    updateAudio();
  });
}
