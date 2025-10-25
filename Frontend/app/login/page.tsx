"use client";
import { emailRegex, passwordRegex } from '@/lib/regex';
import { requestInstance } from '@/request';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from '../../components/AuthLayout';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, login, redirectIfAuthenticated } = useAuth();
  const initialForm = {
    user_name: '',
    password: '',
  };
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    redirectIfAuthenticated();
  }, [redirectIfAuthenticated]);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (error) setError("");
    setFormData(prevForm => ({
      ...prevForm,
      [e.target.name]: e.target.value
    }));
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_name || !formData.password) {
      setError('Please fill all the fields');
      return;
    }
    
    if (!emailRegex.test(formData.user_name)) {
      setError('Email is not valid');
      return;
    }
    
    if (!passwordRegex.test(formData.password)) {
      setError('Password must have at least 6 characters, one non-alphanumeric character and one digit');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      const data = await requestInstance.login(formData);
      console.log('Login response:', data);
      
      if (data && data.is_success && data.data?.token) {
        console.log('Token received:', data.data.token.substring(0, 20) + '...');
        setFormData(initialForm);
        login(data.data.token);
        router.push('/');
      } else {
        console.log('Login failed - data:', data);
        setError("Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Error: ", error?.response?.data);
      if (error?.response?.data && !error?.response?.data?.is_success) {
        setError(error?.response?.data?.message?.[0]);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmitForm} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="user_name"
              name="user_name"
              type="email"
              autoComplete="email"
              required
              value={formData.user_name}
              onChange={handleChangeInput}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Password Field */}
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
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChangeInput}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              placeholder="Enter your password"
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

        {/* Forgot Password Link */}
        <div className="flex items-center justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
          >
            Forgot your password?
          </Link>
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
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Login;