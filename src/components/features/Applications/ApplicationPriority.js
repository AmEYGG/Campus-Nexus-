// Priority levels and their corresponding weights
const PRIORITY_LEVELS = {
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  URGENT: 4
};

// Time thresholds for priority escalation (in hours)
const ESCALATION_THRESHOLDS = {
  NORMAL_TO_HIGH: 48, // 2 days
  HIGH_TO_URGENT: 72  // 3 days
};

export const calculatePriority = (application) => {
  if (!application.submittedDate || application.status !== 'pending') {
    return application.priority;
  }

  const submittedDate = new Date(application.submittedDate);
  const currentDate = new Date();
  const hoursElapsed = (currentDate - submittedDate) / (1000 * 60 * 60);

  // Calculate new priority based on time elapsed
  if (hoursElapsed >= ESCALATION_THRESHOLDS.HIGH_TO_URGENT) {
    return 'urgent';
  } else if (hoursElapsed >= ESCALATION_THRESHOLDS.NORMAL_TO_HIGH) {
    return 'high';
  }

  return application.priority;
};

export const getPriorityScore = (application) => {
  const priority = calculatePriority(application);
  return PRIORITY_LEVELS[priority.toUpperCase()] || PRIORITY_LEVELS.NORMAL;
};

export const sortByPriority = (applications) => {
  return [...applications].sort((a, b) => {
    const priorityA = getPriorityScore(a);
    const priorityB = getPriorityScore(b);
    
    if (priorityA === priorityB) {
      // If priorities are equal, sort by submission date (older first)
      return new Date(a.submittedDate) - new Date(b.submittedDate);
    }
    
    return priorityB - priorityA;
  });
};

export const getPriorityLabel = (priority) => {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return {
        label: 'Urgent',
        color: 'bg-red-100 text-red-800',
        icon: '🔴'
      };
    case 'high':
      return {
        label: 'High Priority',
        color: 'bg-orange-100 text-orange-800',
        icon: '🟠'
      };
    case 'normal':
      return {
        label: 'Normal',
        color: 'bg-blue-100 text-blue-800',
        icon: '🔵'
      };
    case 'low':
      return {
        label: 'Low',
        color: 'bg-gray-100 text-gray-800',
        icon: '⚪'
      };
    default:
      return {
        label: 'Normal',
        color: 'bg-blue-100 text-blue-800',
        icon: '��'
      };
  }
}; 