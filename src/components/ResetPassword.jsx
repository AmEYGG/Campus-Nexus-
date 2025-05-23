import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { firebaseAuthService } from '../services/firebaseAuth.service';
import toast from 'react-hot-toast';

const ResetPassword = ({ onBackToLogin }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const oobCode = searchParams.get('oobCode');
    const [formData, setFormData] = useState({
        email: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!oobCode) {
            setError('Invalid password reset link. Please request a new one.');
        }
    }, [oobCode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];
        if (password.length < minLength) errors.push('At least 8 characters');
        if (!hasUpperCase) errors.push('One uppercase letter');
        if (!hasLowerCase) errors.push('One lowercase letter');
        if (!hasNumbers) errors.push('One number');
        if (!hasSpecialChar) errors.push('One special character');

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!oobCode) {
                throw new Error('Cannot reset password without a valid link.');
            }

            // Validate passwords match
            if (formData.newPassword !== formData.confirmPassword) {
                throw new Error('Passwords do not match');
            }

            // Validate password strength
            const passwordErrors = validatePassword(formData.newPassword);
            if (passwordErrors.length > 0) {
                throw new Error(`Password must contain: ${passwordErrors.join(', ')}`);
            }

            // Update password
            await firebaseAuthService.updateUserPassword(oobCode, formData.newPassword);
            
            setSuccess(true);
            toast.success('Password updated successfully!');
            
            // Optionally redirect after success or inform user to go back
            // The back button will handle navigation if needed

        } catch (err) {
            console.error('Password reset failed:', err);
            setError(err.message || 'Failed to reset password. Please try again.');
            toast.error(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Password Updated!
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your password has been successfully updated.
                        </p>
                         <button
                            type="button"
                            onClick={onBackToLogin}
                            className="mt-4 text-sm text-blue-600 hover:text-blue-500 transition-colors duration-150"
                        >
                            Back to login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                <div>
                    <div className="flex justify-center">
                        <div className="p-3 rounded-full bg-blue-100">
                            <Lock className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset Your Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please enter your new password below
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-center space-x-3">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="pl-10 pr-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter new password"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className="pl-10 pr-10 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Confirm new password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${formData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    At least 8 characters
                                </li>
                                <li className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    One uppercase letter
                                </li>
                                <li className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    One lowercase letter
                                </li>
                                <li className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    One number
                                </li>
                                <li className="flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    One special character
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || !oobCode}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={onBackToLogin}
                            className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-150"
                        >
                            Back to login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword; 