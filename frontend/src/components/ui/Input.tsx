import React from 'react';
import type { InputProps } from '../../types';

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  required = false,
  className = '',
  disabled = false,
  size = 'md',
  success = false,
  warning = false,
  onFocus,
  onBlur,
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const inputClasses = `
    w-full border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${sizeClasses[size]}
    ${error 
      ? 'border-error-500 focus:ring-error-500 focus:border-error-500' 
      : success
      ? 'border-success-500 focus:ring-success-500 focus:border-success-500'
      : warning
      ? 'border-warning-500 focus:ring-warning-500 focus:border-warning-500'
      : 'border-secondary-300 hover:border-secondary-400 focus:ring-primary-500 focus:border-primary-500'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={inputClasses}
        required={required}
        disabled={disabled}
      />
      {error && (
        <p className="text-sm text-error-600 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
