import React, { useRef, useState } from 'react';
import type { WordCoords } from '../data/documents';

interface Props {
    imageUrl: string;
    onCoordsSelected: (coords: WordCoords) => void;
    disabled?: boolean;
}

export const CoordinatePicker = ({ imageUrl, onCoordsSelected, disabled = false }: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
    const [currentBox, setCurrentBox] = useState<WordCoords | null>(null);

    const getPos = (e: React.MouseEvent) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (disabled || !containerRef.current) return;
        setStartPos(getPos(e));
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (disabled || !startPos) return;
        const currentPos = getPos(e);

        const width = Math.abs(currentPos.x - startPos.x);
        const height = Math.abs(currentPos.y - startPos.y);
        const x = Math.min(currentPos.x, startPos.x);
        const y = Math.min(currentPos.y, startPos.y);

        setCurrentBox({ x, y, width, height });
    };

    const handleMouseUp = () => {
        if (disabled || !startPos || !currentBox) {
            setStartPos(null);
            setCurrentBox(null);
            return;
        }

        // Only select if box has reasonable size (>1%)
        if (currentBox.width > 1 && currentBox.height > 1) {
            onCoordsSelected(currentBox);
        }

        setStartPos(null);
        setCurrentBox(null);
    };

    return (
        <div
            ref={containerRef}
            className={`relative inline-block w-full select-none ${disabled ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <img src={imageUrl} alt="Mapping" className={`w-full h-auto block pointer-events-none ${disabled ? 'opacity-50' : ''}`} />

            {currentBox && (
                <div
                    className="absolute border-2 border-amber-500 bg-amber-500/30"
                    style={{
                        left: `${currentBox.x}%`,
                        top: `${currentBox.y}%`,
                        width: `${currentBox.width}%`,
                        height: `${currentBox.height}%`
                    }}
                />
            )}
        </div>
    );
};
