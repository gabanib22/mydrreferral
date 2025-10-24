import { useState, useEffect, useCallback } from 'react';
import { requestInstance } from '@/request';

interface ConnectionCounts {
  totalConnections: number;
  sentRequests: number;
  receivedRequests: number;
  blockedConnections: number;
  pendingApprovals: number;
}

export const useConnectionCounts = () => {
  const [counts, setCounts] = useState<ConnectionCounts>({
    totalConnections: 0,
    sentRequests: 0,
    receivedRequests: 0,
    blockedConnections: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all counts in parallel for better performance
      const [
        connectionsResponse,
        receivedResponse,
        blockedResponse,
        allConnectionsResponse
      ] = await Promise.all([
        requestInstance.getMyConnections(false), // Active connections
        requestInstance.getAllRecievedConnectionRequests(), // Received requests
        requestInstance.getMyConnections(true), // Blocked connections (isBlocked=true)
        requestInstance.getMyAllConnections() // All connections for sent requests
      ]);

      // Extract data from ResponseModel or direct response
      const connectionsData = connectionsResponse?.data || connectionsResponse || [];
      const receivedData = receivedResponse?.data || receivedResponse || [];
      const blockedData = blockedResponse?.data || blockedResponse || [];
      const allConnectionsData = allConnectionsResponse?.data || allConnectionsResponse || [];

      // For sent requests, we need to filter from all connections
      // This is a workaround since there's no direct "getAllSentConnectionRequests" method
      const sentData = allConnectionsData?.filter((conn: any) => 
        conn.status?.toLowerCase() === 'pending' && conn.sender_id
      ) || [];

      // Count pending approvals (received requests with pending status)
      const pendingApprovals = receivedData?.filter((req: any) => 
        req.status?.toLowerCase() === 'pending'
      )?.length || 0;

      console.log('Connection counts data:', {
        connectionsData: connectionsData?.length || 0,
        receivedData: receivedData?.length || 0,
        blockedData: blockedData?.length || 0,
        allConnectionsData: allConnectionsData?.length || 0,
        sentData: sentData?.length || 0,
        pendingApprovals
      });

      setCounts({
        totalConnections: connectionsData?.length || 0,
        sentRequests: sentData?.length || 0,
        receivedRequests: receivedData?.length || 0,
        blockedConnections: blockedData?.length || 0,
        pendingApprovals
      });

    } catch (err: any) {
      console.error('Error fetching connection counts:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load connection counts';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch counts on mount
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Listen for connection actions to refresh counts
  useEffect(() => {
    const handleConnectionAction = (event: CustomEvent) => {
      console.log('Connection action completed, refreshing counts:', event.detail);
      // Small delay to ensure API has processed the action
      setTimeout(() => {
        fetchCounts();
      }, 1000);
    };

    window.addEventListener('connectionActionCompleted', handleConnectionAction as EventListener);
    
    return () => {
      window.removeEventListener('connectionActionCompleted', handleConnectionAction as EventListener);
    };
  }, [fetchCounts]);

  return {
    counts,
    loading,
    error,
    refetch: fetchCounts
  };
};
