import * as THREE from 'https://cdn.skypack.dev/three@0.134.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();

// Set a light background color
const backgroundColor = 0xf0f0f0; //0x87CEFA;
scene.background = new THREE.Color(backgroundColor);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Improve quality
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.enablePan = true; // Enable panning

const loader = new GLTFLoader();
loader.load(
    'lowpoly_earth.glb', // Ensure the path is correct relative to main.js
    function (gltf) {
        const model = gltf.scene;
        scene.add(model);

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Optionally, enable animations
        const animations = gltf.animations;
        if (animations && animations.length) {
            const mixer = new THREE.AnimationMixer(model);
            animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });

            // Animation loop
            function animate() {
                requestAnimationFrame(animate);
                mixer.update(0.01); // adjust time delta as needed
                controls.update(); // update controls
                renderer.render(scene, camera); // render scene
            }

            animate();
        } else {
            // Regular animation loop without animations
            function animate() {
                requestAnimationFrame(animate);
                controls.update(); // update controls
                renderer.render(scene, camera); // render scene
            }

            animate();
        }
    },
    undefined,
    function (error) {
        console.error('Error loading model:', error);
    }
);

let pins = []; // Array to hold the pin models

// Function to create and add a pin to the scene
function addPin(position, rotation) {
    loader.load(
        'map_pin.glb',
        function (gltf) {
            let pin = gltf.scene;
            // Center the pin model
            const box = new THREE.Box3().setFromObject(pin);
            const center = box.getCenter(new THREE.Vector3());
            pin.position.sub(center);

            pin.position.copy(position);
            pin.rotation.set(rotation.x, rotation.y, rotation.z);
            pin.scale.set(0.4, 0.4, 0.4); // Initial scale of the pin (assuming same as original)
            scene.add(pin);
            pins.push(pin);
        },
        undefined,
        function (error) {
            console.error('Error loading pin model:', error);
        }
    );
}

// Example positions and rotations for 10 additional pins
addPin(new THREE.Vector3(1.3,0.3,-2.8), new THREE.Euler(0, Math.PI / 2, 5));
addPin(new THREE.Vector3(2.3,0.3,-2.4), new THREE.Euler(0, Math.PI / 2.3,5));
addPin(new THREE.Vector3(-0.5,0.5,-2.45), new THREE.Euler(0, Math.PI / 1.7,5));
addPin(new THREE.Vector3(0.1,-0.8,-3), new THREE.Euler(0, -Math.PI / 2,1.5));
addPin(new THREE.Vector3(-1.3,-2.6,-1.6), new THREE.Euler(Math.PI / 1, 1, 1));
//addPin(new THREE.Vector3(1, 2, 2), new THREE.Euler(-Math.PI / 4, 0, 0));
//addPin(new THREE.Vector3(-1, 2, -2), new THREE.Euler(Math.PI / 6, 0, 0));
//addPin(new THREE.Vector3(-2, 2, 2), new THREE.Euler(-Math.PI / 6, 0, 0));
//addPin(new THREE.Vector3(2, 2, 0), new THREE.Euler(0, 0, Math.PI / 3));
//addPin(new THREE.Vector3(-2, 2, 0), new THREE.Euler(0, 0, -Math.PI / 3));


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object === originalPin) {
            console.log('Pin clicked'); // Debugging output
            showPopup();
            break;
        }
    }
}

function showPopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'block';
}

window.addEventListener('click', onMouseClick);

function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
