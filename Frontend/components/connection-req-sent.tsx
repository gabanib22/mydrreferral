import { requestInstance } from '@/request';
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';

const ConReqSent = () => {
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
            field: 'requestDate', 
            headerName: 'Request Date', 
            width: 200,
            renderCell: (params) => (
                <Typography variant="body2" color="text.secondary">
                    {params.value}
                </Typography>
            )
        },
        { 
            field: 'status', 
            headerName: 'Status', 
            width: 150,
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

    useEffect(() => {
        console.log("Api ConReqSent use effect called....");
        (async () => {
            try {
                setLoading(true);
                setError('');

                const resData = await requestInstance.getMyAllConnections();
                console.log("Received data from api : ", resData);

                if (resData && resData.length > 0) {
                    console.log("Raw API response:", resData);
                    const conData = resData.map((val: any, index: number) => {
                        console.log("Mapping item:", val, "Index:", index);
                        return {
                            id: val.connectioion_id || val.connection_request_id || val.id || `req-${index}`, // Ensure unique ID
                            doctorName: val.doctor_name || val.doctorName || 'Unknown Doctor',
                            requestDate: formatDate(val.request_date || val.requestDate),
                            status: val.status || 'Unknown'
                        };
                    });
                    console.log("Mapped data:", conData);

                    setMyConData(conData);
                } else {
                    setMyConData([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load sent requests. Please try again.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height={400}>
                <CircularProgress />
                <Typography ml={2}>Loading sent requests...</Typography>
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
                    <div className="text-gray-400 text-6xl mb-4">📤</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sent requests yet</h3>
                    <p className="text-gray-500">You haven&apos;t sent any connection requests. Start connecting with other doctors.</p>
                </div>
            )}
        </div>
    );
};

export default ConReqSent;