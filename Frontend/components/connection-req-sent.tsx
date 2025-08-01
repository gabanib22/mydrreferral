import { requestInstance } from '@/request';
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

const ConReqSent = () => {


    const [myConData, setMyConData] = useState([]);
    const columns: GridColDef[] = [
        { field: 'doctorName', headerName: 'Doctor Name', width: 400 },
        { field: 'requestDate', headerName: 'Request Date', width: 300 },
        { field: 'status', headerName: 'Status', width: 200 }
    ]

    function formatDate(dateString:string) {
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

                //Get All Active (Unblocked Connection)
                const resData = await requestInstance.getMyAllConnections();

                // if (data?.isSuccess) {
                // setFormData(initialForm);
                console.log("Recieved data from api : ", resData)

                if (resData.length > 0) {
                    const conData = resData.map((val) => ({
                        id: val.connectioionId,
                        doctorName: val.doctorName,
                        // requestDate: val.requestDate,
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

    return (<>
        <h1>This is ConReqSent</h1>

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

export default ConReqSent;