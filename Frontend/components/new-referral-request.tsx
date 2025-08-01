import { requestInstance } from '@/request';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { CircularProgress } from '@mui/material';

const NewReferral = ({ close }) => {
  const initialForm = {
    connectioionId: 0,
    patientName: '',
    notes: '',
    rflAmount: 0,
  };

  const [error, setError] = React.useState<string>("");
  const [ddlData, setddlData] = React.useState([]);
  const [formData, setFormData] = React.useState(initialForm);



  useEffect(() => {

    console.log("Api NewReferral use effect called....");
    (async () => {
      try {
        setError('');

        //Get All Active (Unblocked Connection)
        const resData = await requestInstance.getMyConnections(false);

        // if (data?.isSuccess) {
        // setFormData(initialForm);
        console.log("Recieved data from api : ", resData)

        if (resData.length > 0) {
          const ddlData = resData.map((val) => ({
            id: val.connectioionId,
            doctorName: val.doctorName,
            email: val.email,
          }));


          setddlData(ddlData);
        }

        // }
      } catch (error) {
        console.error("Error while bind my connection ddl : ", error);
      }

    })();
  }, [])



  const handleOptionChange = (event: React.ChangeEvent<{}>, value: any) => {
    // if (value != null && value.id >= 0) {
    // setSelectedId(value.id);

    setFormData(prevForm => ({
      ...prevForm,
      connectioionId: value.id
    }));
    //   setFormData({ ...formData, receiverId: value.id });
    console.log("Selected Option Value is : ", value.id)
    // } else {
    //   // setSelectedId(null);
    //   console.log("Selected Option Value is null ")
    // }
  };

  const closeDialog = () => {
    close();
  }

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    console.log("handleChangeInput", e.target.value);
    if (error) setError("");
    setFormData(prevForm => ({
      ...prevForm,
      [e.target.name]: e.target.value
    }));
  }


  const handleSubmitForm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log(formData);
    if (!formData.patientName || !formData.rflAmount || !formData.connectioionId) {
      setError('Please fill all the fields');
    } else {


      try {
        setError('');
        const resData = await requestInstance.sendRefferRequest(formData);
        if (resData?.isSuccess) {
          console.log("Recieved data from api : ", resData.message[0]);
          setFormData(initialForm);
          close();
        }
      } catch (error) {
        console.error("Error while send data : ", error);
        // console.error("Error while bind ddl : ", error?.response?.data);
        // if (!error?.response?.data?.isSuccess && error?.response?.data?.message?.[0]?.includes('is already taken')) {
        //   setError(`It seems you already have an account, Please go to Login page by click on 'Login now' Button`);
        // }
      }
      finally {
        // setLoading(false);
      }
    }
  }


  return (
    <form className='mx-2 flex gap-5 border-none flex-col items-center justify-center border max-w-[600px] m-auto p-5 rounded-lg bg-[var(--light-blue)] w-full'>
      {/* <h1 className='text-4xl text-center p-[2rem] text-white font-bold'>Sent New Refferal Request</h1> */}

      <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
        <Autocomplete
          disablePortal
          id="combo-box-demo2"
          options={ddlData}
          getOptionLabel={(opt) => `${opt.doctorName} (${opt.email})`}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Search by name or clinic name" />}
          onChange={handleOptionChange}
        // onChange={()=>handleChangeInput}
        />
      </div>
      <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
        <input className='text-black px-3 py-2 rounded-lg w-full' type="text" onChange={handleChangeInput} value={formData.patientName} name="patientName" placeholder='Patient Name' id="patientName" />
      </div>
      <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
        <input className='text-black px-3 py-2 rounded-lg w-full' type="text" onChange={handleChangeInput} value={formData.rflAmount} name="rflAmount" placeholder='Referral Amount' id="rflAmount" />
      </div>
      <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
        <input className='text-black px-3 py-2 rounded-lg w-full' type="text" onChange={handleChangeInput} value={formData.notes} name="notes" placeholder='Notes' id="notes" />
      </div>
      {error && <p className='text-red-500 text-xl font-bold text-center'>{error}</p>}
      <div>
        <button className="btn bg-[var(--dark-blue)] tracking-wider text-xl uppercase text-white p-2 rounded px-9" onClick={handleSubmitForm}>Send Request</button>
        <button className="btn bg-white tracking-wider text-xl uppercase text-[var(--dark-blue)]  p-2 rounded px-9" onClick={closeDialog}>Cancel</button>
      </div>
    </form>
  )

}

export default NewReferral;