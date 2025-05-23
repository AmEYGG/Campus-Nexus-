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
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Upload, Paperclip, CalendarIcon, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { getDatabase, ref, push, set } from 'firebase/database';
import { firebaseAuthService } from '../../../services/firebaseAuth.service';

// Define validation schema for candidate application form
const candidateFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  position: z.string().min(1, 'Please select a position'),
  manifesto: z.string().min(50, 'Manifesto must be at least 50 characters'),
  applicationDate: z.string().min(1, 'Please select a date').refine(date => !isNaN(new Date(date).getTime()), 'Please enter a valid date'),
  // documents: z.array(z.instanceof(File)).optional(),
});

const CandidateApplicationForm = ({ onClose, electionPositions = [] }) => {
  const form = useForm({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      name: '',
      position: '',
      manifesto: '',
      applicationDate: '',
      // documents: [],
    },
  });

  // Define college-level election positions
  const collegePositions = electionPositions.length > 0 ? electionPositions : [
    { value: 'President', label: 'President' },
    { value: 'Vice President', label: 'Vice President' },
    { value: 'Secretary', label: 'Secretary' },
    { value: 'Treasurer', label: 'Treasurer' },
    { value: 'Student Representative', label: 'Student Representative' },
    { value: 'Other', label: 'Other (Please specify)' },
  ];

  const onSubmit = async (data) => {
    const currentUser = await firebaseAuthService.getCurrentUser();
    if (!currentUser || !currentUser.authUser) {
      toast.error('You must be logged in to apply.');
      return;
    }

    const studentId = currentUser.authUser.uid;
    const database = getDatabase();
    const candidatesRef = ref(database, 'election_candidates');

    try {
      // Use push to generate a unique ID for the new candidate
      const newCandidateRef = push(candidatesRef);
      const candidateId = newCandidateRef.key;

      const applicationData = {
        id: candidateId, // Store the generated ID
        studentId: studentId, // Link to the student user
        name: data.name,
        position: data.position,
        manifesto: data.manifesto,
        applicationDate: new Date(data.applicationDate).toISOString(), // Store as ISO string
        status: 'pending', // Initial status
        createdAt: new Date().toISOString(),
      };

      await set(newCandidateRef, applicationData);

      toast.success('Candidate application submitted successfully!');
      form.reset(); // Reset form fields
      onClose(); // Close modal on success

    } catch (error) {
      toast.error('Failed to submit candidate application. Please try again.');
      console.error('Error submitting candidate application:', error);
    }
  };

  return (
    <div className="relative p-6">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Apply to be a Candidate</h2>
          <p className="text-sm text-gray-500">Fill in the form below to submit your candidacy.</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Position Dropdown */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position Applying For</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {collegePositions.map((pos) => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Input */}
           <FormField
            control={form.control}
            name="applicationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Application</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="manifesto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manifesto</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share your vision and plans..."
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Outline your goals and what you hope to achieve if elected.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File Upload Field (Optional) */}
          {/*
          <FormField
            control={form.control}
            name="documents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supporting Documents (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                </FormControl>
                <FormDescription>
                  Upload your resume, cover letter, or any other relevant documents.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          */}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={form.formState.isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CandidateApplicationForm; 