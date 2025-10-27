"use client";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { requestInstance } from "@/request";
import Header from "../components/Header";
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Chip } from "@mui/material";
import { Heart, Users, UserPlus, Shield, Zap, Star, TrendingUp, IndianRupee } from "lucide-react";
import Link from "next/link";

// Types for our data
interface ReferralData {
  id: number;
  doctorName: string;
  email: string;
  mobile: string;
  amount: number;
  notes: string;
  status: string;
  createdAt: string;
  acceptedDate?: string;
  patientVisitedDate?: string;
  paymentDate?: string;
}

interface DashboardStats {
  totalSent: number;
  totalReceived: number;
  totalAmount: number;
  pendingReferrals: number;
}

function Home() {
  const { isAuthenticated, isLoading, requireAuth } = useAuth();
  const [sentReferrals, setSentReferrals] = useState<ReferralData[]>([]);
  const [receivedReferrals, setReceivedReferrals] = useState<ReferralData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSent: 0,
    totalReceived: 0,
    totalAmount: 0,
    pendingReferrals: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Function to get status chip color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'payment pending':
        return 'warning';
      case 'patient visited':
        return 'info';
      case 'received':
        return 'primary';
      case 'sent':
        return 'default';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Check authentication
  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Load dashboard data
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading dashboard data...");

      // Load sent referrals
      const sentResponse = await requestInstance.getSentReferrals();
      console.log("Sent referrals response:", sentResponse);
      
      let sentData: ReferralData[] = [];
      if (Array.isArray(sentResponse)) {
        sentData = sentResponse.map((item: any, index: number) => ({
          id: index + 1,
          doctorName: item.DoctorName || item.doctor_name || 'Unknown Doctor',
          email: item.Email || item.email || '',
          mobile: item.Mobile || item.mobile || '',
          amount: item.Amount || item.amount || 0,
          notes: item.Notes || item.notes || '',
          status: item.Status || 'Sent',
          createdAt: item.CreatedDate || new Date().toISOString(),
          acceptedDate: item.AcceptedDate,
          patientVisitedDate: item.PatientVisitedDate,
          paymentDate: item.PaymentDate
        }));
      } else if (sentResponse?.data && Array.isArray(sentResponse.data)) {
        sentData = sentResponse.data.map((item: any, index: number) => ({
          id: index + 1,
          doctorName: item.DoctorName || item.doctor_name || 'Unknown Doctor',
          email: item.Email || item.email || '',
          mobile: item.Mobile || item.mobile || '',
          amount: item.Amount || item.amount || 0,
          notes: item.Notes || item.notes || '',
          status: item.Status || 'Sent',
          createdAt: item.CreatedDate || new Date().toISOString(),
          acceptedDate: item.AcceptedDate,
          patientVisitedDate: item.PatientVisitedDate,
          paymentDate: item.PaymentDate
        }));
      }

      // Load received referrals
      const receivedResponse = await requestInstance.getReceivedReferrals();
      console.log("Received referrals response:", receivedResponse);
      
      let receivedData: ReferralData[] = [];
      if (Array.isArray(receivedResponse)) {
        receivedData = receivedResponse.map((item: any, index: number) => ({
          id: index + 1,
          doctorName: item.DoctorName || item.doctor_name || 'Unknown Doctor',
          email: item.Email || item.email || '',
          mobile: item.Mobile || item.mobile || '',
          amount: item.Amount || item.amount || 0,
          notes: item.Notes || item.notes || '',
          status: item.Status || 'Received',
          createdAt: item.CreatedDate || new Date().toISOString(),
          acceptedDate: item.AcceptedDate
        }));
      } else if (receivedResponse?.data && Array.isArray(receivedResponse.data)) {
        receivedData = receivedResponse.data.map((item: any, index: number) => ({
          id: index + 1,
          doctorName: item.DoctorName || item.doctor_name || 'Unknown Doctor',
          email: item.Email || item.email || '',
          mobile: item.Mobile || item.mobile || '',
          amount: item.Amount || item.amount || 0,
          notes: item.Notes || item.notes || '',
          status: item.Status || 'Received',
          createdAt: item.CreatedDate || new Date().toISOString(),
          acceptedDate: item.AcceptedDate
        }));
      }

      setSentReferrals(sentData);
      setReceivedReferrals(receivedData);

      // Calculate stats
      const totalSent = sentData.length;
      const totalReceived = receivedData.length;
      const totalAmount = [...sentData, ...receivedData].reduce((sum, item) => sum + item.amount, 0);
      const pendingReferrals = receivedData.filter(item => item.status === 'Pending').length;

      setStats({
        totalSent,
        totalReceived,
        totalAmount,
        pendingReferrals
      });

      console.log("Dashboard data loaded successfully:", {
        sent: sentData.length,
        received: receivedData.length,
        stats: { totalSent, totalReceived, totalAmount, pendingReferrals }
      });

    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      
      // More specific error messages
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
        setError("Cannot connect to the server. Please make sure the API server is running on http://3.110.30.11");
      } else if (error?.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (error?.response?.status === 403) {
        setError("Access denied. You don't have permission to view this data.");
      } else if (error?.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(error?.response?.data?.message?.[0] || error?.message || "Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <CircularProgress size={40} />
          <div className="text-xl mt-4">Loading...</div>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900">MyDrReferral</span>
                    <span className="text-xs text-gray-500 -mt-1">Professional Network</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Connect. Refer. 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                Grow.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The professional network that connects doctors, specialists, and healthcare providers. 
              Build meaningful relationships and grow your practice through trusted referrals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors duration-200 text-lg font-semibold"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose MyDrReferral?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for healthcare professionals who want to expand their network and grow their practice.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Professional Network</h3>
              <p className="text-gray-600">
                Connect with verified healthcare professionals and build meaningful professional relationships.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Easy Referrals</h3>
              <p className="text-gray-600">
                Send and receive patient referrals seamlessly with our intuitive referral management system.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure & Trusted</h3>
              <p className="text-gray-600">
                Your data is protected with enterprise-grade security and HIPAA compliance.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">MyDrReferral</span>
              </div>
            </div>
            <div className="text-center text-gray-400 mt-4">
              © 2024 MyDrReferral. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Show dashboard for authenticated users
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here&apos;s your referral overview.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" className="font-bold">
                      {stats.totalSent}
                    </Typography>
                    <Typography variant="body2" className="opacity-90">
                      Referrals Sent
                    </Typography>
                  </div>
                  <TrendingUp className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" className="font-bold">
                      {stats.totalReceived}
                    </Typography>
                    <Typography variant="body2" className="opacity-90">
                      Referrals Received
                    </Typography>
                  </div>
                  <Users className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" className="font-bold">
                      ₹{stats.totalAmount}
                    </Typography>
                    <Typography variant="body2" className="opacity-90">
                      Total Amount
                    </Typography>
                  </div>
                  <IndianRupee className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography variant="h4" className="font-bold">
                      {stats.pendingReferrals}
                    </Typography>
                    <Typography variant="body2" className="opacity-90">
                      Pending
                    </Typography>
                  </div>
                  <Star className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Alert 
              severity="error" 
              className="mb-6"
              action={
                <button
                  onClick={loadDashboardData}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Retry
                </button>
              }
            >
              {error}
            </Alert>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sent Referrals */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <Typography variant="h5" className="font-bold text-gray-900">
                    Referrals I Sent
                  </Typography>
                  <Chip 
                    label={`${sentReferrals.length} total`} 
                    color="primary" 
                    size="small" 
                  />
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <CircularProgress size={40} />
                    <Typography variant="body2" className="mt-2 text-gray-600">
                      Loading sent referrals...
                    </Typography>
                  </div>
                ) : sentReferrals.length > 0 ? (
                  <div className="space-y-4">
                    {sentReferrals.map((referral) => (
                      <div key={referral.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <Typography variant="h6" className="font-semibold text-gray-900">
                              {referral.doctorName}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                              {referral.email}
                            </Typography>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Chip 
                              label={`₹${referral.amount}`} 
                              color="success" 
                              size="small" 
                            />
                            <Chip 
                              label={referral.status} 
                              color={getStatusColor(referral.status) as any} 
                              size="small" 
                              variant="outlined"
                            />
                          </div>
                        </div>
                        {referral.notes && (
                          <Typography variant="body2" className="text-gray-700 mt-2">
                            {referral.notes}
                          </Typography>
                        )}
                        {referral.paymentDate && (
                          <Typography variant="caption" className="text-green-600 mt-1 block">
                            💰 Paid on: {new Date(referral.paymentDate).toLocaleDateString()}
                          </Typography>
                        )}
                        {referral.patientVisitedDate && !referral.paymentDate && (
                          <Typography variant="caption" className="text-blue-600 mt-1 block">
                            🏥 Patient visited on: {new Date(referral.patientVisitedDate).toLocaleDateString()}
                          </Typography>
                        )}
                        {referral.acceptedDate && !referral.patientVisitedDate && (
                          <Typography variant="caption" className="text-gray-500 mt-1 block">
                            📋 Received on: {new Date(referral.acceptedDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <Typography variant="h6" className="text-gray-500 mb-2">
                      No referrals sent yet
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">
                      Start building your network by sending referrals to colleagues.
                    </Typography>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Received Referrals */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <Typography variant="h5" className="font-bold text-gray-900">
                    Referrals I Received
                  </Typography>
                  <Chip 
                    label={`${receivedReferrals.length} total`} 
                    color="secondary" 
                    size="small" 
                  />
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <CircularProgress size={40} />
                    <Typography variant="body2" className="mt-2 text-gray-600">
                      Loading received referrals...
                    </Typography>
                  </div>
                ) : receivedReferrals.length > 0 ? (
                  <div className="space-y-4">
                    {receivedReferrals.map((referral) => (
                      <div key={referral.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <Typography variant="h6" className="font-semibold text-gray-900">
                              From: {referral.doctorName}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                              {referral.email}
                            </Typography>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Chip 
                              label={`₹${referral.amount}`} 
                              color="info" 
                              size="small" 
                            />
                            <Chip 
                              label={referral.status} 
                              color={getStatusColor(referral.status) as any} 
                              size="small" 
                              variant="outlined"
                            />
                          </div>
                        </div>
                        {referral.notes && (
                          <Typography variant="body2" className="text-gray-700 mt-2">
                            {referral.notes}
                          </Typography>
                        )}
                        {referral.paymentDate && (
                          <Typography variant="caption" className="text-green-600 mt-1 block">
                            💰 Paid on: {new Date(referral.paymentDate).toLocaleDateString()}
                          </Typography>
                        )}
                        {referral.patientVisitedDate && !referral.paymentDate && (
                          <Typography variant="caption" className="text-blue-600 mt-1 block">
                            🏥 Patient visited on: {new Date(referral.patientVisitedDate).toLocaleDateString()}
                          </Typography>
                        )}
                        {referral.acceptedDate && !referral.patientVisitedDate && (
                          <Typography variant="caption" className="text-gray-500 mt-1 block">
                            📋 Received on: {new Date(referral.acceptedDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <Typography variant="h6" className="text-gray-500 mb-2">
                      No referrals received yet
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">
                      Connect with colleagues to start receiving referrals.
                    </Typography>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/my-connections"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
            >
              Manage Connections
            </Link>
            <Link
              href="/all-referrals"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-semibold"
            >
              View All Referrals
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;

export const revalidate = 20;