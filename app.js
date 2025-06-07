import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "https://cdn.skypack.dev/gsap";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

const camera = new THREE.PerspectiveCamera(
  14,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 900;
camera.position.y = 200;

const scene = new THREE.Scene();
let dog;
let mixer;
let actions = {};
let currentAction;

const loader = new GLTFLoader();

loader.load(
  "animated_dog_shiba_inu.glb",
  function (gltf) {
    dog = gltf.scene;
    dog.position.set(20, -20, 0);
    scene.add(dog);

    mixer = new THREE.AnimationMixer(dog);
    // Store all actions
    gltf.animations.forEach((clip, index) => {
      actions[`clip${index}`] = mixer.clipAction(clip);
    });

    // Play the initial one
    currentAction = actions["clip3"];
    currentAction.play();
    modelMove();
  },
  function (xhr) {},
  function (error) {}
);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById("container3D").appendChild(renderer.domElement);

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 2);
topLight.position.set(1000, 1000, 500);
scene.add(topLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
const reRender3D = () => {
  requestAnimationFrame(reRender3D); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  renderer.render(scene, camera);
  if (mixer) mixer.update(0.02);
};
reRender3D();

let arrPositionModel = [
  {
    id: "banner",
    position: { x: 20, y: -20, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    animation: ["clip3"],
  },
  {
    id: "intro",
    position: { x: -20, y: -1, z: -5 },
    rotation: { x: 0.5, y: -0.5, z: 0 },
    animation: ["clip3"],
  },
  {
    id: "description",
    position: { x: -1, y: -1, z: -5 },
    rotation: { x: 0, y: 0.5, z: 0 },
    animation: ["clip3"],
  },
  {
    id: "playground",
    position: { x: 0, y: -20, z: -5 },
    rotation: { x: 0, y: 0, z: 0 },
    animation: ["clip4"],
  },
];
const modelMove = () => {
  const sections = document.querySelectorAll(".section");
  let currentSection;
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight / 3) {
      currentSection = section.id;
    }
  });

  let position_active = arrPositionModel.findIndex(
    (val) => val.id === currentSection
  );
  if (position_active >= 0) {
    let target = arrPositionModel[position_active];

    controls.enabled = currentSection === "playground";

    // Move model
    gsap.to(dog.position, {
      x: target.position.x,
      y: target.position.y,
      z: target.position.z,
      duration: 3,
      ease: "power1.out",
    });
    gsap.to(dog.rotation, {
      x: target.rotation.x,
      y: target.rotation.y,
      z: target.rotation.z,
      duration: 3,
      ease: "power1.out",
    });

    // Switch animation
    if (
      mixer &&
      actions[target.animation] &&
      currentAction !== actions[target.animation]
    ) {
      if (currentAction) {
        currentAction.fadeOut(0.5);
      }
      currentAction = actions[target.animation];
      currentAction.reset().fadeIn(0.5).play();
    }
  }
};

const changeAnimation = (animationName) => {
  if (
    mixer &&
    actions[animationName] &&
    currentAction !== actions[animationName]
  ) {
    if (currentAction) {
      currentAction.fadeOut(0.5);
    }
    currentAction = actions[animationName];
    currentAction.reset().fadeIn(0.5).play();

    setTimeout(() => {
      currentAction.fadeOut(0.5);
      currentAction = actions["clip4"];
      currentAction.reset().fadeIn(0.5).play();
    }, 5000);
  }
};

document.getElementById("bang").addEventListener("click", () => {
  changeAnimation("clip0");
});
document.getElementById("paw").addEventListener("click", () => {
  changeAnimation("clip2");
});
document.getElementById("roll").addEventListener("click", () => {
  changeAnimation("clip1");
});
document.getElementById("sit").addEventListener("click", () => {
  changeAnimation("clip3");
});

window.addEventListener("scroll", () => {
  if (dog) {
    modelMove();
  }
});
window.addEventListener("resize", () => {
  dog.scale.set(0.5, 0.5, 0.5);
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
