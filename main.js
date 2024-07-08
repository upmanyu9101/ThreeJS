import * as THREE from 'https://cdn.skypack.dev/three@0.134.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5); // Adjust camera position

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();
loader.load(
    'monkey.glb', // Ensure the path is correct relative to main.js
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
