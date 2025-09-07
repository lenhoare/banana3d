import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useWireframe } from '../contexts/WireframeContext';
import { useThreeScene } from '../hooks/useThreeScene';

const ViewerContainer = styled.div`
  flex: 1;
  background: #000;
  border-radius: 0;
  position: relative;
  min-height: 300px;
  
  @media (min-width: 768px) {
    border-radius: 8px;
    margin: 1rem;
    margin-left: 0;
  }
`;

const ViewerInstructions = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: #ccc;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.4;
  border: 1px solid #333;
  display: ${props => props.show ? 'block' : 'none'};
  
  @media (max-width: 767px) {
    font-size: 0.8rem;
    padding: 0.8rem;
  }
`;

const InstructionsList = styled.ul`
  margin: 0.5rem 0 0 0;
  padding-left: 1.2rem;
  
  li {
    margin-bottom: 0.3rem;
    
    @media (max-width: 767px) {
      margin-bottom: 0.2rem;
    }
  }
`;

const LoadingIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #4a9eff;
  font-size: 1.1rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top: 3px solid #4a9eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function ThreeViewer() {
  const mountRef = useRef(null);
  const { vertices3D, edges3D, processing } = useWireframe();
  const { initScene, updateMesh, cleanup } = useThreeScene(mountRef);

  useEffect(() => {
    if (mountRef.current) {
      initScene();
    }
    
    return cleanup;
  }, [initScene, cleanup]);

  useEffect(() => {
    if (vertices3D.length > 0 && edges3D.length > 0) {
      updateMesh(vertices3D, edges3D);
    }
  }, [vertices3D, edges3D, updateMesh]);

  const showInstructions = vertices3D.length === 0 && !processing;

  return (
    <ViewerContainer ref={mountRef}>
      <ViewerInstructions show={showInstructions}>
        <strong>3D Viewer Controls:</strong>
        <InstructionsList>
          <li><strong>Mouse:</strong> Click and drag to rotate view</li>
          <li><strong>Scroll:</strong> Zoom in/out</li>
          <li><strong>Touch:</strong> Single finger drag to rotate, pinch to zoom</li>
        </InstructionsList>
        Load wireframe images and process them to see the 3D reconstruction.
      </ViewerInstructions>
      
      {processing && (
        <LoadingIndicator>
          <Spinner />
          Processing wireframes...
        </LoadingIndicator>
      )}
    </ViewerContainer>
  );
}

export default ThreeViewer;