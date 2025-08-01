import { requestInstance } from '@/request';
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';


const BlockedConnections = () => {

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

        console.log("Api BlockedConnections use effect called....");
        (async () => {
            try {

                //Get All Active (Unblocked Connection)
                const resData = await requestInstance.getRecievedConnectionRequests(true);

                // if (data?.isSuccess) {
                // setFormData(initialForm);
                console.log("Recieved data from api : ", resData)

                if (resData.length > 0) {
                    const conData = resData.map((val) => ({
                        id: val.connectioionId,
                        doctorName: val.doctorName,
                        blockedDate: formatDate(val.lastUpdateDate)
                    }));

                    setMyConData(conData);
                }

                // }
            } catch (error) {
                console.error("Error while bind my connection ddl : ", error);
            }

        })();
    }, [])

    const handleAction = async (connectionId: number) => {
        console.log("This is handleAction and data get in parameter", connectionId);


        try {
            const resData = await requestInstance.sendunblockConnectionRequest(connectionId);
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
        { field: 'blockedDate', headerName: 'Request Date', width: 300 },
        {
            field: 'action', headerName: 'Action', width: 200,
            sortable: false,
            renderCell: (params) => (
                <strong>
                    <button onClick={() => handleAction(params.row.id)} style={{ backgroundColor: 'yellow' }}>
                        Unblock
                    </button>
                </strong>
            )
        }
    ]




    return (<>
        <h1>This is blocked-connections</h1>

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

    </>)
}

export default BlockedConnections;