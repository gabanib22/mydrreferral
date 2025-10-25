"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useUser } from '../../../contexts/UserContext';
import Header from '../../../components/Header';
import { requestInstance } from '../../../request';
import { 
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
  AlertCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';

interface PendingReferral {
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
  status: 'received' | 'patient_visited' | 'payment_pending';
  createdAt: string;
  acceptedDate?: string;
  patientVisitedDate?: string;
  paymentDate?: string;
}

const PendingReferrals: React.FC = () => {
  const { isAuthenticated, requireAuth } = useAuth();
  const { user } = useUser();
  const [referrals, setReferrals] = useState<PendingReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<PendingReferral | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  const fetchPendingReferrals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await requestInstance.getReceivedReferrals();
      
      console.log('Pending referrals API response:', response);
      
      if (response?.is_success && response.data && Array.isArray(response.data)) {
        // Filter only pending referrals (received, patient_visited, payment_pending)
        const pendingReferrals = response.data
          .filter((item: any) => {
            const status = getStatusFromItem(item);
            return status === 'received' || status === 'patient_visited' || status === 'payment_pending';
          })
          .map((item: any, index: number) => ({
            id: item.id || `pending-ref-${index}`,
            patientName: item.PatientName || 'Unknown Patient',
            patientPhone: item.Mobile || '',
            patientEmail: item.Email || '',
            patientAddress: item.Address || '',
            referringDoctor: item.DoctorName || 'Unknown Doctor',
            referringDoctorPhone: item.DoctorPhone || '',
            referringDoctorEmail: item.DoctorEmail || '',
            referralAmount: item.Amount || 0,
            notes: item.Notes || '',
            status: getStatusFromItem(item),
            createdAt: item.CreatedDate || new Date().toISOString(),
            acceptedDate: item.AcceptedDate,
            patientVisitedDate: item.PatientVisitedDate,
            paymentDate: item.PaymentDate
          }));
        setReferrals(pendingReferrals);
      } else {
        setReferrals([]);
      }
    } catch (err) {
      console.error('Error fetching pending referrals:', err);
      setError('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingReferrals();
    }
  }, [isAuthenticated, fetchPendingReferrals]);

  const getStatusFromItem = (item: any): PendingReferral['status'] => {
    if (item.IsPaid) return 'payment_pending'; // This shouldn't happen for pending
    if (item.PaymentDate) return 'payment_pending';
    if (item.PatientVisitedDate) return 'patient_visited';
    if (item.IsAccepted) return 'received';
    return 'received';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payment_pending': return 'bg-yellow-100 text-yellow-800';
      case 'patient_visited': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'payment_pending': return <Clock className="w-4 h-4" />;
      case 'patient_visited': return <UserCheck className="w-4 h-4" />;
      case 'received': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleStatusChange = async (referralId: string, newStatus: string) => {
    try {
      setActionLoading(referralId);
      
      // Update referral status
      const response = await requestInstance.updateReferralStatus(referralId, newStatus);
      
      if (response?.is_success) {
        // Refresh the list
        await fetchPendingReferrals();
      } else {
        alert('Failed to update referral status');
      }
    } catch (error) {
      console.error('Error updating referral status:', error);
      alert('Failed to update referral status');
    } finally {
      setActionLoading(null);
    }
  };

  const renderReferralCard = (referral: PendingReferral) => (
    <div key={referral.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
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
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{referral.patientPhone}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{referral.patientEmail}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{referral.patientAddress}</span>
          </div>
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

      <div className="flex justify-between items-center mb-4">
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
            onClick={() => handleStatusChange(referral.id, 'payment_pending')}
            disabled={actionLoading === referral.id}
            className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            {actionLoading === referral.id ? 'Updating...' : 'Mark Payment Pending'}
          </button>
          <button
            onClick={() => setSelectedReferral(referral)}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            View Details
          </button>
        </div>
      )}

      {referral.status === 'payment_pending' && (
        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => handleStatusChange(referral.id, 'paid')}
            disabled={actionLoading === referral.id}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {actionLoading === referral.id ? 'Updating...' : 'Mark as Paid'}
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
            <p className="text-gray-600">Loading pending referrals...</p>
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
              <Clock className="w-8 h-8 text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-900">Pending Actions</h1>
            </div>
            <p className="text-gray-600">Referrals that require your attention</p>
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
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {referrals.filter(r => r.status === 'payment_pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Payment Pending</p>
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
                onClick={fetchPendingReferrals}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : referrals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Actions</h3>
              <p className="text-gray-600 mb-6">You have no referrals requiring your attention.</p>
              <p className="text-sm text-gray-500">All your referrals are up to date!</p>
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

export default PendingReferrals;
