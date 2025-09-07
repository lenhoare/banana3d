import { useCallback, useRef } from 'react';
import * as THREE from 'three';

export function useThreeScene(mountRef) {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const lineMeshRef = useRef(null);
  const pointsRef = useRef(null);
  const animationRef = useRef(null);
  const controlsRef = useRef(null);

  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    const viewer = mountRef.current;
    
    // Clear any existing content
    viewer.innerHTML = '';
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      viewer.offsetWidth / viewer.offsetHeight, 
      0.1, 
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewer.offsetWidth, viewer.offsetHeight);
    viewer.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Add grid
    const gridHelper = new THREE.GridHelper(4, 20, 0x333333, 0x222222);
    scene.add(gridHelper);

    // Add axis helper
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    // Add a test cube to verify the scene is working
    const testGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const testMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.position.set(1, 1, 1);
    scene.add(testCube);

    // Setup controls
    setupControls(renderer, camera);

    // Start animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!viewer || !camera || !renderer) return;
      
      camera.aspect = viewer.offsetWidth / viewer.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(viewer.offsetWidth, viewer.offsetHeight);
    };

    window.addEventListener('resize', handleResize);
    
    // Store cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, [mountRef]);

  const setupControls = (renderer, camera) => {
    let isMouseDown = false;
    let mouseX = 0, mouseY = 0;

    const handleMouseDown = (e) => {
      isMouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
      e.preventDefault();
    };

    const handleMouseUp = (e) => {
      isMouseDown = false;
      e.preventDefault();
    };

    const handleMouseMove = (e) => {
      if (!isMouseDown || !cameraRef.current) return;

      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      // Rotate camera around origin
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(cameraRef.current.position);
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      cameraRef.current.position.setFromSpherical(spherical);
      cameraRef.current.lookAt(0, 0, 0);

      mouseX = e.clientX;
      mouseY = e.clientY;
      e.preventDefault();
    };

    const handleWheel = (e) => {
      if (!cameraRef.current) return;
      
      e.preventDefault();
      const scale = e.deltaY > 0 ? 1.1 : 0.9;
      cameraRef.current.position.multiplyScalar(scale);
    };

    // Touch controls for mobile
    let lastTouch = null;
    
    const handleTouchStart = (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (!cameraRef.current) return;

      if (e.touches.length === 1 && lastTouch) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouch.x;
        const deltaY = touch.clientY - lastTouch.y;

        // Rotate camera around origin
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(cameraRef.current.position);
        spherical.theta -= deltaX * 0.01;
        spherical.phi += deltaY * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

        cameraRef.current.position.setFromSpherical(spherical);
        cameraRef.current.lookAt(0, 0, 0);

        lastTouch = { x: touch.clientX, y: touch.clientY };
      } else if (e.touches.length === 2) {
        // Pinch to zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + 
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        if (lastTouch && lastTouch.distance) {
          const scale = lastTouch.distance / distance;
          cameraRef.current.position.multiplyScalar(Math.max(0.5, Math.min(2.0, scale)));
        }
        
        lastTouch = { distance };
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      lastTouch = null;
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown, { passive: false });
    renderer.domElement.addEventListener('mouseup', handleMouseUp, { passive: false });
    renderer.domElement.addEventListener('mousemove', handleMouseMove, { passive: false });
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });
    
    renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Store controls reference for cleanup
    controlsRef.current = {
      dispose: () => {
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('mouseup', handleMouseUp);
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('wheel', handleWheel);
        renderer.domElement.removeEventListener('touchstart', handleTouchStart);
        renderer.domElement.removeEventListener('touchmove', handleTouchMove);
        renderer.domElement.removeEventListener('touchend', handleTouchEnd);
      }
    };
  };

  const updateMesh = useCallback((vertices3D, edges3D) => {
    if (!sceneRef.current) {
      console.warn('Scene not initialized');
      return;
    }

    console.log('Updating mesh with', vertices3D.length, 'vertices and', edges3D.length, 'edges');

    // Remove existing meshes
    if (lineMeshRef.current) {
      sceneRef.current.remove(lineMeshRef.current);
      lineMeshRef.current.geometry.dispose();
      lineMeshRef.current.material.dispose();
      lineMeshRef.current = null;
    }
    if (pointsRef.current) {
      sceneRef.current.remove(pointsRef.current);
      pointsRef.current.geometry.dispose();
      pointsRef.current.material.dispose();
      pointsRef.current = null;
    }

    if (vertices3D.length === 0) {
      console.warn('No vertices to display');
      return;
    }

    // Create line geometry
    const geometry = new THREE.BufferGeometry();

    // Create line segments
    const positions = [];
    const colors = [];

    edges3D.forEach(edge => {
      const v1 = vertices3D[edge[0]];
      const v2 = vertices3D[edge[1]];

      if (!v1 || !v2) {
        console.warn('Missing vertex for edge', edge);
        return;
      }

      positions.push(v1.x, v1.y, v1.z);
      positions.push(v2.x, v2.y, v2.z);

      // Color based on confidence/similarity - bright cyan for visibility
      colors.push(0, 1, 1);
      colors.push(0, 1, 1);
    });

    if (positions.length === 0) {
      console.warn('No valid positions generated');
      return;
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({ 
      vertexColors: true, 
      linewidth: 2
    });

    const lineMesh = new THREE.LineSegments(geometry, material);
    sceneRef.current.add(lineMesh);
    lineMeshRef.current = lineMesh;

    // Add vertex points for better visibility
    const pointGeometry = new THREE.BufferGeometry();
    const pointPositions = [];
    vertices3D.forEach(v => {
      pointPositions.push(v.x, v.y, v.z);
    });
    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPositions, 3));

    const pointMaterial = new THREE.PointsMaterial({ 
      color: 0xff0000, 
      size: 0.1
    });

    const points = new THREE.Points(pointGeometry, pointMaterial);
    sceneRef.current.add(points);
    pointsRef.current = points;

    console.log('Mesh updated successfully');
  }, []);

  const cleanup = useCallback(() => {
    console.log('Cleaning up Three.js scene');
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (controlsRef.current) {
      controlsRef.current.dispose();
    }

    if (lineMeshRef.current) {
      lineMeshRef.current.geometry.dispose();
      lineMeshRef.current.material.dispose();
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.dispose();
      pointsRef.current.material.dispose();
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      if (mountRef.current && rendererRef.current.domElement) {
        try {
          mountRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {
          // Element might already be removed
        }
      }
    }
  }, [mountRef]);

  return {
    initScene,
    updateMesh,
    cleanup
  };
}