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
import { useForm } from 'react-hook-form';
import { Calendar, FileText, Users, X, Upload, Paperclip } from 'lucide-react';

const ApplicationForm = ({ isOpen, onClose, initialType = null }) => {
  const [step, setStep] = useState(1);
  const form = useForm({
    defaultValues: {
      type: initialType || '',
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

  const steps = [
    { id: 1, name: 'Basic Info' },
    { id: 2, name: 'Details' },
    { id: 3, name: 'Documents' },
  ];

  const onSubmit = (data) => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      console.log('Form submitted:', data);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="bg-teal-500 text-white p-6 -mt-6 -mx-6 mb-6 flex items-start justify-between">
          <div>
            <DialogTitle className="text-2xl font-semibold mb-2">New Application</DialogTitle>
            <p className="text-teal-50">Please fill in the required information</p>
          </div>
          <button onClick={onClose} className="text-teal-50 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
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

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

            <DialogFooter>
              <div className="flex justify-between w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (step > 1) {
                      setStep(step - 1);
                    } else {
                      onClose();
                    }
                  }}
                >
                  {step === 1 ? 'Cancel' : 'Back'}
                </Button>
                <Button 
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  {step === steps.length ? 'Submit Application' : 'Next'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationForm; 