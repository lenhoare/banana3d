import React from 'react';
import styled from 'styled-components';
import ImageUpload from './ImageUpload';
import ParameterControls from './ParameterControls';
import ProcessingButtons from './ProcessingButtons';
import StatusDisplay from './StatusDisplay';
import ExportButtons from './ExportButtons';

const ControlsContainer = styled.div`
  width: 100%;
  background: #2a2a2a;
  padding: 1rem;
  overflow-y: auto;
  border-bottom: 1px solid #333;

  @media (min-width: 768px) {
    width: 400px;
    max-height: 100vh;
    border-bottom: none;
    border-right: 1px solid #333;
  }
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #4a9eff;
  font-size: 1.1rem;
  font-weight: 600;

  @media (min-width: 768px) {
    display: block;
  }
`;

const MainTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  color: #4a9eff;
  font-size: 1.3rem;
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

function ControlPanel() {

  return (
    <ControlsContainer>
      <MainTitle>Wireframe to 3D Lines</MainTitle>
      
      <Section>
        <SectionTitle>Input Images</SectionTitle>
        <ImageUpload />
      </Section>

      <Section>
        <ParameterControls />
      </Section>

      <Section>
        <ProcessingButtons />
      </Section>

      <Section>
        <StatusDisplay />
      </Section>

      <Section>
        <SectionTitle>Export Options</SectionTitle>
        <ExportButtons />
      </Section>
    </ControlsContainer>
  );
}

export default ControlPanel;