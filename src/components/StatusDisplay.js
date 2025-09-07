import React from 'react';
import styled from 'styled-components';
import { useWireframe } from '../contexts/WireframeContext';

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const StatsBox = styled.div`
  background: #2a4a2a;
  padding: 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.4;
  border-left: 3px solid #4a9eff;
`;

const StatusBox = styled.div`
  background: #333;
  padding: 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  max-height: 120px;
  overflow-y: auto;
  line-height: 1.4;
  border: 1px solid #444;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #222;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #666;
  }

  @media (max-width: 767px) {
    max-height: 100px;
  }
`;

const StatusMessage = styled.div`
  margin-bottom: 0.3rem;
  color: #ccc;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &.success {
    color: #4ade80;
  }
  
  &.error {
    color: #f87171;
  }
  
  &.warning {
    color: #fbbf24;
  }
`;

const SectionLabel = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #4a9eff;
  font-size: 0.9rem;
  font-weight: 600;
`;

function StatusDisplay() {
  const { stats, status, cvReady } = useWireframe();

  const formatStatus = (statusText) => {
    const messages = statusText.split('<br>').filter(msg => msg.trim());
    
    return messages.map((message, index) => {
      let className = '';
      if (message.includes('successfully') || message.includes('loaded') || message.includes('ready')) {
        className = 'success';
      } else if (message.includes('error') || message.includes('failed')) {
        className = 'error';
      } else if (message.includes('processing') || message.includes('extracting')) {
        className = 'warning';
      }
      
      return (
        <StatusMessage key={index} className={className}>
          {message}
        </StatusMessage>
      );
    });
  };

  return (
    <StatusContainer>
      <div>
        <SectionLabel>Statistics</SectionLabel>
        <StatsBox>
          {stats}
          {!cvReady && (
            <div style={{ marginTop: '0.5rem', color: '#fbbf24', fontSize: '0.8rem' }}>
              ⚠️ OpenCV loading...
            </div>
          )}
        </StatsBox>
      </div>
      
      <div>
        <SectionLabel>Processing Status</SectionLabel>
        <StatusBox>
          {formatStatus(status)}
        </StatusBox>
      </div>
    </StatusContainer>
  );
}

export default StatusDisplay;