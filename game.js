let scene, camera, renderer;
let player, controls, raycaster, intersects;
let isPlaying = false;
let blocks = [];

function startGame() {
  // Ocultar a tela inicial
  document.getElementById('menu').style.display = 'none';
  isPlaying = true;
  init();
  animate();
}

function init() {
  // Cena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Cor do céu

  // Câmera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);

  // Renderizador
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Luz ambiente
  const light = new THREE.AmbientLight(0x404040, 1.5); // Luz suave
  scene.add(light);

  // Luz direcional (simulando a luz do sol)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5).normalize();
  scene.add(directionalLight);

  // Raycaster (para pegar os blocos)
  raycaster = new THREE.Raycaster();

  // Controle de movimento do jogador
  controls = new THREE.PointerLockControls(camera, document.body);

  document.body.addEventListener('click', () => {
    controls.lock();
  });

  // Gerar o terreno de blocos (um campo de blocos simples)
  generateWorld();

  // Eventos de redimensionamento da tela
  window.addEventListener('resize', onWindowResize, false);
}

function generateWorld() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Cor dos blocos

  for (let x = -10; x < 10; x++) {
    for (let z = -10; z < 10; z++) {
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x, 0, z);
      scene.add(cube);
      blocks.push(cube);
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  if (!isPlaying) return;
  
  requestAnimationFrame(animate);
  
  controls.update();

  // Raycasting para pegar blocos
  raycaster.update(camera);
  
  renderer.render(scene, camera);
}

// Raycaster para detectar o que o jogador está olhando
THREE.Raycaster.prototype.update = function(camera) {
  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(camera.quaternion);

  const origin = camera.position;
  this.ray.origin.copy(origin);
  this.ray.direction.copy(direction);

  intersects = this.intersectObjects(blocks);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    object.material.color.set(0xff0000); // Altera a cor do bloco que está sendo olhado
  }
};

// Controle de movimento
document.addEventListener('keydown', (event) => {
  if (!isPlaying) return;
  
  const speed = 0.1;
  const moveDirection = new THREE.Vector3();

  switch (event.key) {
    case 'w': // Frente
      moveDirection.set(0, 0, -speed);
      break;
    case 's': // Atrás
      moveDirection.set(0, 0, speed);
      break;
    case 'a': // Esquerda
      moveDirection.set(-speed, 0, 0);
      break;
    case 'd': // Direita
      moveDirection.set(speed, 0, 0);
      break;
    case ' ': // Pular
      if (player.position.y === 0) player.velocity.y = 1;
      break;
  }

  camera.position.add(moveDirection);
});

