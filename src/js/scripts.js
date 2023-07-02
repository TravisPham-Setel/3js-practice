import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import nebula from '../img/nebula.jpg';
import stars from '../img/stars.jpg';

// init renderer object
const renderer = new THREE.WebGLRenderer();

// enabled shadow render
renderer.shadowMap.enabled = true;

// set display size on window
renderer.setSize(window.innerWidth, window.innerHeight);
// insert renderer's elements into DOM
document.body.appendChild(renderer.domElement);
// init scene
const scene = new THREE.Scene();
// init camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
// mouse contact
const orbit = new OrbitControls(camera, renderer.domElement);
// x y z
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(10, 30, 30)
orbit.update()

// create box object
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshStandardMaterial({ color: '#a0a832' });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);
// add shadow overlay for box object
box.receiveShadow = true;

// create a surface 
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
// rotate the surface to x->z direction
plane.rotation.x = -0.5 * Math.PI;
// make the surface receive shadow
plane.receiveShadow = true;

//add a grid layout
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

// add a sphere object
const sphereGeometry = new THREE.SphereGeometry(4, 50, 50); // position of the sphere
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0000FF })
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.position.set(-10, 10, 0);
// make this sphere a shadow source
sphere.castShadow = true;

// natural light source
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// // add directional light source to cast shadow and light up objects surface
// const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
// scene.add(directionalLight);
// directionalLight.position.set(-30, 50, 0);
// directionalLight.castShadow = true;
// // adjust shadow camera to cast the whole object's shadow
// directionalLight.shadow.camera.bottom = -12;

// // add direction guild line for directional light
// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(dLightHelper);

// // add shadow camera guild line for directional light source
// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShadowHelper);


// create spot light
const spotLight = new THREE.SpotLight(0xFFFFFF);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2;

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);

// scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);
scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);

// renderer.setClearColor(0xFFEA00)


// change background texture
const textureLoader = new THREE.TextureLoader();
// scene.background = textureLoader.load(stars);
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
  nebula,
  nebula,
  stars,
  stars,
  stars,
  stars
])

// create a box with custom texture
const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
const box2MultiMaterial = [
  new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(nebula) }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load(stars) }),
];
const box2 = new THREE.Mesh(box2Geometry, box2MultiMaterial);
scene.add(box2)
box2.position.set(0, 15, 10);
// box2.material.map = textureLoader.load(nebula);

// init GUI helper to adjust element
const gui = new dat.GUI()

// option GUI
const options = {
  sphereColor: '#ffea00',
  wireFrame: false,
  speed: 0.01,
  angle: 0.2, 
  penumbra: 0,
  intensity: 1,
}

// change color for sphere
gui.addColor(options, 'sphereColor').onChange(function(e) {
  sphere.material.color.set(e);
})

// show skeleton
gui.add(options, 'wireFrame').onChange(function(e) {
  sphere.material.wireframe = e;
})

// bouncing speed
gui.add(options, 'speed', 0, 0.1);

// adjust spotlight
gui.add(options, 'angle', 0, 1);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 0, 1);

let step = 0;

// mouse tracking
const mousePosition = new THREE.Vector2();
window.addEventListener('mousemove', function(e) {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = (e.clientY / window.innerHeight) * 2 + 1;
})

const rayCaster = new THREE.Raycaster();


function animate(time) {
  step += options.speed;
  sphere.position.y = 10 * Math.abs(Math.sin(step));

  spotLight.angle = options.angle;
  spotLight.penumbra = options.penumbra;
  spotLight.intensity = options.intensity;
  sLightHelper.update();

  // mouse tracking and print pointing objects
  rayCaster.setFromCamera(mousePosition, camera);
  const intersects = rayCaster.intersectObjects(scene.children);
  console.log(intersects);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);