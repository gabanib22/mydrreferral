import { requestInstance } from '@/request';
import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Box, Typography, Chip, CircularProgress, Button } from '@mui/material';

const ConReqReceived = () => {
    const [myConData, setMyConData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const columns: GridColDef[] = [
        { 
            field: 'doctorName', 
            headerName: 'Doctor Name', 
            width: 250,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body1" fontWeight="medium">
                        {params.value}
                    </Typography>
                </Box>
            )
        },
        { 
            field: 'requestDate', 
            headerName: 'Request Date', 
            width: 180,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                    {params.value}
                </Typography>
            )
        },
        { 
            field: 'status', 
            headerName: 'Status', 
            width: 120,
            renderCell: (params) => {
                const getStatusColor = (status: string) => {
                    switch (status?.toLowerCase()) {
                        case 'pending': return 'warning';
                        case 'accepted': return 'success';
                        case 'rejected': return 'error';
                        default: return 'default';
                    }
                };
                return (
                    <Chip 
                        label={params.value} 
                        color={getStatusColor(params.value)}
                        size="small"
                        variant="outlined"
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            sortable: false,
            renderCell: (params) => {
                if (params.row.status === 'Pending') {
                    return (
                        <Box display="flex" gap={1}>
                            <Button
                                size="small"
                                variant="contained"
                                color="success"
                                disabled={loading}
                                onClick={() => handleAccept(params.row.id)}
                            >
                                {loading ? <CircularProgress size={16} /> : 'Accept'}
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={loading}
                                onClick={() => handleReject(params.row.id)}
                            >
                                {loading ? <CircularProgress size={16} /> : 'Reject'}
                            </Button>
                        </Box>
                    );
                }
                return null;
            }
        }
    ];

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        // Adding leading zeros if necessary
        const formattedDay = day < 10 ? `0${day}` : day;
        const formattedMonth = month < 10 ? `0${month}` : month;

        return `${formattedDay}-${formattedMonth}-${year}`;
    }

    const handleAccept = async (requestId: number) => {
        try {
            setLoading(true);
            console.log("Sending accept request for connection ID:", requestId);
            const response = await requestInstance.sendconnectionResponse({
                connection_id: requestId,
                is_accepted: true
            });
            console.log("Accept response:", response);
            console.log("Response type:", typeof response);
            console.log("Response keys:", Object.keys(response || {}));
            console.log("is_success value:", response?.is_success);
            console.log("IsSuccess value:", response?.IsSuccess);
            
            // Check for success indicators in various formats
            const isSuccess = response?.is_success || response?.IsSuccess || 
                             response?.success || response?.Success ||
                             (response?.status === 200) || 
                             (response?.statusCode === 200) ||
                             (response && !response?.error && !response?.Error);
            
            console.log("Final success check:", isSuccess);
            
            if (isSuccess) {
                console.log("Accept successful, refreshing data...");
                // Small delay to ensure API has processed the request
                await new Promise(resolve => setTimeout(resolve, 500));
                // Refresh the data
                await fetchData();
                console.log("Data refreshed successfully");
                // Show success message
                setError(""); // Clear any previous errors
                // Notify other components to refresh their data
                window.dispatchEvent(new CustomEvent('connectionActionCompleted', { 
                    detail: { action: 'accept', connectionId: requestId } 
                }));
            } else {
                console.error("Accept failed:", response);
                setError("Failed to accept request. Please try again.");
            }
        } catch (error) {
            console.error("Error accepting request:", error);
            setError("Failed to accept request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            setLoading(true);
            console.log("Sending reject request for connection ID:", requestId);
            const response = await requestInstance.sendconnectionResponse({
                connection_id: requestId,
                is_accepted: false
            });
            console.log("Reject response:", response);
            console.log("Response type:", typeof response);
            console.log("Response keys:", Object.keys(response || {}));
            console.log("is_success value:", response?.is_success);
            console.log("IsSuccess value:", response?.IsSuccess);
            
            // Check for success indicators in various formats
            const isSuccess = response?.is_success || response?.IsSuccess || 
                             response?.success || response?.Success ||
                             (response?.status === 200) || 
                             (response?.statusCode === 200) ||
                             (response && !response?.error && !response?.Error);
            
            console.log("Final success check:", isSuccess);
            
            if (isSuccess) {
                console.log("Reject successful, refreshing data...");
                // Small delay to ensure API has processed the request
                await new Promise(resolve => setTimeout(resolve, 500));
                // Refresh the data
                await fetchData();
                console.log("Data refreshed successfully");
                // Show success message
                setError(""); // Clear any previous errors
                // Notify other components to refresh their data
                window.dispatchEvent(new CustomEvent('connectionActionCompleted', { 
                    detail: { action: 'reject', connectionId: requestId } 
                }));
            } else {
                console.error("Reject failed:", response);
                setError("Failed to reject request. Please try again.");
            }
        } catch (error) {
            console.error("Error rejecting request:", error);
            setError("Failed to reject request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchData = useCallback(async () => {
        try {
            setError('');
            const resData = await requestInstance.getAllRecievedConnectionRequests();
            console.log("Received data from api : ", resData);

            if (resData && resData.length > 0) {
                const conData = resData.map((val: any, index: number) => ({
                    id: val.connection_request_id || val.connectioion_id || val.id || `rec-${index}`,
                    doctorName: val.doctor_name || val.doctorName || 'Unknown Doctor',
                    requestDate: formatDate(val.request_date || val.requestDate),
                    status: val.status || 'Unknown'
                }));

                setMyConData(conData);
            } else {
                setMyConData([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to load received requests. Please try again.");
        }
    }, []);

    useEffect(() => {
        console.log("Api ConReqReceived use effect called....");
        fetchData();
    }, [fetchData]);

    if (loading && myConData.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                <CircularProgress />
                <Typography ml={2}>Loading received requests...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box textAlign="center" py={4}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
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
                    <div className="text-gray-400 text-6xl mb-4">📥</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No received requests yet</h3>
                    <p className="text-gray-500">You haven't received any connection requests. Other doctors will see your profile and send requests.</p>
                </div>
            )}
        </div>
    );
};

export default ConReqReceived;