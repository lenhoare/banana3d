import { useCallback } from 'react';
import { useWireframe } from '../contexts/WireframeContext';
import { getCV } from '../utils/opencv';

export function useImageProcessing() {
  const { loadedImages, settings, extractedLines, dispatch } = useWireframe();

  const extractLinesFromImage = useCallback((img, viewName, canvas) => {
    try {
      const cv = getCV();
      if (!cv) {
        throw new Error('OpenCV not loaded');
      }

      // Create canvas and draw image
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 512, 512);

      // Convert to OpenCV format
      const imageData = ctx.getImageData(0, 0, 512, 512);
      const src = cv.matFromImageData(imageData);

      // Convert to grayscale
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      // Apply Gaussian blur to reduce noise
      const blurred = new cv.Mat();
      cv.GaussianBlur(gray, blurred, new cv.Size(3, 3), 0);

      // Edge detection
      const edges = new cv.Mat();
      cv.Canny(blurred, edges, 50, 150);

      // Line detection using HoughLinesP
      const lines = new cv.Mat();
      cv.HoughLinesP(
        edges, 
        lines, 
        1, 
        Math.PI / 180, 
        settings.lineThreshold, 
        settings.minLineLength, 
        settings.lineGap
      );

      // Extract line data
      const extractedLines = [];
      for (let i = 0; i < lines.rows; i++) {
        const x1 = lines.data32S[i * 4];
        const y1 = lines.data32S[i * 4 + 1];
        const x2 = lines.data32S[i * 4 + 2];
        const y2 = lines.data32S[i * 4 + 3];

        // Normalize coordinates to -1 to 1
        const line = {
          x1: (x1 / 512) * 2 - 1,
          y1: 1 - (y1 / 512) * 2, // Flip Y coordinate
          x2: (x2 / 512) * 2 - 1,
          y2: 1 - (y2 / 512) * 2,
          length: Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)),
          angle: Math.atan2(y2-y1, x2-x1)
        };

        extractedLines.push(line);
      }

      // Draw lines on canvas for preview
      ctx.clearRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;

      for (let i = 0; i < lines.rows; i++) {
        const x1 = lines.data32S[i * 4];
        const y1 = lines.data32S[i * 4 + 1];
        const x2 = lines.data32S[i * 4 + 2];
        const y2 = lines.data32S[i * 4 + 3];

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Cleanup OpenCV matrices
      src.delete();
      gray.delete();
      blurred.delete();
      edges.delete();
      lines.delete();

      return extractedLines;
    } catch (error) {
      console.error('Error extracting lines:', error);
      dispatch({ type: 'UPDATE_STATUS', payload: `Error extracting lines from ${viewName}: ${error.message}` });
      return [];
    }
  }, [settings, dispatch]);

  const calculateLineSimilarity = useCallback((line1, line2, view1, view2) => {
    // Simple similarity based on relative position and length
    const centerX1 = (line1.x1 + line1.x2) / 2;
    const centerY1 = (line1.y1 + line1.y2) / 2;
    const centerX2 = (line2.x1 + line2.x2) / 2;
    const centerY2 = (line2.y1 + line2.y2) / 2;

    // Distance between centers (normalized)
    const centerDist = Math.sqrt((centerX1 - centerX2) * (centerX1 - centerX2) + 
                               (centerY1 - centerY2) * (centerY1 - centerY2));

    // Length similarity
    const lengthRatio = Math.min(line1.length, line2.length) / Math.max(line1.length, line2.length);

    // Combined similarity (inverted distance + length similarity)
    return lengthRatio * (1 - Math.min(centerDist, 1)) * 0.5;
  }, []);

  const matchLinesAcrossViews = useCallback((extractedLines) => {
    const views = Object.keys(extractedLines);
    if (views.length < 2) return [];

    const matchedLines = [];
    
    // Simple geometric matching approach
    views.forEach((view1, i) => {
      views.slice(i + 1).forEach(view2 => {
        const lines1 = extractedLines[view1];
        const lines2 = extractedLines[view2];

        lines1.forEach((line1, idx1) => {
          lines2.forEach((line2, idx2) => {
            const similarity = calculateLineSimilarity(line1, line2, view1, view2);

            if (similarity > settings.matchTolerance) {
              matchedLines.push({
                view1: view1,
                view2: view2,
                line1: line1,
                line2: line2,
                similarity: similarity,
                id: `${view1}_${idx1}_${view2}_${idx2}`
              });
            }
          });
        });
      });
    });

    // Remove duplicate matches (keep highest similarity)
    matchedLines.sort((a, b) => b.similarity - a.similarity);
    const uniqueMatches = [];
    const usedLines = new Set();

    matchedLines.forEach(match => {
      const key1 = `${match.view1}_${match.line1.x1}_${match.line1.y1}`;
      const key2 = `${match.view2}_${match.line2.x1}_${match.line2.y1}`;

      if (!usedLines.has(key1) && !usedLines.has(key2)) {
        uniqueMatches.push(match);
        usedLines.add(key1);
        usedLines.add(key2);
      }
    });

    return uniqueMatches;
  }, [settings.matchTolerance, calculateLineSimilarity]);

  const triangulateLineFrom2Views = useCallback((match) => {
    // Simplified triangulation - assumes orthogonal views for now
    const { view1, view2, line1, line2 } = match;

    let start3D, end3D;

    if ((view1 === 'front' && view2 === 'side') || (view1 === 'side' && view2 === 'front')) {
      // Front + Side views
      const frontLine = view1 === 'front' ? line1 : line2;
      const sideLine = view1 === 'side' ? line1 : line2;

      start3D = {
        x: frontLine.x1,           // X from front view
        y: (frontLine.y1 + sideLine.y1) / 2,  // Y average
        z: sideLine.x1             // Z from side view
      };

      end3D = {
        x: frontLine.x2,
        y: (frontLine.y2 + sideLine.y2) / 2,
        z: sideLine.x2
      };

    } else if ((view1 === 'front' && view2 === 'rear') || (view1 === 'rear' && view2 === 'front')) {
      // Front + Rear views - assume symmetric
      const frontLine = view1 === 'front' ? line1 : line2;

      start3D = {
        x: frontLine.x1,
        y: frontLine.y1,
        z: 0  // Assume center depth
      };

      end3D = {
        x: frontLine.x2,
        y: frontLine.y2,
        z: 0
      };

    } else {
      // Other combinations - use simplified approach
      start3D = { x: line1.x1, y: line1.y1, z: 0 };
      end3D = { x: line1.x2, y: line1.y2, z: 0 };
    }

    return { start: start3D, end: end3D };
  }, []);

  const triangulate3DLines = useCallback((matchedLines) => {
    const vertices3D = [];
    const edges3D = [];

    matchedLines.forEach((match, index) => {
      // Simple triangulation for line endpoints
      const line3D = triangulateLineFrom2Views(match);
      if (line3D) {
        const startIdx = vertices3D.length;
        vertices3D.push(line3D.start);
        vertices3D.push(line3D.end);
        edges3D.push([startIdx, startIdx + 1]);
      }
    });

    return { vertices3D, edges3D };
  }, [triangulateLineFrom2Views]);

  const processAllImages = useCallback(async () => {
    const cv = getCV();
    if (!cv) {
      dispatch({ type: 'UPDATE_STATUS', payload: 'OpenCV not ready yet...' });
      return;
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });

    try {
      const extractedLines = {};
      let totalLines = 0;

      for (const [viewName, imgData] of Object.entries(loadedImages)) {
        dispatch({ type: 'UPDATE_STATUS', payload: `Extracting lines from ${viewName} view...` });
        
        const canvas = document.createElement('canvas');
        const lines = extractLinesFromImage(imgData.img, viewName, canvas);
        extractedLines[viewName] = lines;
        
        // Update the image data with the processed canvas
        dispatch({
          type: 'SET_LOADED_IMAGE',
          payload: {
            viewName,
            imageData: { ...imgData, canvas }
          }
        });

        totalLines += lines.length;
      }

      dispatch({ type: 'SET_EXTRACTED_LINES', payload: extractedLines });
      dispatch({ type: 'UPDATE_STATS', payload: `Extracted ${totalLines} lines total` });

    } catch (error) {
      dispatch({ type: 'UPDATE_STATUS', payload: `Error processing images: ${error.message}` });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [loadedImages, extractLinesFromImage, dispatch]);

  const reconstruct3D = useCallback(async () => {
    console.log('Starting 3D reconstruction with extracted lines:', extractedLines);
    dispatch({ type: 'SET_PROCESSING', payload: true });

    try {
      dispatch({ type: 'UPDATE_STATUS', payload: 'Matching lines across views...' });
      const matchedLines = matchLinesAcrossViews(extractedLines);
      
      console.log('Matched lines:', matchedLines);
      dispatch({ type: 'SET_MATCHED_LINES', payload: matchedLines });

      if (matchedLines.length === 0) {
        throw new Error('No lines matched across views. Try adjusting the match tolerance or ensure you have compatible line patterns.');
      }

      dispatch({ type: 'UPDATE_STATUS', payload: 'Triangulating 3D positions...' });
      const { vertices3D, edges3D } = triangulate3DLines(matchedLines);

      console.log('Generated 3D data:', { vertices3D, edges3D });
      
      if (vertices3D.length === 0) {
        throw new Error('No 3D vertices generated. Check your images and processing parameters.');
      }

      dispatch({ type: 'SET_3D_DATA', payload: { vertices: vertices3D, edges: edges3D } });
      dispatch({ type: 'UPDATE_STATUS', payload: `3D wireframe created with ${vertices3D.length} vertices and ${edges3D.length} edges` });

    } catch (error) {
      console.error('Reconstruction error:', error);
      dispatch({ type: 'UPDATE_STATUS', payload: `Error reconstructing 3D: ${error.message}` });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [extractedLines, matchLinesAcrossViews, triangulate3DLines, dispatch]);

  return {
    processAllImages,
    reconstruct3D,
    extractLinesFromImage,
    matchLinesAcrossViews,
    triangulate3DLines
  };
}