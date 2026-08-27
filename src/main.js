import * as THREE from 'three';

const API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';

function initUI() {
  document.querySelector("#app").innerHTML = `
    <div class="logo-header">
      <h1>
        <span class="o-bright">O</span><span class="o-glow">R</span><span class="o-bright">A</span><span class="o-glow">N</span><span class="o-bright">G</span><span class="o-glow">E</span>
      </h1>
    </div>

    <h1 id="clock" class="clock">00:00:00</h1>

    <div class="search-container">
      <input id="searchbar" class="search-input" placeholder="Search web (Press '/' to focus)" />
    </div>

    <div class="grid">
      <a href="https://github.com" target="_blank" class="card">GitHub</a>
      <a href="https://youtube.com" target="_blank" class="card">YouTube</a>
      <a href="https://reddit.com" target="_blank" class="card">Reddit</a>
    </div>

    <div id="apod-section" class="apod-container">
      <p>loading NASA APOD data...</p>
    </div>
  `;

  const searchbar = document.querySelector("#searchbar");

  // Modern keyboard listener using keydown
  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && document.activeElement === searchbar && searchbar.value.trim() !== "") {
      const query = encodeURIComponent(searchbar.value);
      window.open(`https://duckduckgo.com/?q=${query}`, "_self");
    }
    if (e.key === "/" && document.activeElement !== searchbar) {
      e.preventDefault();
      searchbar.focus();
    }
  });

  startClock();
  fetchAPOD();
}

function startClock() {
  function updateTime() {
    const clockEl = document.querySelector("#clock");
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString();
    }
  }
  updateTime();
  setInterval(updateTime, 1000);
}

function init3DBackground() {
  const canvas = document.querySelector("#bg-canvas");
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight, false);
  scene.background = new THREE.Color(0x1a0c02);

  const ambientLight = new THREE.AmbientLight(0xff7700, 1.2);
  const pointLight = new THREE.PointLight(0xffaa55, 2, 100);
  pointLight.position.set(10, 10, 10);
  scene.add(ambientLight);
  scene.add(pointLight);

  const geometry = new THREE.IcosahedronGeometry(2, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0xd95300,
    wireframe: true,
    emissive: 0x4d1900
  });

  const node = new THREE.Mesh(geometry, material);
  scene.add(node);
  camera.position.z = 6;

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updatePoint ? null : camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  });

  function animate() {
    node.rotation.x += 0.005;
    node.rotation.y += 0.008;
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
}

function fetchAPOD() {
  fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      let media;
      if (data.media_type === "image") {
        media = `<img src="${data.url}" alt="${data.title}" />`;
      } else if (data.url && (data.url.includes("youtube.com") || data.url.includes("youtu.be"))) {
        media = `<iframe src="${data.url}" frameborder="0" allowfullscreen></iframe>`;
      } else {
        media = `<video src="${data.url}" controls></video>`;
      }

      document.querySelector("#apod-section").innerHTML = `
        <p>NASA Picture of the Day</p>
        <h3 style="color:#ff7700; margin:0.5rem 0;">${data.title}</h3>
        ${media}
      `;
    })
    .catch(err => {
      document.querySelector("#apod-section").innerHTML = `<p>Unable to load NASA APOD (${err.message})</p>`;
    });
}

initUI();
init3DBackground();