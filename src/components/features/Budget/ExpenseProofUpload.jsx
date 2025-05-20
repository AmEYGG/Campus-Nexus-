import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  File,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ExpenseProofUpload = ({ onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'image/heic'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    if (!allowedFileTypes.includes(file.type)) {
      return 'Invalid file type. Please upload images (JPG, PNG, HEIC) or PDF files.';
    }
    if (file.size > maxFileSize) {
      return 'File size exceeds 10MB limit.';
    }
    return null;
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setError(null);

    const validFiles = selectedFiles.filter((file) => {
      const error = validateFile(file);
      if (error) {
        setError(error);
        return false;
      }
      return true;
    });

    setFiles([...files, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    const validFiles = droppedFiles.filter((file) => {
      const error = validateFile(file);
      if (error) {
        setError(error);
        return false;
      }
      return true;
    });

    setFiles([...files, ...validFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Here you would implement your actual file upload logic
      // For example, using FormData to send files to your backend
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Simulated upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onUploadComplete && onUploadComplete(files);
      setFiles([]);
      setError(null);
    } catch (err) {
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept={allowedFileTypes.join(',')}
          className="hidden"
        />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          Drag and drop your files here, or click to select files
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supported formats: JPG, PNG, HEIC, PDF (Max 10MB)
        </p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center bg-red-50 text-red-700 p-3 rounded-lg mt-4"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview */}
      <div className="mt-6 space-y-3">
        {files.map((file, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
          >
            <div className="flex items-center">
              {file.type.includes('image') ? (
                <ImageIcon className="w-5 h-5 text-gray-500 mr-3" />
              ) : (
                <File className="w-5 h-5 text-gray-500 mr-3" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => removeFile(index)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Upload Button */}
      {files.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleUpload}
          disabled={uploading}
          className={`mt-6 w-full flex items-center justify-center px-4 py-2 rounded-lg text-white ${
            uploading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Upload {files.length} {files.length === 1 ? 'file' : 'files'}
            </>
          )}
        </motion.button>
      )}
    </div>
  );
};

export default ExpenseProofUpload; 