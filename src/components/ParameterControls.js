import React from 'react';
import styled from 'styled-components';
import { useWireframe } from '../contexts/WireframeContext';

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SliderGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SliderLabel = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #ccc;
  font-weight: 500;
`;

const SliderValue = styled.span`
  color: #4a9eff;
  font-weight: 600;
  min-width: 3rem;
  text-align: right;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #3a3a3a;
  outline: none;
  border: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4a9eff;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4a9eff;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
`;

const ParameterDescription = styled.div`
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.2rem;
  line-height: 1.3;
`;

function ParameterControls() {
  const { settings, dispatch } = useWireframe();

  const updateSetting = (key, value) => {
    dispatch({
      type: 'UPDATE_SETTING',
      payload: { key, value }
    });
  };

  const sliderConfigs = [
    {
      key: 'lineThreshold',
      label: 'Line Detection Threshold',
      min: 20,
      max: 100,
      step: 1,
      description: 'Lower values detect more lines but may include noise'
    },
    {
      key: 'minLineLength',
      label: 'Min Line Length',
      min: 10,
      max: 50,
      step: 1,
      description: 'Minimum pixel length for detected lines'
    },
    {
      key: 'lineGap',
      label: 'Line Gap Tolerance',
      min: 2,
      max: 15,
      step: 1,
      description: 'Maximum gap between line segments to connect'
    },
    {
      key: 'matchTolerance',
      label: 'Match Tolerance',
      min: 0.1,
      max: 0.8,
      step: 0.1,
      description: 'How similar lines must be to match across views'
    }
  ];

  return (
    <ControlsContainer>
      {sliderConfigs.map(({ key, label, min, max, step, description }) => (
        <SliderGroup key={key}>
          <SliderLabel>
            {label}:
            <SliderValue>{settings[key]}</SliderValue>
          </SliderLabel>
          <Slider
            type="range"
            min={min}
            max={max}
            step={step}
            value={settings[key]}
            onChange={(e) => updateSetting(key, parseFloat(e.target.value))}
          />
          <ParameterDescription>{description}</ParameterDescription>
        </SliderGroup>
      ))}
    </ControlsContainer>
  );
}

export default ParameterControls;