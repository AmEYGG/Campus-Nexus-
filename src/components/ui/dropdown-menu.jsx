import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const DropdownContext = createContext({});

export function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild }) {
  const { isOpen, setIsOpen } = useContext(DropdownContext);
  const Component = asChild ? 'div' : 'button';
  
  return (
    <Component onClick={() => setIsOpen(!isOpen)}>
      {children}
    </Component>
  );
}

export function DropdownMenuContent({ children, align = 'bottom' }) {
  const { isOpen, setIsOpen } = useContext(DropdownContext);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={ref}
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md animate-in ${
        align === 'end' ? 'right-0' : ''
      }`}
      style={{
        transform: 'translateY(100%)',
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export function DropdownMenuItem({ children, className = '', ...props }) {
  const { setIsOpen } = useContext(DropdownContext);
  
  return (
    <button
      className={`relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 ${className}`}
      onClick={() => setIsOpen(false)}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ children, className = '' }) {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold ${className}`}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className = '' }) {
  return (
    <div className={`-mx-1 my-1 h-px bg-gray-200 ${className}`} />
  );
} 