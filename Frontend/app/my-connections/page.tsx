"use client";
import { requestInstance } from '@/request';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react'
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import ConReqSent from '../../components/connection-req-sent';
import ConReqReceived from '../../components/connection-req-received';
import BlockedConnections from '../../components/blocked-connections';

const MyConnections = () => {
  const router = useRouter();

  const [error, setError] = useState<string>("");
  const [myConData, setMyConData] = useState([]);
  const [activeButton, setActiveButton] = useState(0);


  const columns: GridColDef[] = [
    { field: 'doctorName', headerName: 'Doctor Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'mobile', headerName: 'Mobile No', width: 130 },
    { field: 'totalEarning', headerName: 'Earning Amount', width: 100 },
    { field: 'totalPendings', headerName: 'Pending Amount', width: 100 }
  ]



  useEffect(() => {

    console.log("Api MyConnections use effect called....");
    (async () => {
      try {
        setError('');

        //Get All Active (Unblocked Connection)
        const resData = await requestInstance.getMyConnections(false);

        // if (data?.isSuccess) {
        // setFormData(initialForm);
        console.log("Recieved data from api : ", resData)

        if (resData.length > 0) {
          const conData = resData.map((val) => ({
            id: val.connectioionId,
            doctorName: val.doctorName,
            email: val.email,
            mobile: val.mobile,
            totalEarning: val.totalEarning,
            totalPendings: val.totalPendings
          }));

          setMyConData(conData);
        }

        // }
      } catch (error) {
        console.error("Error while bind my connection ddl : ", error);
      }

    })();
  }, [])


  const renderComponent = (componentNumber: number) => {
    setActiveButton(componentNumber);
  };



  return (
    <>
      <h1>My Connections</h1>
      <div>
        <div>
          <button onClick={() => renderComponent(0)}> My Connection</button>&nbsp;
          <button onClick={() => renderComponent(1)}>Connection Request Sent</button>&nbsp;
          <button onClick={() => renderComponent(2)}>Connection Request Recieved</button>&nbsp;
          <button onClick={() => renderComponent(3)}>Blocked Connection List</button>
        </div>
        {activeButton === 0&&<div>
          {/* <table>
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Email</th>
                <th>Mobile No</th>
                <th>Earning Amount</th>
                <th>Pending Amount</th>
              </tr>
            </thead>
            <tbody>
              {
                myConData.map((val, i) => {
                  return (<><tr key={i}>
                    <td>{val.doctorName}</td>
                    <td>{val.email}</td>
                    <td>{val.mobile}</td>
                    <td>{val.totalEarning}</td>
                    <td>{val.totalPendings}</td>
                  </tr></>)
                })
              }
            </tbody>
          </table> */}

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
        </div>}

        <div>
          {activeButton === 1 && <ConReqSent />}
          {activeButton === 2 && <ConReqReceived />}
          {activeButton === 3 && <BlockedConnections />}
        </div>

        {error && <p className='text-red-500 text-xl font-bold text-center'>{error}</p>}
      </div>
    </>
  )
}

export default MyConnections;