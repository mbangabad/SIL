/**
 * InputBox Component
 *
 * Text input for word submission
 * Used in games like ZERO and FLOW
 */

import React from 'react';
import { tokens } from '../tokens';

export interface InputBoxProps {
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Submit handler (Enter key) */
  onSubmit?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Is input disabled */
  disabled?: boolean;
  /** Maximum length */
  maxLength?: number;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Validation state */
  state?: 'default' | 'success' | 'error';
  /** Helper text */
  helperText?: string;
  /** Custom CSS class */
  className?: string;
}

const sizeStyles = {
  sm: {
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    fontSize: tokens.fontSizes.sm,
    height: '40px',
  },
  md: {
    padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
    fontSize: tokens.fontSizes.md,
    height: '56px',
  },
  lg: {
    padding: `${tokens.spacing.lg} ${tokens.spacing.xl}`,
    fontSize: tokens.fontSizes.lg,
    height: '72px',
  },
};

const stateStyles = {
  default: {
    border: `2px solid ${tokens.colors.card}`,
    backgroundColor: tokens.colors.card,
  },
  success: {
    border: `2px solid ${tokens.colors.success}`,
    backgroundColor: tokens.colors.card,
  },
  error: {
    border: `2px solid ${tokens.colors.error}`,
    backgroundColor: tokens.colors.card,
  },
};

export const InputBox: React.FC<InputBoxProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type a word...',
  disabled = false,
  maxLength,
  autoFocus = false,
  size = 'md',
  state = 'default',
  helperText,
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit && !disabled) {
      onSubmit();
    }
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    marginBottom: tokens.spacing.md,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    ...sizeStyles[size],
    ...stateStyles[state],
    borderRadius: tokens.radius.lg,
    color: tokens.colors.text,
    fontFamily: tokens.fonts.body,
    fontWeight: tokens.fontWeights.medium,
    outline: 'none',
    transition: tokens.transitions.fast,
    ...
(disabled && {
      opacity: 0.5,
      cursor: 'not-allowed',
    }),
  };

  const helperStyle: React.CSSProperties = {
    marginTop: tokens.spacing.xs,
    fontSize: tokens.fontSizes.xs,
    color:
      state === 'error'
        ? tokens.colors.error
        : state === 'success'
        ? tokens.colors.success
        : tokens.colors.textSecondary,
  };

  const charCountStyle: React.CSSProperties = {
    textAlign: 'right',
    fontSize: tokens.fontSizes.xs,
    color: tokens.colors.textSecondary,
    marginTop: tokens.spacing.xs,
  };

  return (
    <div style={containerStyle} className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        autoFocus={autoFocus}
        style={inputStyle}
        aria-invalid={state === 'error'}
      />
      {helperText && <div style={helperStyle}>{helperText}</div>}
      {maxLength && (
        <div style={charCountStyle}>
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};
