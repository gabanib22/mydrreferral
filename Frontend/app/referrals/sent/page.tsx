"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useUser } from '../../../contexts/UserContext';
import Header from '../../../components/Header';
import { requestInstance } from '../../../request';
import { 
  FileText, 
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
  TrendingUp
} from 'lucide-react';

interface SentReferral {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAddress: string;
  receivingDoctor: string;
  receivingDoctorPhone: string;
  receivingDoctorEmail: string;
  referralAmount: number;
  notes: string;
  status: 'sent' | 'received' | 'patient_visited' | 'payment_pending' | 'paid' | 'rejected';
  createdAt: string;
  acceptedDate?: string;
  patientVisitedDate?: string;
  paymentDate?: string;
}

const SentReferrals: React.FC = () => {
  const { isAuthenticated, requireAuth } = useAuth();
  const { user } = useUser();
  const [referrals, setReferrals] = useState<SentReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<SentReferral | null>(null);

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  const fetchSentReferrals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await requestInstance.getSentReferrals();
      
      console.log('=== SENT REFERRALS DEBUG ===');
      console.log('Sent referrals API response:', response);
      console.log('Response is_success:', response?.is_success);
      console.log('Response data:', response?.data);
      console.log('Response data type:', typeof response?.data);
      console.log('Response data is array:', Array.isArray(response?.data));
      console.log('Response data length:', response?.data?.length);
      console.log('Full response structure:', JSON.stringify(response, null, 2));
      
      if (response?.is_success && response.data && Array.isArray(response.data)) {
        const referralsData = response.data.map((item: any, index: number) => ({
          id: item.patient_id || `sent-ref-${index}`,
          patientName: item.patient_name || 'Unknown Patient',
          patientPhone: '', // Patient phone not available in current structure
          patientEmail: '', // Patient email not available in current structure
          patientAddress: '', // Patient address not available in current structure
          receivingDoctor: item.doctor_name || 'Unknown Doctor',
          receivingDoctorPhone: item.doctor_phone || '',
          receivingDoctorEmail: item.doctor_email || '',
          referralAmount: item.amount || 0,
          notes: item.notes || '',
          status: getStatusFromItem(item),
          createdAt: item.created_date || new Date().toISOString(),
          acceptedDate: item.accepted_date,
          patientVisitedDate: item.patient_visited_date,
          paymentDate: item.payment_date
        }));
        console.log('Mapped sent referrals data:', referralsData);
        setReferrals(referralsData);
      } else {
        setReferrals([]);
      }
    } catch (err) {
      console.error('Error fetching sent referrals:', err);
      setError('Failed to load referrals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSentReferrals();
    }
  }, [isAuthenticated, fetchSentReferrals]);

  const getStatusFromItem = (item: any): SentReferral['status'] => {
    const status = item.status?.toLowerCase();
    switch (status) {
      case 'paid': return 'paid';
      case 'patient visited': return 'payment_pending'; // Show as payment pending for sender
      case 'received': return 'received';
      case 'rejected': return 'rejected';
      case 'sent': return 'sent';
      default: return 'sent';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'payment_pending': return 'bg-yellow-100 text-yellow-800';
      case 'patient_visited': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-purple-100 text-purple-800';
      case 'sent': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'payment_pending': return <Clock className="w-4 h-4" />;
      case 'patient_visited': return <User className="w-4 h-4" />;
      case 'received': return <AlertCircle className="w-4 h-4" />;
      case 'sent': return <FileText className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const renderReferralCard = (referral: SentReferral) => (
    <div key={referral.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {referral.patientName.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{referral.patientName}</h3>
            <p className="text-sm text-gray-600">Sent to {referral.receivingDoctor}</p>
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
            <span>{referral.receivingDoctor}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{referral.receivingDoctorPhone}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{referral.receivingDoctorEmail}</span>
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
          <span>Sent: {new Date(referral.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-lg font-semibold text-green-600">
          <DollarSign className="w-5 h-5" />
          <span>₹{referral.referralAmount}</span>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${referral.status === 'sent' || referral.status === 'received' || referral.status === 'patient_visited' || referral.status === 'payment_pending' || referral.status === 'paid' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <span className="text-gray-600">Sent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${referral.status === 'received' || referral.status === 'patient_visited' || referral.status === 'payment_pending' || referral.status === 'paid' ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
            <span className="text-gray-600">Received</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${referral.status === 'patient_visited' || referral.status === 'payment_pending' || referral.status === 'paid' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <span className="text-gray-600">Visited</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${referral.status === 'payment_pending' || referral.status === 'paid' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
            <span className="text-gray-600">Payment</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${referral.status === 'paid' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-gray-600">Paid</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4">
        <button
          onClick={() => setSelectedReferral(referral)}
          className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          View Details
        </button>
      </div>
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
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Sent Referrals</h1>
            </div>
            <p className="text-gray-600">Track referrals you&apos;ve sent to other doctors</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {referrals.filter(r => r.status === 'sent').length}
                  </p>
                  <p className="text-sm text-gray-600">Sent</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {referrals.filter(r => r.status === 'received').length}
                  </p>
                  <p className="text-sm text-gray-600">Received</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
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
                onClick={fetchSentReferrals}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : referrals.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Referrals Sent</h3>
              <p className="text-gray-600 mb-6">You haven&apos;t sent any referrals to other doctors yet.</p>
              <p className="text-sm text-gray-500">Start by creating a new referral from the Referrals menu.</p>
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

export default SentReferrals;
