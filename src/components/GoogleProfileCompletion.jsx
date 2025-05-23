import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Building, GraduationCap, Briefcase, AlertCircle, Loader2, Shield, ArrowLeft } from 'lucide-react';
import { firebaseAuthService } from '../services/firebaseAuth.service';
import toast from 'react-hot-toast';

const GoogleProfileCompletion = ({ user, tempProfile, onComplete }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        role: 'student',
        department: '',
        studentId: '',
        facultyId: '',
        specialization: '',
        designation: 'Assistant Professor'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 2;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateStep1 = () => {
        if (!formData.department) {
            throw new Error('Department is required');
        }
        if (formData.role === 'student' && !formData.studentId) {
            throw new Error('Student ID is required for students');
        }
        if (formData.role === 'faculty' && !formData.facultyId) {
            throw new Error('Faculty ID is required for faculty members');
        }
        return true;
    };

    const validateStep2 = () => {
        if (formData.role === 'faculty') {
            if (!formData.specialization) {
                throw new Error('Specialization is required for faculty members');
            }
            if (!formData.designation) {
                throw new Error('Designation is required for faculty members');
            }
        }
        return true;
    };

    const handleNext = () => {
        try {
            if (currentStep === 1) {
                validateStep1();
            }
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
            setError(''); // Clear error on step change
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // If on step 1, validate and go to next step
        if (currentStep === 1) {
            handleNext();
            return;
        }

        // If on step 2, validate and submit
        setLoading(true);
        setError('');

        try {
            validateStep2(); // Validate step 2 fields before submitting
            const result = await firebaseAuthService.completeGoogleProfile(user.uid, formData);
            
            toast.success('Profile completed successfully!');
            onComplete(result.userProfile);
        } catch (err) {
            console.error('Profile completion failed:', err);
            setError(err.message || 'Failed to complete profile. Please try again.');
            toast.error(err.message || 'Failed to complete profile');
        } finally {
            setLoading(false);
        }
    };

    const roleColors = {
        student: {
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
            accent: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200'
        },
        faculty: {
            button: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
            accent: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200'
        },
        admin: {
            button: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
            accent: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-200'
        }
    };

    const currentRoleColors = roleColors[formData.role];

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2].map((step) => (
                <React.Fragment key={step}>
                    <div className={`flex items-center ${step <= currentStep ? currentRoleColors.accent : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            step <= currentStep ? `${currentRoleColors.border} ${currentRoleColors.bg} font-bold` : 'border-gray-300'
                        }`}>
                            {step < currentStep ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                step
                            )}
                        </div>
                        <span className="ml-2 text-sm font-medium">
                            {step === 1 ? 'Basic Info' : 'Additional Details'}
                        </span>
                    </div>
                    {step < totalSteps && (
                        <div className={`w-12 h-0.5 ${step < currentStep ? currentRoleColors.button.split(' ')[0].replace('bg-', 'bg-') : 'bg-gray-300'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-150"
                        >
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            Back to Login
                        </button>
                        {/* Profile Info with Icon */}
                        <div className="flex items-center space-x-2">
                             <User className={`h-6 w-6 ${currentRoleColors.accent}`} /> {/* User Icon */}
                            <span className="text-sm font-medium text-gray-700">
                                {tempProfile.firstname} {tempProfile.lastname}
                            </span>
                        </div>
                    </div>

                    {renderStepIndicator()}

                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Complete Your Profile
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {currentStep === 1 
                                ? 'Please provide your basic information to get started'
                                : 'Add additional details to complete your profile'}
                        </p>
                    </div>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center space-x-3">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Step 1: Basic Information */}
                        {currentStep === 1 && (
                            <>
                                <div className="relative">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            disabled
                                            className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                            value={tempProfile.email}
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                        Select your role
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Shield className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="role"
                                            name="role"
                                            required
                                            className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.role}
                                            onChange={handleChange}
                                        >
                                            <option value="student">Student</option>
                                            <option value="faculty">Faculty Member</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="relative">
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                        Department
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="department"
                                            name="department"
                                            type="text"
                                            required
                                            className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., Computer Science"
                                            value={formData.department}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {formData.role === 'student' && (
                                    <div className="relative">
                                        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                                            Student ID
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <GraduationCap className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="studentId"
                                                name="studentId"
                                                type="text"
                                                required
                                                className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter your student ID"
                                                value={formData.studentId}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                {formData.role === 'faculty' && (
                                    <div className="relative">
                                        <label htmlFor="facultyId" className="block text-sm font-medium text-gray-700 mb-1">
                                            Faculty ID
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Briefcase className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="facultyId"
                                                name="facultyId"
                                                type="text"
                                                required
                                                className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter your faculty ID"
                                                value={formData.facultyId}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Step 2: Additional Details */}
                        {currentStep === 2 && formData.role === 'faculty' && (
                            <>
                                <div className="relative">
                                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                                        Specialization
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <GraduationCap className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="specialization"
                                            name="specialization"
                                            type="text"
                                            required
                                            className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., Artificial Intelligence"
                                            value={formData.specialization}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                                        Designation
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Briefcase className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            id="designation"
                                            name="designation"
                                            required
                                            className="pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.designation}
                                            onChange={handleChange}
                                        >
                                            <option value="Assistant Professor">Assistant Professor</option>
                                            <option value="Associate Professor">Associate Professor</option>
                                            <option value="Professor">Professor</option>
                                            <option value="Lecturer">Lecturer</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 2 for Admin - currently no extra fields, but keeping structure */}
                         {currentStep === 2 && formData.role === 'admin' && (
                            <div className="text-center text-gray-600">
                                No additional details required for Admin.
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between pt-4">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                            >
                                Back
                            </button>
                        )}
                        {currentStep < totalSteps ? (
                             <button
                                type="button"
                                onClick={handleNext} // Use handleNext for Next Step button
                                disabled={loading}
                                className={`ml-auto px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white ${currentRoleColors.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150`}
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'Next Step'
                                )}
                            </button>
                        ) : (
                             <button
                                type="submit"
                                disabled={loading}
                                className={`ml-auto px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white ${currentRoleColors.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150`}
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'Complete Profile'
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GoogleProfileCompletion; 