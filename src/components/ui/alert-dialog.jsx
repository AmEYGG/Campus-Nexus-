import React, { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const AlertDialogContext = createContext({});

const AlertDialog = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

const AlertDialogTrigger = React.forwardRef(({ children, className, ...props }, ref) => {
  const { setOpen } = useContext(AlertDialogContext);

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

const AlertDialogContent = React.forwardRef(({ children, className, ...props }, ref) => {
  const { open, setOpen } = useContext(AlertDialogContext);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg md:w-full">
        <div
          ref={ref}
          className={`grid gap-4 ${className}`}
          role="alertdialog"
          aria-modal="true"
          {...props}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
});

const AlertDialogHeader = ({ className, ...props }) => (
  <div
    className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}
    {...props}
  />
);

const AlertDialogFooter = ({ className, ...props }) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}
    {...props}
  />
);

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-500 ${className}`}
    {...props}
  />
));

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    {...props}
  />
));

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => {
  const { setOpen } = useContext(AlertDialogContext);

  return (
    <button
      ref={ref}
      onClick={() => setOpen(false)}
      className={`inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    />
  );
});

AlertDialog.displayName = 'AlertDialog';
AlertDialogTrigger.displayName = 'AlertDialogTrigger';
AlertDialogContent.displayName = 'AlertDialogContent';
AlertDialogHeader.displayName = 'AlertDialogHeader';
AlertDialogFooter.displayName = 'AlertDialogFooter';
AlertDialogTitle.displayName = 'AlertDialogTitle';
AlertDialogDescription.displayName = 'AlertDialogDescription';
AlertDialogAction.displayName = 'AlertDialogAction';
AlertDialogCancel.displayName = 'AlertDialogCancel';

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}; 