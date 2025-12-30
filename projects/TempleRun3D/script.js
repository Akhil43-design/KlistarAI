// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);

    // Player (Main Character - Capsule)
    const playerGeometry = new THREE.CapsuleGeometry(0.5, 2, 4, 8);
    const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 1.5, 10);
    scene.add(player);

    // Ground (Moving Road Simulation)
    const groundGeometry = new THREE.PlaneGeometry(20, 1000, 1, 1);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x808080, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Game Variables
    let score = 0;
    let isAlive = true;
    const obstacles = [];
    const obstacleSpeed = 0.1;
    const scoreElement = document.createElement('div');
    scoreElement.style.position = 'absolute';
    scoreElement.style.top = '10px';
    scoreElement.style.left = '10px';
    scoreElement.style.color = 'white';
    scoreElement.style.fontSize = '24px';
    document.body.appendChild(scoreElement);

    function updateScore() {
        score += 0.1; // Continuous score
        scoreElement.innerText = `Score: ${Math.floor(score)}`;
    }

    // Procedural Obstacle Generation
    function addObstacle() {
        if (!isAlive) return;
        const obstacleGeometry = new THREE.BoxGeometry(1, 2, 1);
        const obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);

        // Randomize position (simple lanes)
        const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        obstacle.position.set(lane * 3, 1, camera.position.z - 40); // Spawn far ahead

        scene.add(obstacle);
        obstacles.push(obstacle);
    }

    setInterval(addObstacle, 2000); // Add obstacle every 2 seconds

    // Controls
    document.addEventListener('keydown', (event) => {
        if (!isAlive) return;
        const moveDistance = 0.5;
        if (event.key === 'ArrowLeft') {
            player.position.x -= moveDistance;
        } else if (event.key === 'ArrowRight') {
            player.position.x += moveDistance;
        }
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        if (isAlive) {
            // Simulate moving road by moving obstacles and camera forward
            camera.position.z -= obstacleSpeed;
            player.position.z -= obstacleSpeed;

            // Move obstacles towards player and check collisions
            obstacles.forEach((obstacle, index) => {
                obstacle.position.z += obstacleSpeed; // Obstacles move relative to constant camera speed simulation

                // Collision detection (simple bounding box approximation)
                const playerBox = new THREE.Box3().setFromObject(player);
                const obstacleBox = new THREE.Box3().setFromObject(obstacle);

                if (playerBox.intersectsBox(obstacleBox)) {
                    isAlive = false;
                    scoreElement.innerText += " - Game Over!";
                }

                // Remove passed obstacles
                if (obstacle.position.z > camera.position.z) {
                    scene.remove(obstacle);
                    obstacles.splice(index, 1);
                }
            });

            updateScore();
        }

        renderer.render(scene, camera);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
});
