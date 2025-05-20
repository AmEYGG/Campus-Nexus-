import React, { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const DialogContext = createContext({});

const Dialog = ({ children, open: controlledOpen, onOpenChange }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = React.forwardRef(({ children, className, ...props }, ref) => {
  const { setOpen } = useContext(DialogContext);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

const DialogContent = React.forwardRef(({ children, className, ...props }, ref) => {
  const { open, setOpen } = useContext(DialogContext);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg">
        <div
          ref={ref}
          className={className}
          {...props}
        >
          {children}
        </div>
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>,
    document.body
  );
});

const DialogHeader = ({ className, ...props }) => (
  <div
    className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
    {...props}
  />
);

const DialogFooter = ({ className, ...props }) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
    {...props}
  />
);

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-500 ${className}`}
    {...props}
  />
));

const DialogClose = React.forwardRef(({ className, ...props }, ref) => {
  const { setOpen } = useContext(DialogContext);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setOpen(false)}
      className={`absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none ${className}`}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
});

Dialog.displayName = 'Dialog';
DialogTrigger.displayName = 'DialogTrigger';
DialogContent.displayName = 'DialogContent';
DialogHeader.displayName = 'DialogHeader';
DialogFooter.displayName = 'DialogFooter';
DialogTitle.displayName = 'DialogTitle';
DialogDescription.displayName = 'DialogDescription';
DialogClose.displayName = 'DialogClose';

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
};