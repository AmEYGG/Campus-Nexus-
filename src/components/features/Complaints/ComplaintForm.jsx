import React, { useState, useRef } from 'react';
import { ref, push, serverTimestamp, update, set, get } from 'firebase/database';
import { database, auth } from '../../../config/firebase';
import { cloudinaryConfig } from '../../../config/cloudinary';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input } from '../../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { Calendar, FileText, Users, X, Upload, Paperclip } from 'lucide-react';
import { Badge } from '../../ui/badge';

const ComplaintForm = ({ onClose, onSubmit }) => {
  const [user] = useAuthState(auth);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'medium',
    anonymous: false,
    files: [],
    location: '',
    date: '',
    witnesses: '',
    resolution: '',
    courseCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const steps = [
    { id: 1, name: 'Basic Details' },
    { id: 2, name: 'Incident Info' },
    { id: 3, name: 'Resolution' },
  ];

  const categories = [
    { id: 'academic', name: 'Academic', icon: FileText },
    { id: 'facility', name: 'Facility', icon: Calendar },
    { id: 'staff', name: 'Staff Related', icon: Users },
    { id: 'other', name: 'Other', icon: FileText },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleCategoryChange = (categoryId) => {
    setFormData({
      ...formData,
      category: categoryId,
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    // Validate files
    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 5MB`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not supported. Please upload images or PDFs`);
        return;
      }
    }

    setUploadedFiles(files);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', cloudinaryConfig.folder);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return {
        name: file.name,
        url: data.secure_url,
        public_id: data.public_id,
        type: file.type
      };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const uploadFiles = async () => {
    try {
      const uploadPromises = uploadedFiles.map(file => uploadToCloudinary(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (step < steps.length) {
      setStep(step + 1);
      return;
    }

    if (!user) {
      toast.error('You must be logged in to submit a complaint');
      return;
    }

    if (!formData.subject || !formData.category || !formData.priority || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files to Cloudinary first if any
      const uploadedFileUrls = uploadedFiles.length > 0 ? await uploadFiles() : [];

      // Generate a unique complaint ID
      const complaintId = `CMP${Date.now()}${Math.random().toString(36).substr(2, 4)}`.toUpperCase();

      // Create the base complaint data
      const complaintData = {
        id: complaintId,
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: 'pending',
        submittedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        files: uploadedFileUrls,
        location: formData.location || null,
        date: formData.date || null,
        witnesses: formData.witnesses || null,
        courseCode: formData.category === 'academic' ? formData.courseCode : null,
        department: user.userProfile?.department || 'Not Specified',
        semester: user.userProfile?.semester || 'Not Specified',
        impact: formData.impact || 'Not Specified',
        suggestedResolution: formData.resolution || null,
        anonymousId: `ANON${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        studentId: user.uid,
        studentName: formData.anonymous ? 'Anonymous' : user.displayName || 'Anonymous',
        studentEmail: formData.anonymous ? null : user.email,
        // Include notification data in the complaint itself
        notifications: {
          student: {
            type: 'complaint_submitted',
            message: `Your complaint has been submitted successfully and is pending review.`,
            createdAt: serverTimestamp(),
            read: false
          },
          faculty: {
            type: 'new_complaint',
            message: `New complaint submitted for review`,
            createdAt: serverTimestamp(),
            read: false
          }
        }
      };

      // Create the complaint in the complaintRequests collection
      const complaintsRef = ref(database, `complaintRequests/${complaintId}`);
      await set(complaintsRef, complaintData);

      // Create a reference in the user's complaints collection
      const userComplaintRef = ref(database, `users/${user.uid}/complaints/${complaintId}`);
      await set(userComplaintRef, {
        id: complaintId,
        status: 'pending',
        submittedAt: serverTimestamp(),
        category: formData.category,
        subject: formData.subject,
        anonymousId: complaintData.anonymousId
      });

      // Try to create user notification, but don't fail if it doesn't work
      try {
        const userNotificationRef = ref(database, `users/${user.uid}/notifications/${complaintId}`);
        await set(userNotificationRef, {
          type: 'complaint_submitted',
          complaintId: complaintId,
          status: 'pending',
          message: `Your complaint (ID: ${complaintData.anonymousId}) has been submitted successfully and is pending review.`,
          createdAt: serverTimestamp(),
          read: false
        });
      } catch (notificationError) {
        console.warn('Failed to create user notification:', notificationError);
        // Continue with submission process
      }

      toast.success('Complaint submitted successfully!');
      
      if (onSubmit) {
        onSubmit(complaintData);
      }

      // Reset form
      setFormData({
        subject: '',
        description: '',
        category: '',
        priority: 'medium',
        anonymous: false,
        files: [],
        location: '',
        date: '',
        witnesses: '',
        resolution: '',
        courseCode: ''
      });
      setUploadedFiles([]);
      setStep(1);
      onClose();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      // Check if the complaint was actually saved despite the notification error
      try {
        const complaintRef = ref(database, `complaintRequests/${complaintId}`);
        const snapshot = await get(complaintRef);
        if (snapshot.exists()) {
          // Complaint was saved successfully despite notification error
          toast.success('Complaint submitted successfully!');
          if (onSubmit) {
            onSubmit(complaintData);
          }
          setFormData({
            subject: '',
            description: '',
            category: '',
            priority: 'medium',
            anonymous: false,
            files: [],
            location: '',
            date: '',
            witnesses: '',
            resolution: '',
            courseCode: ''
          });
          setUploadedFiles([]);
          setStep(1);
          onClose();
          return;
        }
      } catch (checkError) {
        console.error('Error checking complaint status:', checkError);
      }

      // Only show error if the complaint wasn't actually saved
      if (error.code === 'PERMISSION_DENIED') {
        toast.error('Permission denied. Please make sure you are properly logged in.');
      } else {
        toast.error('Failed to submit complaint. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    // Reset form data and steps when closing
    setFormData({
      subject: '',
      description: '',
      category: '',
      priority: 'medium',
      anonymous: false,
      files: [],
      location: '',
      date: '',
      witnesses: '',
      resolution: '',
      courseCode: ''
    });
    setStep(1);
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader className="bg-orange-500 text-white p-6 -mt-6 -mx-6 mb-6 flex items-start justify-between">
        <div>
          <DialogTitle className="text-2xl font-semibold mb-2">New Complaint</DialogTitle>
          <p className="text-orange-50">Please provide details about your complaint</p>
        </div>
        <button onClick={handleClose} className="text-orange-50 hover:text-white">
          <X className="h-6 w-6" />
        </button>
      </DialogHeader>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((s) => (
          <div
            key={s.id}
            className={`flex items-center ${
              step === s.id ? 'text-orange-600' : 'text-gray-500'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                step >= s.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100'
              }`}
            >
              {s.id}
            </div>
            <span className="text-sm font-medium">{s.name}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {step === 1 && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <Input 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief subject of your complaint" 
                  required
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Category</h3>
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div
                        key={category.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.category === category.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-200'
                        }`}
                        onClick={() => handleCategoryChange(category.id)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h4 className="font-medium">{category.name}</h4>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                <Select
                  name="priority"
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Low Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Medium Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        High Priority
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  name="anonymous"
                  className="rounded border-gray-300"
                  checked={formData.anonymous}
                  onChange={handleChange}
                />
                <label htmlFor="anonymous" className="text-sm text-gray-600">
                  Submit anonymously
                </label>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                <Textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide detailed information about the incident..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <Input 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Where did this occur?" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Incident</label>
                <Input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Witnesses (if any)</label>
                <Input 
                  name="witnesses"
                  value={formData.witnesses}
                  onChange={handleChange}
                  placeholder="Names of witnesses, if applicable" 
                />
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desired Resolution</label>
                <Textarea 
                  name="resolution"
                  value={formData.resolution}
                  onChange={handleChange}
                  placeholder="What outcome are you seeking?"
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="flex flex-col items-center text-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Upload Evidence
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop your files here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/jpeg,image/png,application/pdf"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 w-full">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                setUploadedFiles(files => files.filter((_, i) => i !== index));
                              }}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  handleClose();
                }
              }}
              disabled={isSubmitting}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button 
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Submitting...' 
                : step === steps.length 
                  ? 'Submit Complaint' 
                  : 'Next'
              }
            </Button>
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default ComplaintForm;