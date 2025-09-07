import React from 'react';
import styled from 'styled-components';
import { useWireframe } from '../contexts/WireframeContext';
import { useExport } from '../hooks/useExport';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-top: 1rem;
  border-top: 1px solid #555;
`;

const ExportButton = styled.button`
  width: 100%;
  padding: 0.7rem;
  background: ${props => props.disabled ? '#555' : '#4a9eff'};
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.disabled ? '#555' : '#357abd'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(1px)'};
  }

  @media (max-width: 767px) {
    padding: 0.9rem;
    font-size: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`;

function ExportButtons() {
  const { vertices3D, edges3D } = useWireframe();
  const { exportOBJ, exportPLY, exportJSON } = useExport();

  const hasData = vertices3D.length > 0 && edges3D.length > 0;

  return (
    <ButtonContainer>
      <ExportButton 
        disabled={!hasData}
        onClick={exportJSON}
      >
        📊 Download 3D Data (JSON)
      </ExportButton>
      
      <ButtonGroup>
        <ExportButton 
          disabled={!hasData}
          onClick={exportOBJ}
        >
          📐 OBJ
        </ExportButton>
        
        <ExportButton 
          disabled={!hasData}
          onClick={exportPLY}
        >
          🔧 PLY
        </ExportButton>
      </ButtonGroup>
    </ButtonContainer>
  );
}

export default ExportButtons;