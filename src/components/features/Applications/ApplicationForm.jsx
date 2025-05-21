import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '../../ui/form';
import { Input } from '../../ui/input';
import { Select } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { useForm } from 'react-hook-form';
import { Calendar, FileText, Users, X, Upload, Paperclip, AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define validation schema
const formSchema = z.object({
  type: z.string().min(1, 'Please select an application type'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    required_error: 'Please select a priority level',
  }),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  documents: z.array(z.any()).optional(),
  additionalInfo: z.string().optional(),
});

const ApplicationForm = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: '',
      subject: '',
      priority: 'medium',
      description: '',
      startDate: '',
      endDate: '',
      documents: [],
      additionalInfo: '',
    },
  });

  const applicationTypes = [
    {
      id: 'leave',
      title: 'Leave Request',
      icon: Calendar,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      id: 'course-change',
      title: 'Course Change',
      icon: FileText,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      id: 'scholarship',
      title: 'Scholarship',
      icon: Users,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      id: 'event-permission',
      title: 'Event Permission',
      icon: Users,
      color: 'bg-teal-50 text-teal-600',
    },
  ];

  const priorityLevels = [
    {
      value: 'low',
      label: 'Low Priority',
      description: 'Non-urgent requests that can be processed within 2 weeks',
      icon: Clock,
      color: 'bg-green-100 text-green-600',
      borderColor: 'border-green-200',
    },
    {
      value: 'medium',
      label: 'Medium Priority',
      description: 'Standard requests that should be processed within 1 week',
      icon: AlertCircle,
      color: 'bg-blue-100 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      value: 'high',
      label: 'High Priority',
      description: 'Urgent requests that need attention within 3-4 days',
      icon: AlertTriangle,
      color: 'bg-orange-100 text-orange-600',
      borderColor: 'border-orange-200',
    },
    {
      value: 'urgent',
      label: 'Urgent Priority',
      description: 'Critical requests that require immediate attention (within 24-48 hours)',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
      borderColor: 'border-red-200',
    },
  ];

  const steps = [
    { id: 1, name: 'Basic Info' },
    { id: 2, name: 'Details' },
    { id: 3, name: 'Documents' },
  ];

  const onSubmit = async (data) => {
    if (step < steps.length) {
      // Validate current step before proceeding
      const currentStepFields = step === 1 
        ? ['type', 'subject', 'priority']
        : step === 2 
        ? ['description', 'startDate', 'endDate']
        : ['documents'];

      const isValid = await form.trigger(currentStepFields);
      if (!isValid) {
        toast.error('Please fill in all required fields correctly');
        return;
      }
      setStep(step + 1);
    } else {
      try {
        // TODO: Replace with actual API call
        console.log('Form submitted:', data);
        toast.success('Application submitted successfully!');
        onClose();
      } catch (error) {
        toast.error('Failed to submit application. Please try again.');
        console.error('Error submitting application:', error);
      }
    }
  };

  return (
    <div className="relative">
      {/* Modal Header */}
      <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">New Application</h2>
          <p className="text-sm text-gray-500">Please fill in the required information</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`flex items-center ${
                step === s.id ? 'text-teal-600' : 'text-gray-500'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                  step >= s.id ? 'bg-teal-100 text-teal-600' : 'bg-gray-100'
                }`}
              >
                {s.id}
              </div>
              <span className="text-sm font-medium">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <>
                <div>
                  <h3 className="text-lg font-medium mb-4">Application Type</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {applicationTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            form.watch('type') === type.id
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-teal-200'
                          }`}
                          onClick={() => form.setValue('type', type.id)}
                        >
                          <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center mb-3`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <h4 className="font-medium">{type.title}</h4>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief subject of your application" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel>Priority Level</FormLabel>
                  <div className="grid grid-cols-1 gap-4">
                    {priorityLevels.map((priority) => {
                      const Icon = priority.icon;
                      return (
                        <div
                          key={priority.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            form.watch('priority') === priority.value
                              ? `${priority.borderColor} bg-opacity-10`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => form.setValue('priority', priority.value)}
                        >
                          <div className="flex items-start">
                            <div className={`p-2 rounded-lg ${priority.color} mr-3`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">{priority.label}</h4>
                                {form.watch('priority') === priority.value && (
                                  <div className="h-2 w-2 rounded-full bg-green-500" />
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">{priority.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                  <FormDescription>
                    Select the priority level based on the urgency of your request. Higher priority requests will be processed faster but should only be used for truly urgent matters.
                  </FormDescription>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide detailed information about your application..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any other relevant details..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="flex flex-col items-center text-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Upload Documents
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

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Required Documents
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-teal-500" />
                      Application Form (auto-generated)
                    </li>
                    <li className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-teal-500" />
                      Supporting Documents
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Previous
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit"
                className={form.watch('priority') === 'urgent' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {step === steps.length ? 'Submit Application' : 'Next'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ApplicationForm; 