"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/Header';
import { requestInstance } from '../../request';
import { 
  User, 
  Settings, 
  Shield, 
  HelpCircle, 
  Save,
  Edit3,
  Check,
  X,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  GraduationCap,
  Stethoscope
} from 'lucide-react';

// Navigation items based on user type
const getNavigationItems = (userType: number) => {
  const baseItems = [
    { icon: User, slug: 'personal-info', label: 'Personal Info', color: 'blue' },
    { icon: Settings, slug: 'settings', label: 'Settings', color: 'gray' },
    { icon: Shield, slug: 'security', label: 'Security', color: 'green' },
    { icon: HelpCircle, slug: 'help', label: 'Help & Support', color: 'purple' }
  ];

  if (userType === 0) { // Doctor
    return [
      { icon: User, slug: 'personal-info', label: 'Personal Info', color: 'blue' },
      { icon: Stethoscope, slug: 'clinical-info', label: 'Clinical Info', color: 'red' },
      { icon: DollarSign, slug: 'referral-settings', label: 'Referral Settings', color: 'green' },
      { icon: Settings, slug: 'settings', label: 'Settings', color: 'gray' },
      { icon: Shield, slug: 'security', label: 'Security', color: 'green' },
      { icon: HelpCircle, slug: 'help', label: 'Help & Support', color: 'purple' }
    ];
  }

  return baseItems;
};

const Profile: React.FC = () => {
  const { user, isLoading: userLoading, fetchUserData } = useUser();
  const { isAuthenticated, isLoading: authLoading, requireAuth } = useAuth();
  const [currentContent, setCurrentContent] = useState('personal-info');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; show: boolean } | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    userType: 0,
    referralAmount: 0,
    specialization: '',
    experience: '',
    qualification: '',
    clinicName: '',
    clinicAddress: '',
    city: '',
    state: '',
    pincode: '',
    bio: ''
  });

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUserData();
    }
  }, [isAuthenticated, user]); // Remove fetchUserData from dependencies

  useEffect(() => {
    if (user) {
      const newFormData = {
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phoneNumber: user.phone_number || '',
        userType: user.user_type || 0,
        referralAmount: user.referral_amount || 0,
        specialization: user.specialization || '',
        experience: user.experience || '',
        qualification: user.qualification || '',
        clinicName: user.clinic_name || '',
        clinicAddress: user.clinic_address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        bio: user.bio || ''
      };
      setFormData(newFormData);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  // Toast notification functions
  const showSuccessToast = (message: string) => {
    setToast({ type: 'success', message, show: true });
    setTimeout(() => setToast(null), 4000);
  };

  const showErrorToast = (message: string) => {
    setToast({ type: 'error', message, show: true });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Saving profile data:', formData);
      
      // Convert formData to snake_case for API request
      const apiPayload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        user_type: formData.userType,
        referral_amount: formData.referralAmount,
        specialization: formData.specialization,
        experience: formData.experience,
        qualification: formData.qualification,
        clinic_name: formData.clinicName,
        clinic_address: formData.clinicAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        bio: formData.bio
      };
      
      const response = await requestInstance.updateUserProfile(apiPayload);
      
      if (response?.is_success) {
        // Show success toast
        showSuccessToast('Profile updated successfully!');
        await fetchUserData();
        setIsEditing(false);
      } else {
        showErrorToast(response?.message?.[0] || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorToast('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getUserTypeLabel = (userType: number) => {
    switch (userType) {
      case 0: return 'Doctor';
      case 1: return 'Laboratory';
      case 2: return 'Agent';
      case 3: return 'Medical';
      case 4: return 'Admin';
      default: return 'Unknown';
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Personal Information</h2>
        <div className="flex items-center gap-2">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            ✓ Verified
          </span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {getUserTypeLabel(formData.userType)}
          </span>
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {formData.firstName} {formData.lastName}
            </h3>
            <p className="text-gray-600">{formData.email}</p>
            <p className="text-sm text-gray-500">{formData.phoneNumber}</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Referral Amount for Doctors */}
      {formData.userType === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Settings</h3>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">Referral Amount (₹)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                name="referralAmount"
                value={formData.referralAmount}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Amount you pay per referral"
                min="0"
                step="0.01"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Set your referral amount to attract more referrals from other doctors</p>
          </div>
        </div>
      )}


    </div>
  );

  const renderClinicalInfo = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Clinical Information</h2>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="e.g., Cardiology, Neurology"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="e.g., 5 years"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="e.g., MBBS, MD, PhD"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
            <input
              type="text"
              name="clinicName"
              value={formData.clinicName}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Your clinic or hospital name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Address</label>
            <textarea
              name="clinicAddress"
              value={formData.clinicAddress}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Full clinic address"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="City"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="State"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Pincode"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          disabled={!isEditing}
          placeholder="Tell us about yourself, your experience, and what makes you unique..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentContent) {
      case 'personal-info':
        return renderPersonalInfo();
      case 'clinical-info':
        return renderClinicalInfo();
      case 'referral-settings':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Referral Settings</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600">Manage your referral preferences and settings here.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600">Configure your account settings here.</p>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Security</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600">Manage your security settings and password here.</p>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Help & Support</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600">Get help and support for your account.</p>
            </div>
          </div>
        );
      default:
        return renderPersonalInfo();
    }
  };

  // Show loading state while checking authentication
  if (authLoading || userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show loading state if user data is not available yet
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading user data...</div>
      </div>
    );
  }

  const navigationItems = getNavigationItems(formData.userType);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h3>
                <nav className="space-y-2">
                  {navigationItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentContent(item.slug)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        currentContent === item.slug
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon size={20} className={`${
                        currentContent === item.slug ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {/* Edit/Save Buttons - Always visible at top */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-end space-x-4">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Edit3 size={16} className="mr-2" />
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <X size={16} className="mr-2" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          {isSaving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Save size={16} className="mr-2" />
                          )}
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
          toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg border-l-4 ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {toast.type === 'success' ? (
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className={`ml-4 text-lg font-bold hover:opacity-70 transition-opacity ${
                toast.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;