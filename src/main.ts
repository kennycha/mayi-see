import * as THREE from "three";
import { CustomTransformControls } from "./CustomTransformControls.ts";
import GUI from "lil-gui";

type View = {
  left: number;
  bottom: number;
  width: number;
  height: number;
  background: THREE.Color;
  eye: [number, number, number];
  fov: number;
  updateCamera: (camera: THREE.Camera) => void;
  camera?: THREE.PerspectiveCamera;
};

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let windowWidth: number;
let windowHeight: number;
let camera1Mesh: THREE.Mesh;
let camera2Mesh: THREE.Mesh;
let controls: CustomTransformControls;
let controlTarget: THREE.Mesh | null;

const ORIGIN = new THREE.Vector3(0, 0, 0);

const mainCameraPosition = { x: 0, y: 10, z: 40 };
const camera1Position = { x: 5, y: 5, z: 5 };
const camera2Position = { x: -5, y: 5, z: 5 };

const camera1RotationMatrix = new THREE.Matrix4();
const camera2RotationMatrix = new THREE.Matrix4();

const limitInRange = (value: number, minimum: number, maximum: number) => {
  return Math.max(Math.min(value, maximum), minimum);
};

const views: View[] = [
  {
    left: 0,
    bottom: 0,
    width: 0.5,
    height: 1.0,
    background: new THREE.Color(0xf0f0f0),
    eye: [0, 10, mainCameraPosition.z],
    fov: 30,
    updateCamera: function (camera) {
      camera.position.z = mainCameraPosition.z;
      camera.lookAt(ORIGIN);
    },
  },
  {
    left: 0.5,
    bottom: 0,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0x004225),
    eye: [camera1Position.x, camera1Position.y, camera1Position.z],
    fov: 45,
    updateCamera: function (camera) {
      camera.position.set(
        limitInRange(camera1Position.x, -20, 20),
        limitInRange(camera1Position.y, -20, 20),
        limitInRange(camera1Position.z, -20, 20)
      );
      camera.lookAt(ORIGIN);
    },
  },
  {
    left: 0.5,
    bottom: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0xc63d2f),
    eye: [camera2Position.x, camera2Position.y, camera2Position.z],
    fov: 60,
    updateCamera: function (camera) {
      camera.position.set(
        limitInRange(camera2Position.x, -20, 20),
        limitInRange(camera2Position.y, -20, 20),
        limitInRange(camera2Position.z, -20, 20)
      );
      camera.lookAt(ORIGIN);
    },
  },
];

const init = () => {
  const app = document.querySelector("#app") as HTMLDivElement;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  app.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  views.forEach((view, idx) => {
    const camera = new THREE.PerspectiveCamera(view.fov, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.fromArray(view.eye);
    camera.lookAt(ORIGIN);

    view.camera = camera;

    if (idx === 0) {
      controls = new CustomTransformControls(camera, renderer.domElement);
      controls.addEventListener("change", () => {
        if (controlTarget === camera1Mesh) {
          camera1Position.x = controlTarget.position.x;
          camera1Position.y = controlTarget.position.y;
          camera1Position.z = controlTarget.position.z;
        } else if (controlTarget === camera2Mesh) {
          camera2Position.x = controlTarget.position.x;
          camera2Position.y = controlTarget.position.y;
          camera2Position.z = controlTarget.position.z;
        }
      });
    }
  });

  const light = new THREE.HemisphereLight(0xffffff, 3);
  light.position.set(0, 0, 1);
  scene.add(light);

  const groundGeometry = new THREE.BoxGeometry(10, 0.1, 10);
  const texture = new THREE.TextureLoader().load("logo.png");
  const groundMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x7d7c7c),
    map: texture,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.position.y = -0.5;
  ground.rotateX(Math.PI);
  scene.add(ground);

  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x4f709c),
  });
  const box = new THREE.Mesh(boxGeometry, boxMaterial);
  box.position.x = 0;
  scene.add(box);

  const cameraGeometry = new THREE.ConeGeometry(0.5, 1, 16);
  cameraGeometry.rotateX(Math.PI / 2);
  const camera1Material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(views[1].background),
  });
  const camera2Material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(views[2].background),
  });

  camera1Mesh = new THREE.Mesh(cameraGeometry, camera1Material);
  camera2Mesh = new THREE.Mesh(cameraGeometry, camera2Material);
  scene.add(camera1Mesh, camera2Mesh);

  controls.attach(camera2Mesh);
  controlTarget = camera2Mesh;
  scene.add(controls);

  const gui = new GUI();
  gui.close();
  gui.add(mainCameraPosition, "z").max(50).min(20).step(1);

  const camera2Folder = gui.addFolder("Red Camera");
  const camera2PositionFolder = camera2Folder.addFolder("Position");
  camera2PositionFolder.add(camera2Position, "x").max(10).min(-10).step(0.1).listen();
  camera2PositionFolder.add(camera2Position, "y").max(10).min(-10).step(0.1).listen();
  camera2PositionFolder.add(camera2Position, "z").max(10).min(-10).step(0.1).listen();

  const camera1Folder = gui.addFolder("Green Camera");
  const camera1PositionFolder = camera1Folder.addFolder("Position");
  camera1PositionFolder.add(camera1Position, "x").max(10).min(-10).step(0.1).listen();
  camera1PositionFolder.add(camera1Position, "y").max(10).min(-10).step(0.1).listen();
  camera1PositionFolder.add(camera1Position, "z").max(10).min(-10).step(0.1).listen();

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Escape": {
        controls.detach();
        break;
      }
      case "1": {
        controls.attach(camera2Mesh);
        controlTarget = camera2Mesh;
        break;
      }
      case "2": {
        controls.attach(camera1Mesh);
        controlTarget = camera1Mesh;
        break;
      }
      default: {
        break;
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
};

const updateSize = () => {
  if (windowWidth != window.innerWidth || windowHeight != window.innerHeight) {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    renderer.setSize(windowWidth, windowHeight);
  }
};

const render = () => {
  updateSize();

  views.forEach((view, idx) => {
    const camera = view.camera as THREE.PerspectiveCamera;
    view.updateCamera(camera);

    if (idx !== 0) {
      camera1Mesh.position.set(camera1Position.x, camera1Position.y, camera1Position.z);
      camera1RotationMatrix.lookAt(ORIGIN, camera1Mesh.position, camera1Mesh.up);
      camera1Mesh.quaternion.setFromRotationMatrix(camera1RotationMatrix);

      camera2Mesh.position.set(camera2Position.x, camera2Position.y, camera2Position.z);
      camera2RotationMatrix.lookAt(ORIGIN, camera2Mesh.position, camera2Mesh.up);
      camera2Mesh.quaternion.setFromRotationMatrix(camera2RotationMatrix);
    }

    const width = Math.floor(windowWidth * view.width);
    const height = Math.floor(windowHeight * view.height);
    const left = Math.floor(windowWidth * view.left);
    const bottom = Math.floor(windowHeight * view.bottom);

    renderer.setViewport(left, bottom, width, height);
    renderer.setScissor(left, bottom, width, height);
    renderer.setScissorTest(true);
    renderer.setClearColor(view.background);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);
  });
};

const animate = () => {
  render();
  requestAnimationFrame(animate);
};

init();
animate();
