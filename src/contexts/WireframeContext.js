import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { initOpenCV } from '../utils/opencv';

const WireframeContext = createContext();

const initialState = {
  loadedImages: {},
  extractedLines: {},
  matchedLines: [],
  vertices3D: [],
  edges3D: [],
  processing: false,
  cvReady: false,
  status: 'Load 2-3 wireframe images to begin...',
  stats: 'Ready to process wireframes...',
  settings: {
    lineThreshold: 30,
    minLineLength: 20,
    lineGap: 5,
    matchTolerance: 0.3
  }
};

function wireframeReducer(state, action) {
  switch (action.type) {
    case 'SET_CV_READY':
      return {
        ...state,
        cvReady: action.payload,
        status: action.payload ? 'OpenCV loaded - ready to process images' : state.status
      };
    
    case 'SET_LOADED_IMAGE':
      return {
        ...state,
        loadedImages: {
          ...state.loadedImages,
          [action.payload.viewName]: action.payload.imageData
        },
        status: `Loaded ${action.payload.viewName} view (${Object.keys({...state.loadedImages, [action.payload.viewName]: action.payload.imageData}).length}/3 images)`
      };
    
    case 'SET_EXTRACTED_LINES':
      return {
        ...state,
        extractedLines: action.payload,
        status: 'Lines extracted successfully. Click Reconstruct 3D to continue.'
      };
    
    case 'SET_MATCHED_LINES':
      return {
        ...state,
        matchedLines: action.payload,
        stats: `Found ${action.payload.length} line matches`
      };
    
    case 'SET_3D_DATA':
      return {
        ...state,
        vertices3D: action.payload.vertices,
        edges3D: action.payload.edges,
        stats: `Created ${action.payload.vertices.length} vertices and ${action.payload.edges.length} edges`
      };
    
    case 'SET_PROCESSING':
      return {
        ...state,
        processing: action.payload
      };
    
    case 'UPDATE_STATUS':
      return {
        ...state,
        status: action.payload
      };
    
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: action.payload
      };
    
    case 'UPDATE_SETTING':
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.key]: action.payload.value
        }
      };
    
    default:
      return state;
  }
}

export function WireframeProvider({ children }) {
  const [state, dispatch] = useReducer(wireframeReducer, initialState);

  useEffect(() => {
    initOpenCV().then(() => {
      dispatch({ type: 'SET_CV_READY', payload: true });
    });
  }, []);

  const value = {
    ...state,
    dispatch
  };

  return (
    <WireframeContext.Provider value={value}>
      {children}
    </WireframeContext.Provider>
  );
}

export function useWireframe() {
  const context = useContext(WireframeContext);
  if (context === undefined) {
    throw new Error('useWireframe must be used within a WireframeProvider');
  }
  return context;
}