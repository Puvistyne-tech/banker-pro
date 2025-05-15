// src/components/PdfPageRenderer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect as KonvaRect } from 'react-konva';
import Konva from 'konva';
import { pdfjsLib } from '../features/pdf/pdfUtils';
import { Amount, AmountType } from '../types';

interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isAmount: boolean;
  parsedAmount?: number;
  originalCoords: { x: number; y: number; width: number; height: number };
  selectedType?: AmountType; // Track which type this item was selected as
}

interface PdfPageRendererProps {
  page: pdfjsLib.PDFPageProxy | null;
  pageNumber: number;
  scale: number;
  onAnnotationDraw: (rect: Konva.RectConfig, pageNumber: number, type: AmountType) => void;
  annotations: Amount[];
  showOverlays: boolean;
  legendColors: {
    startingBalance: string;
    credit: string;
    debit: string;
    finalBalance: string;
    eraser: string;
  };
  selectedType: AmountType;
  clearSelectedItems?: boolean;
}

const PdfPageRenderer: React.FC<PdfPageRendererProps> = ({
  page,
  pageNumber,
  scale,
  onAnnotationDraw,
  annotations,
  showOverlays,
  legendColors,
  selectedType,
  clearSelectedItems = false,
}) => {
  const [imageData, setImageData] = useState<HTMLImageElement | null>(null);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<TextItem[]>([]);

  const stageRef = useRef<Konva.Stage>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Clear selected items when clearSelectedItems prop changes to true
  useEffect(() => {
    if (clearSelectedItems) {
      setSelectedItems([]);
    }
  }, [clearSelectedItems]);

  useEffect(() => {
    if (!page) {
      setImageData(null);
      setPageDimensions(null);
      setTextItems([]);
      return;
    }

    const renderPage = async () => {
      console.log('Rendering page with scale:', scale);
      const viewport = page.getViewport({ scale });
      setPageDimensions({ width: viewport.width, height: viewport.height });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');

      if (!context) return;

      await page.render({ canvasContext: context, viewport }).promise;
      const img = new Image();
      img.src = canvas.toDataURL();
      img.onload = () => {
        setImageData(img);
      };
    };

    renderPage();
  }, [page, scale]);

  // Process text items when page loads
  useEffect(() => {
    if (!page) {
      setImageData(null);
      setPageDimensions(null);
      setTextItems([]);
      return;
    }

    const processTextItems = async () => {
      try {
        console.log('Starting text processing...');
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1.0 });
        
        console.log('Got text content, items:', textContent.items.length);
        console.log('Viewport dimensions:', {
          width: viewport.width,
          height: viewport.height,
          scale: viewport.scale
        });
        
        const items = textContent.items
          .filter((item: any) => item.str.trim() !== '')
          .map((item: any) => {
            const text = item.str.trim();
            const transform = item.transform;
            const [a, b, ,, e, f] = transform;
            
            const x = e;
            const y = f;
            const fontSize = Math.sqrt(a * a + b * b);
            const estimatedWidth = text.length * fontSize * 0.6;
            const estimatedHeight = fontSize * 1.2;
            
            const adjustedX = x - (estimatedWidth * 0.1);
            const adjustedY = viewport.height - y - estimatedHeight + (estimatedHeight * 0.2);
            
            const frenchAmountRegex = /^[+-]?\s*\d{1,3}(?:[ .]\d{3})*(?:,\d{2})\s*€?$/;
            const isAmount = frenchAmountRegex.test(text);
            let parsedAmount: number | undefined;
            
            if (isAmount) {
              try {
                const normalizedText = text
                  .replace(/\s+/g, '')
                  .replace(/\./g, '')  // Remove dots (thousand separators)
                  .replace(',', '.')   // Replace comma with dot for decimal
                  .replace('€', '')
                  .trim();
                
                parsedAmount = parseFloat(normalizedText);
              } catch (e) {
                console.warn('Failed to parse amount:', text, e);
              }
            }

            // Create a unique identifier based on position and text
            const id = `${text}_${adjustedX.toFixed(2)}_${adjustedY.toFixed(2)}_${pageNumber}`;

            // Adjust width to better handle numbers with dots
            const adjustedWidth = text.includes('.') ? estimatedWidth * 1.2 : estimatedWidth;

            return {
              id,
              text,
              x: adjustedX,
              y: adjustedY,
              width: Math.max(adjustedWidth, fontSize),
              height: Math.max(estimatedHeight, fontSize),
              isAmount,
              parsedAmount,
              originalCoords: { x, y, width: estimatedWidth, height: estimatedHeight },
              selectedType
            };
          });

        console.log('Processed text items:', items);
        console.log('Amount items:', items.filter(item => item.isAmount));
        setTextItems(items);
      } catch (error) {
        console.error('Error processing text items:', error);
      }
    };

    processTextItems();
  }, [page]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    console.log('MouseDown event:', {
      target: e.target,
      targetClassName: e.target.getClassName(),
      isStage: e.target === stageRef.current,
      stage: stageRef.current
    });

    // Only start drawing if we're clicking on the stage or the image
    const target = e.target;
    if (target !== stageRef.current && target.getClassName() !== 'Image') {
      return;
    }
    
    setIsDrawing(true);
    const stage = e.target.getStage();
    if (!stage) {
      return;
    }
    const pos = stage.getPointerPosition();
    if (!pos) {
      console.log('No pointer position available');
      return;
    }
    setStartPoint(pos);
    setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !startPoint) {
      return;
    }
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Calculate dimensions relative to start point
    const width = pos.x - startPoint.x;
    const height = pos.y - startPoint.y;

    // Update selection rectangle
    setSelectionRect({
      x: width < 0 ? pos.x : startPoint.x,
      y: height < 0 ? pos.y : startPoint.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleMouseUp = async () => {
    if (!isDrawing || !startPoint || !selectionRect) return;
    setIsDrawing(false);

    const { width, height } = selectionRect;
    console.log('Final rectangle dimensions:', selectionRect);

    if (width > 5 && height > 5) {
      const unscaledRect = {
        x: selectionRect.x / scale,
        y: selectionRect.y / scale,
        width: width / scale,
        height: height / scale,
      };

      console.log('Unscaled rectangle:', unscaledRect);
      console.log('Available text items:', textItems.length);
      
      const intersectingItems = textItems.filter(item => {
        const itemRect = {
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height
        };

        const isFullyContained = 
          itemRect.x >= unscaledRect.x &&
          itemRect.y >= unscaledRect.y &&
          (itemRect.x + itemRect.width) <= (unscaledRect.x + unscaledRect.width) &&
          (itemRect.y + itemRect.height) <= (unscaledRect.y + unscaledRect.height);

        return isFullyContained;
      });

      const validItems = intersectingItems.filter(item => 
        item.text.trim() !== '' && 
        item.isAmount && 
        item.parsedAmount !== undefined
      );

      console.log('Selected items:', validItems);
      
      if (selectedType === 'eraser') {
        // In eraser mode, remove selected items
        const itemsToRemove = validItems.filter(item => 
          selectedItems.some(selected => selected.id === item.id)
        );
        
        if (itemsToRemove.length > 0) {
          setSelectedItems(prevItems => 
            prevItems.filter(item => !itemsToRemove.some(toRemove => toRemove.id === item.id))
          );
          
          // Remove annotations for erased items
          itemsToRemove.forEach(item => {
            const itemRect = {
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height
            };
            onAnnotationDraw({ ...itemRect, text: item.text }, pageNumber, 'eraser');
          });
        }
      } else {
        // Normal selection mode - only add items that aren't already selected
        const newItems = validItems.filter(item => 
          !selectedItems.some(selected => selected.id === item.id)
        );
        
        if (newItems.length > 0) {
          // Add selected type to new items
          const itemsWithType = newItems.map(item => ({
            ...item,
            selectedType
          }));
          
          // Update selected items state with new items
          setSelectedItems(prevItems => [...prevItems, ...itemsWithType]);
          
          // Create annotations for new items
          itemsWithType.forEach(item => {
            const itemRect = {
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height
            };
            onAnnotationDraw({ ...itemRect, text: item.text }, pageNumber, selectedType);
          });
        }
      }
    } else {
      console.log('Selection too small, ignoring');
    }

    setSelectionRect(null);
    setStartPoint(null);
  };

  const getAnnotationColor = (type: AmountType) => {
    return legendColors[type];
  };

  const getColorWithOpacity = (color: string, opacity: number) => {
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  if (!pageDimensions || !imageData) {
    return <div className="flex justify-center items-center h-full">Loading page...</div>;
  }

  return (
    <Stage
      ref={stageRef}
      width={pageDimensions.width}
      height={pageDimensions.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="border border-gray-400 shadow-lg"
    >
      <Layer>
        <KonvaImage image={imageData} x={0} y={0} />
        {showOverlays && annotations
          .filter(ann => ann.pageNumber === pageNumber)
          .map(ann => (
            <React.Fragment key={ann.id}>
              {/* <KonvaRect
                x={ann.rect.x * scale}
                y={ann.rect.y * scale}
                width={ann.rect.width * scale}
                height={ann.rect.height * scale}
                stroke={getAnnotationColor(ann.type)}
                strokeWidth={2}
                opacity={0.5}
                fill={getColorWithOpacity(getAnnotationColor(ann.type), 0.2)}
              />
              <KonvaText
                x={ann.rect.x * scale}
                y={ann.rect.y * scale - 16 < 0 ? ann.rect.y * scale + ann.rect.height * scale : ann.rect.y * scale - 16}
                text={`${ann.type}: ${ann.rawValue || ann.value}`}
                fontSize={12}
                fill={getAnnotationColor(ann.type)}
                fontStyle="bold"
              /> */}
            </React.Fragment>
          ))}
        {selectionRect && (
          <KonvaRect
            x={selectionRect.x}
            y={selectionRect.y}
            width={selectionRect.width}
            height={selectionRect.height}
            stroke={getAnnotationColor(selectedType)}
            strokeWidth={2}
            dash={[4, 2]}
            fill={getColorWithOpacity(getAnnotationColor(selectedType), 0.2)}
          />
        )}
        {selectedItems.map((item, index) => (
          <KonvaRect
            key={index}
            x={item.x * scale}
            y={item.y * scale}
            width={item.width * scale}
            height={item.height * scale}
            stroke={getAnnotationColor(item.selectedType || selectedType)}
            strokeWidth={2}
            opacity={0.5}
            fill={getColorWithOpacity(getAnnotationColor(item.selectedType || selectedType), 0.3)}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default PdfPageRenderer;
