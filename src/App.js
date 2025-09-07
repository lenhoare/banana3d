import React from 'react';
import styled from 'styled-components';
import ControlPanel from './components/ControlPanel';
import ThreeViewer from './components/ThreeViewer';
import { WireframeProvider } from './contexts/WireframeContext';
import './App.css';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a1a;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const Header = styled.header`
  background: #2a2a2a;
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #333;

  @media (min-width: 768px) {
    display: none;
  }

  h1 {
    margin: 0;
    font-size: 1.2rem;
    color: #4a9eff;
  }
`;

function App() {
  return (
    <WireframeProvider>
      <AppContainer>
        <Header>
          <h1>Wireframe 3D Reconstruction</h1>
        </Header>
        <ControlPanel />
        <ThreeViewer />
      </AppContainer>
    </WireframeProvider>
  );
}

export default App;
