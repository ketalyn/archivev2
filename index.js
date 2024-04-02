import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const ModelViewer = () => {
    const sceneRef = useRef(); // Create a ref for the scene

    useEffect(() => {
        console.log('Attempting to load model...');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xffffff, 0);
        sceneRef.current.appendChild(renderer.domElement);

        console.log('Scene, camera, and renderer initialized successfully.');

        // Load GLTF model
        const loader = new GLTFLoader();
        const modelPath = './assets/toner/toner.glb';
        console.log('Loading model from:', modelPath);
        loader.load(modelPath, result => {
            console.log('Model loaded successfully:', result);
            const model = result.scene;
            model.traverse(obj => {
                if (obj.isMesh) {
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                    obj.material = new THREE.MeshStandardMaterial({ color: 0xCCCCCC }); // Apply a basic material
                }
            });
            scene.add(model);
            model.position.set(-14, 0, -7);
            const boundingBox = new THREE.Box3().setFromObject(model);
            const modelSize = boundingBox.getSize(new THREE.Vector3());
            const maxModelSize = Math.max(modelSize.x, modelSize.y, modelSize.z);
            const distance = maxModelSize / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
            camera.position.set(0, 5, distance * 2);
            camera.lookAt(model.position);
        }, undefined, function(error) {
            console.error('Error loading model:', error);
        });

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 100, 100);
        scene.add(directionalLight);
        const skyColor = 0x888888;
        const groundColor = 0x888888;
        const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, 0.2);
        scene.add(hemisphereLight);
        const sun = new THREE.SpotLight(0xffffff, 1);
        sun.position.set(10, 80, 80);
        sun.castShadow = true;
        sun.shadow.bias = -0.0001;
        sun.shadow.mapSize = new THREE.Vector2(2048, 2048);
        scene.add(sun);

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = false;

        // Update camera and renderer on window resize
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            // Cleanup
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div ref={sceneRef}></div> // Return JSX element with ref
    );
};

export default ModelViewer;
