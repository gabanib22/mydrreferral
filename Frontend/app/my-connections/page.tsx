"use client";
import { requestInstance } from '@/request';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react'
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import ConReqSent from '../../components/connection-req-sent';
import ConReqReceived from '../../components/connection-req-received';
import { useAuth } from '../../hooks/useAuth';
import BlockedConnections from '../../components/blocked-connections';
import { useConnectionCounts } from '../../hooks/useConnectionCounts';
import Header from '../../components/Header';

const MyConnections = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, requireAuth } = useAuth();

  const [error, setError] = useState<string>("");
  const [myConData, setMyConData] = useState([]);
  const [activeButton, setActiveButton] = useState(0);
  
  // Get connection counts
  const { counts, loading: countsLoading, error: countsError } = useConnectionCounts();

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  // Handle URL parameters for tab switching
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      switch (tab) {
        case 'sent':
          setActiveButton(1);
          break;
        case 'received':
          setActiveButton(2);
          break;
        case 'blocked':
          setActiveButton(3);
          break;
        default:
          setActiveButton(0);
      }
    }
  }, [searchParams]);


  const columns: GridColDef[] = [
    { field: 'doctorName', headerName: 'Doctor Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'mobile', headerName: 'Mobile No', width: 130 },
    { field: 'totalEarning', headerName: 'Earning Amount', width: 100 },
    { field: 'totalPendings', headerName: 'Pending Amount', width: 100 }
  ]



  const fetchMyConnections = useCallback(async () => {
    console.log("Api MyConnections fetchMyConnections called....");
    try {
      setError('');

      //Get All Active (Unblocked Connection)
      const response = await requestInstance.getMyConnections(false);

      console.log("Recieved data from api : ", response)

      const resData = response?.data || response || [];
      if (resData.length > 0) {
        const conData = resData.map((val: any, index: number) => ({
          id: val.id || `conn-${index}`, // Ensure unique ID
          doctorName: val.doctor_name || 'Unknown Doctor',
          email: val.email || '',
          mobile: val.mobile || '',
          totalEarning: val.total_earning || 0,
          totalPendings: val.total_pendings || 0
        }));

        setMyConData(conData);
      } else {
        setMyConData([]);
      }
    } catch (error) {
      console.error("Error while bind my connection ddl : ", error);
      setError("Failed to load connections. Please try again.");
    }
  }, []);

  useEffect(() => {
    fetchMyConnections();
  }, [fetchMyConnections]);

  // Refresh data when switching back to My Connections tab
  useEffect(() => {
    if (activeButton === 0) {
      console.log("Switched to My Connections tab, refreshing data...");
      // Add a small delay to ensure smooth transition
      const timeoutId = setTimeout(() => {
        fetchMyConnections();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeButton, fetchMyConnections]);

  // Listen for connection actions to refresh My Connections data
  useEffect(() => {
    const handleConnectionAction = (event: CustomEvent) => {
      console.log('Connection action completed, refreshing My Connections data:', event.detail);
      // Small delay to ensure API has processed the action
      setTimeout(() => {
        fetchMyConnections();
      }, 1000);
    };

    window.addEventListener('connectionActionCompleted', handleConnectionAction as EventListener);
    
    return () => {
      window.removeEventListener('connectionActionCompleted', handleConnectionAction as EventListener);
    };
  }, [fetchMyConnections]);


  const renderComponent = (componentNumber: number) => {
    setActiveButton(componentNumber);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Connections</h1>
            <p className="text-gray-600">Manage your professional connections and referrals</p>
            
            {/* Show counts error if any */}
            {countsError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  ⚠️ Failed to load connection counts: {countsError}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => renderComponent(0)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeButton === 0
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>My Connections</span>
                    {!countsLoading && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeButton === 0 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {counts.totalConnections}
                      </span>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => renderComponent(1)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeButton === 1
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>Sent Requests</span>
                    {!countsLoading && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeButton === 1 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {counts.sentRequests}
                      </span>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => renderComponent(2)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeButton === 2
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1">
                      <span>Received Requests</span>
                      {/* Red dot indicator for pending requests */}
                      {!countsLoading && counts.pendingApprovals > 0 && (
                        <div className="relative group" title={`${counts.pendingApprovals} pending request${counts.pendingApprovals > 1 ? 's' : ''} need${counts.pendingApprovals > 1 ? '' : 's'} approval`}>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </span>
                    {!countsLoading && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeButton === 2 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {counts.receivedRequests}
                      </span>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => renderComponent(3)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeButton === 3
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>Blocked Connections</span>
                    {!countsLoading && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeButton === 3 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {counts.blockedConnections}
                      </span>
                    )}
                  </span>
                </button>
              </nav>
            </div>
            <div className="p-6">
              {activeButton === 0 && (
                <div>
                  {myConData.length > 0 ? (
                    <div style={{ height: 500, width: '100%' }}>
                      <DataGrid
                        rows={myConData}
                        columns={columns}
                        initialState={{
                          pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                          },
                        }}
                        pageSizeOptions={[5, 10, 25]}
                        checkboxSelection={false}
                        disableRowSelectionOnClick
                        sx={{
                          '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid #f0f0f0',
                          },
                          '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f8f9fa',
                            borderBottom: '2px solid #e0e0e0',
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">👥</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
                      <p className="text-gray-500">Start building your professional network by sending connection requests.</p>
                    </div>
                  )}
                </div>
              )}

              {activeButton === 1 && <ConReqSent />}
              {activeButton === 2 && <ConReqReceived />}
              {activeButton === 3 && <BlockedConnections />}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </>
  )
}

export default MyConnections;