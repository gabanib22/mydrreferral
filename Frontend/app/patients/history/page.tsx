"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useUser } from '../../../contexts/UserContext';
import Header from '../../../components/Header';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  Activity,
  Heart,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PatientHistory {
  id: string;
  patientName: string;
  visitDate: string;
  visitType: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  status: 'completed' | 'pending' | 'cancelled';
  doctor: string;
  duration: string;
}

const PatientHistory: React.FC = () => {
  const { isAuthenticated, requireAuth } = useAuth();
  const { user } = useUser();
  const [history, setHistory] = useState<PatientHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<PatientHistory | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPatientHistory();
    }
  }, [isAuthenticated]);

  const fetchPatientHistory = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockHistory: PatientHistory[] = [
        {
          id: '1',
          patientName: 'John Smith',
          visitDate: '2024-01-15',
          visitType: 'Regular Checkup',
          diagnosis: 'Healthy',
          treatment: 'Routine examination',
          notes: 'Patient in good health, no issues found',
          status: 'completed',
          doctor: 'Dr. Sarah Johnson',
          duration: '30 minutes'
        },
        {
          id: '2',
          patientName: 'Sarah Johnson',
          visitDate: '2024-01-10',
          visitType: 'Follow-up',
          diagnosis: 'Hypertension',
          treatment: 'Medication adjustment',
          notes: 'Blood pressure improved, continue current medication',
          status: 'completed',
          doctor: 'Dr. Mike Wilson',
          duration: '45 minutes'
        },
        {
          id: '3',
          patientName: 'Mike Wilson',
          visitDate: '2024-01-20',
          visitType: 'Consultation',
          diagnosis: 'Pending',
          treatment: 'Tests ordered',
          notes: 'Lab results pending, follow-up in 1 week',
          status: 'pending',
          doctor: 'Dr. Sarah Johnson',
          duration: '20 minutes'
        },
        {
          id: '4',
          patientName: 'Emily Davis',
          visitDate: '2024-01-18',
          visitType: 'Emergency',
          diagnosis: 'Chest Pain',
          treatment: 'ECG and blood tests',
          notes: 'Patient stable, referred to cardiologist',
          status: 'completed',
          doctor: 'Dr. Mike Wilson',
          duration: '60 minutes'
        }
      ];
      
      setHistory(mockHistory);
    } catch (err) {
      console.error('Error fetching patient history:', err);
      setError('Failed to load patient history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredHistory = history.filter(item => 
    filter === 'all' || item.status === filter
  );

  const renderHistoryCard = (item: PatientHistory) => (
    <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {item.patientName.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{item.patientName}</h3>
            <p className="text-sm text-gray-600">{item.visitType}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
          {getStatusIcon(item.status)}
          <span className="capitalize">{item.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(item.visitDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{item.duration}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Stethoscope className="w-4 h-4" />
            <span>{item.doctor}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Activity className="w-4 h-4" />
            <span>Diagnosis: {item.diagnosis}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Heart className="w-4 h-4" />
            <span>Treatment: {item.treatment}</span>
          </div>
        </div>
      </div>

      {item.notes && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{item.notes}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <AlertCircle className="w-4 h-4" />
          <span>Visit ID: {item.id}</span>
        </div>
        <button
          onClick={() => setSelectedHistory(item)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
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
            <p className="text-gray-600">Loading patient history...</p>
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
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Patient History</h1>
            </div>
            <p className="text-gray-600">View and manage patient visit history</p>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Visits
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'cancelled' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{history.length}</p>
                  <p className="text-sm text-gray-600">Total Visits</p>
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
                    {history.filter(h => h.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
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
                    {history.filter(h => h.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {history.filter(h => h.status === 'cancelled').length}
                  </p>
                  <p className="text-sm text-gray-600">Cancelled</p>
                </div>
              </div>
            </div>
          </div>

          {/* History List */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading History</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchPatientHistory}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No History Found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "No patient visits found in your records." 
                  : `No ${filter} visits found.`
                }
              </p>
              <p className="text-sm text-gray-500">Patient visits will appear here when they are recorded.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredHistory.map(renderHistoryCard)}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PatientHistory;
