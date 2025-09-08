# Banana 3D

A React application that uses Googles Nano Banana image model to create wireframe images
These are then turned into interactive 3D line models using computer vision and Three.js.
These can then be downloaded as .obj files for printing or adding to games / CAD.


https://banana3d-353b5.web.app/


## Features

- **Image Upload**: Support for multiple views (Front/Perspective, Side, Rear/Back)
- **Line Detection**: Automatic line extraction using OpenCV.js
- **3D Reconstruction**: Triangulation and matching of lines across views
- **Interactive 3D Viewer**: Rotate, zoom, and explore the reconstructed wireframe
- **Export Options**: Download results in OBJ, PLY, or JSON formats
- **Mobile Responsive**: Optimized for both desktop and mobile devices

## Technology Stack

- **React**: Component-based UI framework
- **Three.js**: 3D graphics and visualization
- **OpenCV.js**: Computer vision and image processing
- **Styled Components**: CSS-in-JS styling
- **Create React App**: Build tooling and development server

## Project Structure

```
src/
├── components/          # React components
│   ├── ControlPanel.js     # Main control panel layout
│   ├── ImageUpload.js      # File upload and preview
│   ├── ParameterControls.js # Slider controls for processing
│   ├── ProcessingButtons.js # Extract/Reconstruct buttons
│   ├── StatusDisplay.js    # Status and statistics display
│   ├── ExportButtons.js    # Export functionality
│   └── ThreeViewer.js      # 3D scene viewer
├── contexts/           # React context
│   └── WireframeContext.js # Global state management
├── hooks/             # Custom React hooks
│   ├── useImageProcessing.js # OpenCV processing logic
│   ├── useThreeScene.js     # Three.js scene management
│   └── useExport.js         # File export utilities
├── utils/             # Utilities
│   └── opencv.js           # OpenCV initialization
├── App.js            # Main application component
└── App.css           # Global styles
```

## Getting Started

### Prerequisites

- Node.js (14.0 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd Banana3D
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Upload Images**: Use the file inputs to upload 2-3 images from different viewpoints
2. **Adjust Parameters**: Fine-tune line detection settings using the sliders
3. **Extract Lines**: Click "Extract Lines" to detect lines in the uploaded images
4. **Reconstruct 3D**: Click "Reconstruct 3D" to create the 3D wireframe model
5. **Interact**: Use mouse/touch to rotate and zoom the 3D view
6. **Export**: Download the results in your preferred format

### Controls

- **Desktop**: Click and drag to rotate, scroll to zoom
- **Mobile**: Single finger drag to rotate, pinch to zoom

## Image Processing Parameters

- **Line Detection Threshold**: Sensitivity for detecting lines (lower = more lines)
- **Min Line Length**: Minimum pixel length for detected lines
- **Line Gap Tolerance**: Maximum gap between line segments to connect
- **Match Tolerance**: Similarity threshold for matching lines across views

## Export Formats

- **OBJ**: Wavefront OBJ format with vertices and line elements
- **PLY**: Polygon File Format with vertex and edge data
- **JSON**: Complete processing data including metadata and line matches

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch controls

## Performance Notes

- OpenCV.js loads asynchronously on startup
- Large images are resized to 512x512 for processing
- 3D rendering uses WebGL for optimal performance

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## License

This project was created for educational and research purposes.
