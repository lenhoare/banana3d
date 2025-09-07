import React from 'react';
import styled from 'styled-components';
import { useWireframe } from '../contexts/WireframeContext';

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FileInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #ccc;
  font-weight: 500;
`;

const FileInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  background: #3a3a3a;
  border: 1px solid #555;
  border-radius: 4px;
  color: white;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #4a9eff;
  }

  &::file-selector-button {
    background: #4a9eff;
    border: none;
    padding: 0.3rem 0.8rem;
    color: white;
    border-radius: 3px;
    margin-right: 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
  }

  &::file-selector-button:hover {
    background: #357abd;
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
`;

const PreviewItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const PreviewLabel = styled.div`
  font-size: 0.8rem;
  color: #aaa;
`;

const PreviewCanvas = styled.canvas`
  width: 100%;
  max-height: 150px;
  border: 1px solid #555;
  border-radius: 4px;
  object-fit: contain;
  background: #000;

  @media (min-width: 768px) {
    max-height: 180px;
  }
`;

function ImageUpload() {
  const { loadedImages, dispatch } = useWireframe();

  const handleImageUpload = (event, viewName) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 256, 256);

        dispatch({
          type: 'SET_LOADED_IMAGE',
          payload: {
            viewName,
            imageData: { img, canvas: null }
          }
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const renderPreview = (viewName, data) => {
    if (!data) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (data.canvas) {
      ctx.drawImage(data.canvas, 0, 0, 256, 256);
    } else {
      ctx.drawImage(data.img, 0, 0, 256, 256);
    }

    return (
      <PreviewItem key={viewName}>
        <PreviewLabel>
          {viewName.charAt(0).toUpperCase() + viewName.slice(1)} 
          {data.canvas ? ' (with detected lines)' : ' (original)'}
        </PreviewLabel>
        <PreviewCanvas 
          ref={(canvasRef) => {
            if (canvasRef) {
              const context = canvasRef.getContext('2d');
              context.drawImage(canvas, 0, 0, canvasRef.width, canvasRef.height);
            }
          }}
          width={256}
          height={256}
        />
      </PreviewItem>
    );
  };

  return (
    <UploadContainer>
      <FileInputGroup>
        <Label>Front/Perspective View:</Label>
        <FileInput 
          type="file" 
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'front')}
        />
      </FileInputGroup>

      <FileInputGroup>
        <Label>Side View:</Label>
        <FileInput 
          type="file" 
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'side')}
        />
      </FileInputGroup>

      <FileInputGroup>
        <Label>Rear/Back View:</Label>
        <FileInput 
          type="file" 
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'rear')}
        />
      </FileInputGroup>

      <PreviewContainer>
        {Object.entries(loadedImages).map(([viewName, data]) => 
          renderPreview(viewName, data)
        )}
      </PreviewContainer>
    </UploadContainer>
  );
}

export default ImageUpload;