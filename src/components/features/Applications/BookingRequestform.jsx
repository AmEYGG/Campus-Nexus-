import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, X, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { createBookingRequest } from '@/services/facilityBookingService';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'react-hot-toast';

const schema = z.object({
  requester: z.string().min(1, 'Requester name is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['High', 'Medium', 'Low']),
  equipment: z.array(z.string())
});

const BookingRequestForm = ({ facility, onClose, onSuccess }) => {
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      requester: user?.displayName || '',
      priority: 'High',
      equipment: []
    }
  });

  const equipmentOptions = ['Projector', 'Microphone', 'Laptop'];

  const onSubmit = async (data) => {
    if (!user) {
      toast.error('Please sign in to submit a booking request');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        ...data,
        userId: user.uid,
        userEmail: user.email,
        facilityId: facility.id,
        facilityName: facility.name,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      const { success, error } = await createBookingRequest(bookingData);

      if (success) {
        toast.success('Booking request submitted successfully');
        onSuccess();
      } else {
        throw new Error(error || 'Failed to submit booking request');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details for your facility booking request</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Facility Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Selected Facility</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-sm text-blue-700">
                <MapPin className="w-4 h-4 mr-2" />
                {facility.location}
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <Users className="w-4 h-4 mr-2" />
                Capacity: {facility.capacity}
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Requester</label>
              <input
                {...register('requester')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              {errors.requester && (
                <p className="mt-1 text-sm text-red-600">{errors.requester.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                {...register('date')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <input
                type="text"
                {...register('time')}
                placeholder="10:00 AM - 12:00 PM"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                {...register('priority')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <input
                type="text"
                {...register('purpose')}
                placeholder="Brief purpose of the booking"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              {errors.purpose && (
                <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Detailed description of the event or activity"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Equipment</label>
              <div className="flex flex-wrap gap-3">
                {equipmentOptions.map((equipment) => (
                  <label key={equipment} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('equipment')}
                      value={equipment}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">{equipment}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BookingRequestForm;
