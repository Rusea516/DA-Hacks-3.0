// Import Three.js essentials and setup renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.z = 150;



// Ambient and Directional lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5).normalize();
scene.add(directionalLight);

// Tooltip setup
const tooltip = document.createElement("div");
tooltip.style.position = "absolute";
tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
tooltip.style.padding = "5px";
tooltip.style.borderRadius = "4px";
tooltip.style.color = "white";
tooltip.style.display = "none";
document.body.appendChild(tooltip);

// Sun setup with warmer red glow
const sunTexture = new THREE.TextureLoader().load('sun.jpg'); // Replace with actual path

const sunMaterial = new THREE.MeshStandardMaterial({
    map: sunTexture,
    color: 0xFF6347, // Red tint for the texture
    emissive: 0xFF4500, // Emissive color for glow effect
    emissiveMap: sunTexture,
    emissiveIntensity: 1.5
});

const sunGeometry = new THREE.SphereGeometry(8, 64, 64); // Sun size and detail
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Optional glow around the sun
const glowGeometry = new THREE.SphereGeometry(9, 64, 64); // Slightly larger than the sun
const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF6347,         // Reddish glow color
    transparent: true,
    opacity: 0.5,            // Adjust for desired glow intensity
    blending: THREE.AdditiveBlending // Additive blending for a radiant effect
});
const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(sunGlow);




function animateSunTexture() {
    sunMaterial.map.offset.x += 0.001; // Adjust the speed for desired effect
    sunMaterial.map.offset.y += 0.001;
}


// Load textures for planets
const loader = new THREE.TextureLoader();
const planetTextures = {
    Mercury: loader.load('mercury.jpg'),
    Venus: loader.load('venus.jpg'),
    Earth: loader.load('earth.jpg'),
    Mars: loader.load('mars.jpg'),
    Jupiter: loader.load('jupiter.jpg'),
    Saturn: loader.load('saturn.jpg'),
    Uranus: loader.load('uranus.jpg'),
    Neptune: loader.load('neptune.jpg'),
};

// Define planets with realistic distances, sizes, and speeds
const planets = [
    { name: "Mercury", texture: planetTextures.Mercury, distance: 20, size: 1, speed: 0.02, info: "Smallest planet" },
    { name: "Venus", texture: planetTextures.Venus, distance: 30, size: 1.2, speed: 0.015, info: "Hot and volcanic" },
    { name: "Earth", texture: planetTextures.Earth, distance: 40, size: 1.3, speed: 0.01, info: "Our home" },
    { name: "Mars", texture: planetTextures.Mars, distance: 50, size: 1.1, speed: 0.008, info: "The Red Planet" },
    { name: "Jupiter", texture: planetTextures.Jupiter, distance: 70, size: 2.5, speed: 0.005, info: "Largest planet" },
    { name: "Saturn", texture: planetTextures.Saturn, distance: 90, size: 2.1, speed: 0.004, info: "Has rings", hasrings: true },
    { name: "Uranus", texture: planetTextures.Uranus, distance: 110, size: 1.7, speed: 0.003, info: "Icy giant" },
    { name: "Neptune", texture: planetTextures.Neptune, distance: 130, size: 1.7, speed: 0.002, info: "Farthest planet" },
];

// Pause and resume functionality
let isPaused = false;
function pauseAnimation() {
    isPaused = true;
}
function resumeAnimation() {
    isPaused = false;
}

// Modal elements
const planetModal = document.createElement("div");
planetModal.id = "planetModal";
planetModal.style.display = "none";
planetModal.style.position = "fixed";
planetModal.style.zIndex = "100";
planetModal.style.width = "80%";
planetModal.style.maxWidth = "600px";
planetModal.style.margin = "15% auto";
planetModal.style.padding = "20px";
planetModal.style.background = "#333";
planetModal.style.color = "white";
planetModal.style.textAlign = "center";
planetModal.style.borderRadius = "5px";
planetModal.innerHTML = `
    <span onclick="closeModal()" style="cursor:pointer;float:right;font-size:28px;">&times;</span>
    <h2 id="planetName"></h2>
    <p id="planetInfo"></p>
`;
document.body.appendChild(planetModal);

const planetNameElem = document.getElementById("planetName");
const planetInfoElem = document.getElementById("planetInfo");

function closeModal() {
    planetModal.style.display = "none";
}

// Create planets with click events
planets.forEach(planet => {
    const geometry = new THREE.SphereGeometry(planet.size, 64, 64);
    const material = new THREE.MeshStandardMaterial({ map: planet.texture });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { name: planet.name, info: planet.info };
    mesh.position.set(planet.distance, 0, 0);
    planet.mesh = mesh;
    planet.angle = 0;
    scene.add(mesh);

    // Add click event for planet
    mesh.onClick = () => {
        planetNameElem.textContent = planet.name;
        planetInfoElem.textContent = planet.info;
        planetModal.style.display = "block";
    };

    // Create labels for planets
    const label = document.createElement('div');
    label.textContent = planet.name;
    label.style.position = 'absolute';
    label.style.color = 'white';
    label.style.pointerEvents = 'none';
    document.body.appendChild(label);
    planet.label = label;
});

// Orbit Controls for zoom and pan functionality
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 30;
controls.maxDistance = 250;

// Raycaster setup for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', event => {
    // Convert mouse position to normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersected by ray
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        if (selectedObject.onClick) selectedObject.onClick();
    }
});

// Star field function
function addStarField() {
    for (let i = 0; i < 5000; i++) {
        const starGeometry = new THREE.SphereGeometry(0.1, 24, 24);
        const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000);
        scene.add(star);
    }
}
addStarField();

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (!isPaused) {
        planets.forEach(planet => {
            // Orbiting functionality
            planet.angle += planet.speed;
            planet.mesh.position.x = planet.distance * Math.cos(planet.angle);
            planet.mesh.position.z = planet.distance * Math.sin(planet.angle);

            // Update label position
            const vector = planet.mesh.position.clone().project(camera);
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
            planet.label.style.left = `${x}px`;
            planet.label.style.top = `${y}px`;
        });
        // Animate the sun texture
    }

    controls.update();
    renderer.render(scene, camera);
}
animate();

// Adjust renderer on window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Expose pause and resume functions for HTML buttons
window.pauseAnimation = pauseAnimation;
window.resumeAnimation = resumeAnimation;
