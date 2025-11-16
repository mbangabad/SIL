/**
 * Slider Component
 *
 * Interactive slider for gradient positioning games like VECTOR
 * Allows precise positioning along a semantic gradient
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';

export interface SliderProps {
  /** Current value (0-1) */
  value: number;
  /** Called when value changes */
  onChange: (value: number) => void;
  /** Left label */
  leftLabel?: string;
  /** Right label */
  rightLabel?: string;
  /** Whether slider is disabled */
  disabled?: boolean;
  /** Show position percentage */
  showPercentage?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Slider component for gradient positioning
 *
 * @example
 * ```tsx
 * <Slider
 *   value={0.5}
 *   onChange={setPosition}
 *   leftLabel="calm"
 *   rightLabel="intense"
 *   showPercentage
 * />
 * ```
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  leftLabel,
  rightLabel,
  disabled = false,
  showPercentage = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculate position from mouse/touch event
  const calculatePosition = useCallback((clientX: number): number => {
    if (!sliderRef.current) return value;

    const rect = sliderRef.current.getBoundingClientRect();
    const position = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, position));
  }, [value]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    const newValue = calculatePosition(e.clientX);
    onChange(newValue);
  }, [disabled, calculatePosition, onChange]);

  // Handle mouse move
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newValue = calculatePosition(e.clientX);
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, calculatePosition, onChange]);

  // Handle touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    const touch = e.touches[0];
    const newValue = calculatePosition(touch.clientX);
    onChange(newValue);
  }, [disabled, calculatePosition, onChange]);

  useEffect(() => {
    if (!isDragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const newValue = calculatePosition(touch.clientX);
      onChange(newValue);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, calculatePosition, onChange]);

  const percentage = Math.round(value * 100);

  return (
    <div className={`slider-container ${className}`} style={{
      width: '100%',
      padding: '1rem 0',
    }}>
      {/* Labels */}
      {(leftLabel || rightLabel) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          color: '#64748b',
        }}>
          {leftLabel && (
            <span style={{ fontWeight: 500 }}>{leftLabel}</span>
          )}
          {rightLabel && (
            <span style={{ fontWeight: 500 }}>{rightLabel}</span>
          )}
        </div>
      )}

      {/* Slider track */}
      <div
        ref={sliderRef}
        style={{
          position: 'relative',
          height: '8px',
          background: disabled ? '#e2e8f0' : isDragging ? '#cbd5e1' : '#e2e8f0',
          borderRadius: '4px',
          cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Fill */}
        <div
          style={{
            position: 'absolute',
            height: '100%',
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            borderRadius: '4px',
            transition: 'width 0.1s',
            pointerEvents: 'none',
          }}
        />

        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${percentage}%`,
            transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.2)' : 'scale(1)'}`,
            width: '24px',
            height: '24px',
            background: 'white',
            border: '3px solid #3b82f6',
            borderRadius: '50%',
            boxShadow: isDragging ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s',
            pointerEvents: 'none',
          }}
        >
          {showPercentage && (
            <div style={{
              position: 'absolute',
              top: '-32px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '4px 8px',
              background: '#1e293b',
              color: 'white',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}>
              {percentage}%
              <div style={{
                content: '',
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                border: '4px solid transparent',
                borderTopColor: '#1e293b',
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
