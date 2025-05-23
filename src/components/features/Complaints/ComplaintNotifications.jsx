import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const ComplaintNotifications = ({ complaints }) => {
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'bg-green-50 border-green-100';
      case 'rejected':
        return 'bg-red-50 border-red-100';
      case 'pending':
      default:
        return 'bg-yellow-50 border-yellow-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Your Notifications
          {complaints.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {complaints.length}
            </span>
          )}
        </h2>
      </div>
      <div className="divide-y">
        {complaints.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No complaint notifications
          </div>
        ) : (
          complaints.map((complaint) => (
            <div
              key={complaint.id}
              className={`p-4 ${getStatusColor(complaint.status)} border-l-4 ${
                complaint.status.toLowerCase() === 'resolved'
                  ? 'border-l-green-500'
                  : complaint.status.toLowerCase() === 'rejected'
                  ? 'border-l-red-500'
                  : 'border-l-yellow-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(complaint.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      Complaint {complaint.id}
                    </p>
                    <span className="text-xs text-gray-500">
                      {format(new Date(complaint.updatedAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Your complaint has been {complaint.status.toLowerCase()}.
                    {complaint.response && (
                      <span className="block mt-1 text-sm">
                        Response: {complaint.response}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComplaintNotifications; 