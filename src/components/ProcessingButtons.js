import React from 'react';
import styled from 'styled-components';
import { useWireframe } from '../contexts/WireframeContext';
import { useImageProcessing } from '../hooks/useImageProcessing';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.8rem;
  background: ${props => props.disabled ? '#555' : '#4a9eff'};
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 1rem;
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
    padding: 1rem;
    font-size: 1.1rem;
  }
`;

const ProcessingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #4a9eff;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #333;
  border-top: 2px solid #4a9eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function ProcessingButtons() {
  const { loadedImages, cvReady, processing, extractedLines } = useWireframe();
  const { processAllImages, reconstruct3D } = useImageProcessing();

  const hasImages = Object.keys(loadedImages).length >= 2;
  const hasExtractedLines = Object.keys(extractedLines).length > 0;
  
  const canProcess = hasImages && cvReady && !processing;
  const canReconstruct = hasExtractedLines && !processing;

  return (
    <ButtonContainer>
      <Button 
        disabled={!canProcess}
        onClick={processAllImages}
      >
        {processing ? 'Processing...' : 'Extract Lines'}
      </Button>
      
      <Button 
        disabled={!canReconstruct}
        onClick={reconstruct3D}
      >
        {processing ? 'Reconstructing...' : 'Reconstruct 3D'}
      </Button>

      {processing && (
        <ProcessingIndicator>
          <Spinner />
          Processing images...
        </ProcessingIndicator>
      )}
    </ButtonContainer>
  );
}

export default ProcessingButtons;