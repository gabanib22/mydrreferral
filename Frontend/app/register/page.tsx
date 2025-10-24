"use client";
import { emailRegex, passwordRegex } from '@/lib/regex';
import { requestInstance } from '@/request';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import AuthLayout from '../../components/AuthLayout';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const router = useRouter();
  const initialForm = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    user_type: -1
  };
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (error) setError("");
    setFormData(prevForm => ({
      ...prevForm,
      [e.target.name]: e.target.value
    }));
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.phone_number || formData.user_type === -1) {
      setError('Please fill all the fields');
      return;
    }
    
    if (!emailRegex.test(formData.email)) {
      setError('Email is not valid');
      return;
    }
    
    if (!passwordRegex.test(formData.password)) {
      setError('Password must have at least 6 characters, one non-alphanumeric character and one digit');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Please match your password and confirm password fields');
      return;
    }
    
    if (formData.phone_number.length !== 10) {
      setError('Phone number must have 10 digits');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      const {confirmPassword, ...registerPayload} = formData;
      const data = await requestInstance.register(registerPayload);
      
      if (data?.is_success) {
        setFormData(initialForm);
        router.push('/login');
      }
    } catch (error: any) {
      console.error("Error: ", error?.response?.data);
      if (error?.response?.data && !error?.response?.data?.is_success && error?.response?.data?.message?.[0]?.includes('is already taken')) {
        setError(`It seems you already have an account, Please go to Login page by clicking 'Sign in' link`);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const getUserTypeLabel = (userType: number) => {
    switch (userType) {
      case 0: return 'Doctor';
      case 1: return 'Laboratory';
      case 2: return 'Agent';
      case 3: return 'Medical';
      case 4: return 'Admin';
      default: return 'Select User Type';
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join thousands of healthcare professionals"
    >
      <form onSubmit={handleSubmitForm} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                required
                value={formData.first_name}
                onChange={handleChangeInput}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="First name"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                required
                value={formData.last_name}
                onChange={handleChangeInput}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Last name"
              />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChangeInput}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Phone Number Field */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              autoComplete="tel"
              required
              value={formData.phone_number}
              onChange={handleChangeInput}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* User Type Field */}
        <div>
          <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-2">
            User Type
          </label>
          <select
            id="user_type"
            name="user_type"
            required
            value={formData.user_type}
            onChange={handleChangeInput}
            className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          >
            <option value="-1">Select User Type</option>
            <option value="0">Doctor</option>
            <option value="1">Laboratory</option>
            <option value="2">Agent</option>
            <option value="3">Medical</option>
            <option value="4">Admin</option>
          </select>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChangeInput}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Create a password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChangeInput}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-3 w-3" />
              <span>At least 6 characters long</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-3 w-3" />
              <span>One non-alphanumeric character</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-3 w-3" />
              <span>One digit (0-9)</span>
            </li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </button>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Register;