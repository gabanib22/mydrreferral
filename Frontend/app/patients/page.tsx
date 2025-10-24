"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../contexts/UserContext';
import Header from '../../components/Header';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  TrendingUp,
  Stethoscope,
  Heart,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  lastVisit: string;
  totalVisits: number;
  status: 'active' | 'inactive' | 'new';
  notes: string;
}

const Patients: React.FC = () => {
  const { isAuthenticated, requireAuth } = useAuth();
  const { user } = useUser();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPatients();
    }
  }, [isAuthenticated]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockPatients: Patient[] = [
        {
          id: '1',
          name: 'John Smith',
          phone: '+1 234-567-8900',
          email: 'john.smith@email.com',
          address: '123 Main St, City, State',
          lastVisit: '2024-01-15',
          totalVisits: 5,
          status: 'active',
          notes: 'Regular checkups, no major issues'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          phone: '+1 234-567-8901',
          email: 'sarah.johnson@email.com',
          address: '456 Oak Ave, City, State',
          lastVisit: '2024-01-10',
          totalVisits: 3,
          status: 'active',
          notes: 'Follow-up appointment scheduled'
        },
        {
          id: '3',
          name: 'Mike Wilson',
          phone: '+1 234-567-8902',
          email: 'mike.wilson@email.com',
          address: '789 Pine St, City, State',
          lastVisit: '2023-12-20',
          totalVisits: 1,
          status: 'inactive',
          notes: 'One-time consultation'
        }
      ];
      
      setPatients(mockPatients);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      case 'new': return <Activity className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const renderPatientCard = (patient: Patient) => (
    <div key={patient.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {patient.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
            <p className="text-sm text-gray-600">Patient ID: {patient.id}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(patient.status)}`}>
          {getStatusIcon(patient.status)}
          <span className="capitalize">{patient.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{patient.phone}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{patient.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{patient.address}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>Total Visits: {patient.totalVisits}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Stethoscope className="w-4 h-4" />
            <span>Status: {patient.status}</span>
          </div>
        </div>
      </div>

      {patient.notes && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{patient.notes}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Heart className="w-4 h-4" />
          <span>Patient since {new Date(patient.lastVisit).getFullYear()}</span>
        </div>
        <button
          onClick={() => setSelectedPatient(patient)}
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
            <p className="text-gray-600">Loading patients...</p>
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
              <User className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
            </div>
            <p className="text-gray-600">Manage your patient records and history</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                  <p className="text-sm text-gray-600">Total Patients</p>
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
                    {patients.filter(p => p.status === 'active').length}
                  </p>
                  <p className="text-sm text-gray-600">Active Patients</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.filter(p => p.status === 'new').length}
                  </p>
                  <p className="text-sm text-gray-600">New Patients</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {patients.reduce((sum, p) => sum + p.totalVisits, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Visits</p>
                </div>
              </div>
            </div>
          </div>

          {/* Patients List */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <User className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Patients</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchPatients}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : patients.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Patients Yet</h3>
              <p className="text-gray-600 mb-6">You don't have any patients in your records yet.</p>
              <p className="text-sm text-gray-500">Patients will appear here when they visit your clinic.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {patients.map(renderPatientCard)}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Patients;
