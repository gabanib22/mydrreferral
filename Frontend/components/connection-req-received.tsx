import { requestInstance } from '@/request';
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

const ConReqReceived = () => {


    const [myConData, setMyConData] = useState([]);

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

        console.log("Api ConReqReceived use effect called....");
        (async () => {
            try {

                //Get All Active (Unblocked Connection)
                const resData = await requestInstance.getAllRecievedConnectionRequests();

                // if (data?.isSuccess) {
                // setFormData(initialForm);
                console.log("Recieved data from api : ", resData)

                if (resData.length > 0) {
                    const conData = resData.map((val) => ({
                        id: val.connectioionId,
                        doctorName: val.doctorName,
                        requestDate: formatDate(val.requestDate),
                        status: val.status
                    }));

                    setMyConData(conData);
                }

                // }
            } catch (error) {
                console.error("Error while bind my connection ddl : ", error);
            }

        })();
    }, [])

    const handleAction = async (connectionId: number, isApprove: boolean) => {
        console.log("This is handleAction and data get in parameter", connectionId, isApprove);


        try {
            const resData = await requestInstance.sendconnectionResponse({ connectionId: connectionId, isAccepted: isApprove });
            if (resData?.isSuccess) {
                console.log("Recieved data from api : ", resData.message[0]);
                close();
            }
        } catch (error) {
            console.error("Error while send data : ", error);
        }

    }

    const columns: GridColDef[] = [
        { field: 'doctorName', headerName: 'Doctor Name', width: 400 },
        { field: 'requestDate', headerName: 'Request Date', width: 300 },
        { field: 'status', headerName: 'Status', width: 200 },
        {
            field: 'action', headerName: 'Action', width: 200,
            sortable: false,
            renderCell: (params) => (
                <strong>
                    {params.row.status!=="Blocked"?(<>

                        <button onClick={() => handleAction(params.row.id, true)} style={{ backgroundColor: 'green' }}>
                        Approve
                    </button>&nbsp; |
                    <button onClick={() => handleAction(params.row.id, false)} style={{ backgroundColor: 'red' }}>
                        Reject
                    </button></>):"-"
                    }
                </strong>
            )
        }
    ]

    return (<>
        <div>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={myConData}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                        },
                    }}
                    pageSizeOptions={[5, 10]}
                // checkboxSelection
                />
            </div>
        </div>

    </>)
}

export default ConReqReceived;