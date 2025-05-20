import React from 'react';

const Table = ({ className, ...props }) => {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={`w-full caption-bottom text-sm ${className || ''}`}
        {...props}
      />
    </div>
  );
};

const TableHeader = ({ className, ...props }) => {
  return <thead className={`${className || ''}`} {...props} />;
};

const TableBody = ({ className, ...props }) => {
  return <tbody className={`${className || ''}`} {...props} />;
};

const TableRow = ({ className, ...props }) => {
  return (
    <tr
      className={`border-b transition-colors hover:bg-gray-50 ${className || ''}`}
      {...props}
    />
  );
};

const TableHead = ({ className, ...props }) => {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-medium text-gray-500 ${className || ''}`}
      {...props}
    />
  );
};

const TableCell = ({ className, ...props }) => {
  return (
    <td
      className={`p-4 align-middle ${className || ''}`}
      {...props}
    />
  );
};

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }; 