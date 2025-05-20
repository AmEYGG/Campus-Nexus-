import React, { useState } from 'react';
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
import { Select } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { Calendar, FileText, Users, X, Upload, Paperclip } from 'lucide-react';
import { Badge } from '../../ui/badge';

const ComplaintForm = ({ onClose, onSubmit }) => {
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
  });

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      // Submit the form data to the parent component
      onSubmit(formData);
      
      // Reset form data
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
      });
      
      // Reset steps
      setStep(1);
      
      // Close the dialog
      onClose();
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
                  onChange={handleChange}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
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
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
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
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button 
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
            >
              {step === steps.length ? 'Submit Complaint' : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default ComplaintForm;