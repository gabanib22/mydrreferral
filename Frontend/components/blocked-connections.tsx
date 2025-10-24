import { requestInstance } from '@/request';
import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Box, Typography, Chip, CircularProgress, Button } from '@mui/material';

const BlockedConnections = () => {
    const [myConData, setMyConData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const columns: GridColDef[] = [
        { 
            field: 'doctorName', 
            headerName: 'Doctor Name', 
            width: 300,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body1" fontWeight="medium">
                        {params.value}
                    </Typography>
                </Box>
            )
        },
        { 
            field: 'email', 
            headerName: 'Email', 
            width: 250,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                    {params.value}
                </Typography>
            )
        },
        { 
            field: 'blockedDate', 
            headerName: 'Blocked Date', 
            width: 180,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => handleUnblock(params.row.id)}
                >
                    Unblock
                </Button>
            )
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

    const handleUnblock = async (connectionId: number) => {
        try {
            setLoading(true);
            const response = await requestInstance.sendunblockConnectionRequest(connectionId);
            if (response?.is_success) {
                // Refresh the data
                await fetchData();
            }
        } catch (error) {
            console.error("Error unblocking connection:", error);
            setError("Failed to unblock connection. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchData = useCallback(async () => {
        try {
            setError('');
            const resData = await requestInstance.getMyConnections(true); // true for blocked connections
            console.log("Received data from api : ", resData);

            if (resData && resData.length > 0) {
                const conData = resData.map((val: any, index: number) => ({
                    id: val.connectioion_id || val.id || `block-${index}`,
                    doctorName: val.doctor_name || val.doctorName || 'Unknown Doctor',
                    email: val.email || '',
                    blockedDate: formatDate(val.blocked_date || val.created_on || val.blockedDate)
                }));

                setMyConData(conData);
            } else {
                setMyConData([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to load blocked connections. Please try again.");
        }
    }, []);

    useEffect(() => {
        console.log("Api BlockedConnections use effect called....");
        fetchData();
    }, [fetchData]);

    if (loading && myConData.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                <CircularProgress />
                <Typography ml={2}>Loading blocked connections...</Typography>
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
                    <div className="text-gray-400 text-6xl mb-4">🚫</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No blocked connections</h3>
                    <p className="text-gray-500">You haven't blocked any connections. All your connections are active.</p>
                </div>
            )}
        </div>
    );
};

export default BlockedConnections;