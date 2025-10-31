"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useUser } from '../../../contexts/UserContext';
import Header from '../../../components/Header';
import { requestInstance } from '../../../request';
import { 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  AlertCircle
} from 'lucide-react';

interface ReceivedReferral {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAddress: string;
  referringDoctor: string;
  referringDoctorPhone: string;
  referringDoctorEmail: string;
  referralAmount: number;
  notes: string;
  status: 'received' | 'patient_visited' | 'paid' | 'rejected';
  createdAt: string;
  acceptedDate?: string;
  patientVisitedDate?: string;
  paymentDate?: string;
}

const ReceivedReferrals: React.FC = () => {
  const { isAuthenticated, requireAuth } = useAuth();
  const { user } = useUser();
  const [referrals, setReferrals] = useState<ReceivedReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<ReceivedReferral | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  const fetchReceivedReferrals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await requestInstance.getReceivedReferrals();
      
      console.log('=== RECEIVED REFERRALS DEBUG ===');
      console.log('Received referrals API response:', response);
      console.log('Response is_success:', response?.is_success);
      console.log('Response data:', response?.data);
      console.log('Response data type:', typeof response?.data);
      console.log('Response data is array:', Array.isArray(response?.data));
      console.log('Response data length:', response?.data?.length);
      console.log('Full response structure:', JSON.stringify(response, null, 2));
      
      if (response?.is_success && response.data && Array.isArray(response.data)) {
        const referralsData = response.data.map((item: any, index: number) => ({
          id: item.patient_id || `received-ref-${index}`,
          patientName: item.patient_name || 'Unknown Patient',
          patientPhone: item.patient_phone || item.PatientPhone || '',
          patientEmail: item.patient_email || item.PatientEmail || '',
          patientAddress: item.patient_address || item.PatientAddress || '',
          referringDoctor: item.doctor_name || 'Unknown Doctor',
          referringDoctorPhone: item.doctor_phone || '',
          referringDoctorEmail: item.doctor_email || '',
          referralAmount: item.amount || 0,
          notes: item.notes || '',
          status: getStatusFromItem(item),
          createdAt: item.created_date || new Date().toISOString(),
          acceptedDate: item.accepted_date,
          patientVisitedDate: item.patient_visited_date,
          paymentDate: item.payment_date
        }));
        setReferrals(referralsData);
        console.log('Mapped referrals data:', referralsData);
      } else {
        console.log('No data or invalid response structure');
        setReferrals([]);
      }
    } catch (err) {
      console.error('Error fetching received referrals:', err);
      setError('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReceivedReferrals();
    }
  }, [isAuthenticated, fetchReceivedReferrals]);

  const getStatusFromItem = (item: any): ReceivedReferral['status'] => {
    // Use the status field directly from the API response (snake_case)
    const status = item.status?.toLowerCase();
    switch (status) {
      case 'paid': return 'paid';
      case 'patient visited': return 'patient_visited';
      case 'received': return 'received';
      case 'rejected': return 'rejected';
      case 'sent': return 'received'; // For received referrals, 'sent' means 'received'
      default: return 'received';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'patient_visited': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'patient_visited': return <UserCheck className="w-4 h-4" />;
      case 'received': return <AlertCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleStatusChange = async (referralId: string, newStatus: string) => {
    try {
      setActionLoading(referralId);
      
      console.log('=== UPDATE REFERRAL STATUS DEBUG ===');
      console.log('Referral ID:', referralId);
      console.log('New Status:', newStatus);
      
      // Update referral status
      const response = await requestInstance.updateReferralStatus(referralId, newStatus);
      
      console.log('API Response:', response);
      
      if (response?.is_success) {
        console.log('Status update successful');
        // Refresh the list
        await fetchReceivedReferrals();
      } else {
        console.log('Status update failed:', response?.message);
        alert('Failed to update referral status');
      }
    } catch (error) {
      console.error('Error updating referral status:', error);
      alert('Failed to update referral status');
    } finally {
      setActionLoading(null);
    }
  };

  const renderReferralCard = (referral: ReceivedReferral) => (
    <div key={referral.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {referral.patientName.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{referral.patientName}</h3>
            <p className="text-sm text-gray-600">Referred by {referral.referringDoctor}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(referral.status)}`}>
          {getStatusIcon(referral.status)}
          <span className="capitalize">{referral.status.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          {referral.patientPhone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{referral.patientPhone}</span>
            </div>
          )}
          {referral.patientEmail && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{referral.patientEmail}</span>
            </div>
          )}
          {referral.patientAddress && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{referral.patientAddress}</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Stethoscope className="w-4 h-4" />
            <span>{referral.referringDoctor}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{referral.referringDoctorPhone}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{referral.referringDoctorEmail}</span>
          </div>
        </div>
      </div>

      {referral.notes && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{referral.notes}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Received: {new Date(referral.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-lg font-semibold text-green-600">
          <DollarSign className="w-5 h-5" />
          <span>₹{referral.referralAmount}</span>
        </div>
      </div>

      {/* Action Buttons */}
      {referral.status === 'received' && (
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => handleStatusChange(referral.id, 'patient_visited')}
            disabled={actionLoading === referral.id}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {actionLoading === referral.id ? 'Updating...' : 'Mark Patient Visited'}
          </button>
          <button
            onClick={() => setSelectedReferral(referral)}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            View Details
          </button>
        </div>
      )}

      {referral.status === 'patient_visited' && (
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => handleStatusChange(referral.id, 'paid')}
            disabled={actionLoading === referral.id}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {actionLoading === referral.id ? 'Updating...' : 'Mark Payment Completed'}
          </button>
          <button
            onClick={() => setSelectedReferral(referral)}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            View Details
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading referrals...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <UserCheck className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Received Referrals</h1>
            </div>
            <p className="text-gray-600">Manage referrals sent to you by other doctors</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {referrals.filter(r => r.status === 'received').length}
                  </p>
                  <p className="text-sm text-gray-600">New Referrals</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {referrals.filter(r => r.status === 'patient_visited').length}
                  </p>
                  <p className="text-sm text-gray-600">Patient Visited</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {referrals.filter(r => r.status === 'paid').length}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Referrals List */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Referrals</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchReceivedReferrals}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : referrals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Referrals Yet</h3>
              <p className="text-gray-600 mb-6">You haven&apos;t received any referrals from other doctors yet.</p>
              <p className="text-sm text-gray-500">Referrals will appear here when other doctors send patients to you.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {referrals.map(renderReferralCard)}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReceivedReferrals;
