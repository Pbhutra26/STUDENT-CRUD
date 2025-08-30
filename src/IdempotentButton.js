import React from 'react';

/**
 * IdempotentButton - disables itself when loading or submitting
 * Props:
 *  - isLoading: boolean (optional)
 *  - isSubmitting: boolean (optional)
 *  - disabled: boolean (optional, overrides all)
 *  - children, onClick, type, className, ...rest
 */
const IdempotentButton = ({
  isLoading = false,
  isSubmitting = false,
  disabled = false,
  children,
  className = '',
  ...rest
}) => {
  const isDisabled = disabled || isLoading || isSubmitting;
  return (
    <button
      disabled={isDisabled}
      className={
        className +
        (isDisabled ? ' opacity-60 cursor-not-allowed' : '')
      }
      {...rest}
    >
      {isLoading || isSubmitting ? (
        <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full"></span>
      ) : null}
      {children}
    </button>
  );
};

export default IdempotentButton;
