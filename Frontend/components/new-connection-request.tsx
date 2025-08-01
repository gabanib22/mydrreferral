import { requestInstance } from '@/request';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { CircularProgress } from '@mui/material';

const newConnection = ({ close }) => {
  const router = useRouter();
  const initialForm = {
    receiverId: 0,
    notes:''
  };

  const [error, setError] = React.useState<string>("");
  const [formData, setFormData] = React.useState(initialForm);


  const options = ['Option 1', 'Option 2'];
  const [value, setValue] = React.useState<string | null>(options[0]);
  const [inputValue, setInputValue] = React.useState('');

  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState([{ id: 0, firstName: '', lastName: '', firmName: '',displayLabel:'' }]);
  const [loading, setLoading] = React.useState(false);


  const top100Films = [
    { id: 1, label: 'The Shawshank Redemption', year: 1994 },
    { id: 2, label: 'The Godfather', year: 1972 },
    { id: 3, label: 'The Godfather: Part II', year: 1974 },
    { id: 4, label: 'The Dark Knight', year: 2008 },
    { id: 5, label: '12 Angry Men', year: 1957 },
    { id: 6, label: "Schindler's List", year: 1993 },
    { id: 7, label: 'Pulp Fiction', year: 1994 }]

  //Get Dropdown Data

  const fetchDdlData = async (searchText: string) => {

    console.log("Fetch data calling.... : ", searchText);
    setLoading(true);

    try {
      setError('');

      const resData = await requestInstance.getDoctorDdlData(searchText);
      // if (data?.isSuccess) {
      // setFormData(initialForm);
      console.log("Recieved data from api : ", resData)

      if (resData.length > 0) {
        const ddlData = resData.map((val) => ({
          // console.log(val.id)
          // console.log(val.data.firstName)

          //it not affectted it only add last data to array
          // setData([...data, { id: val.id, firstName: val.data.firstName, lastName: val.data.lastName, firmName: val.data.firmName }])

          id: val.id,
          firstName: val.data.firstName,
          lastName: val.data.lastName,
          firmName: val.data.firmName,
          displayLabel:`${val.data.firstName} ${val.data.lastName} (${val.data.firmName})`
        }));

        if(ddlData.length>0){
          setData(ddlData);
        }else{
          //[{ id: 0, firstName: '', lastName: '', firmName: '',displayLabel:'' }]
          // setData([{...data,displayLabel:'No Data Available'}])
        }
      }

      // }
    } catch (error) {
      console.error("Error while bind ddl : ", error);
      // console.error("Error while bind ddl : ", error?.response?.data);
      // if (!error?.response?.data?.isSuccess && error?.response?.data?.message?.[0]?.includes('is already taken')) {
      //   setError(`It seems you already have an account, Please go to Login page by click on 'Login now' Button`);
      // }
    }
    finally {
      setLoading(false);
    }

  }




  // useEffect(() => {

  //   console.log("Api use effect called....");
  //   (async () => {
  //     try {
  //       setError('');

  //       const resData = await requestInstance.getDoctorDdlData('bulk');
  //       // if (data?.isSuccess) {
  //       // setFormData(initialForm);
  //       console.log("Recieved data from api : ", resData)

  //       if (resData.length > 0) {
  //         const ddlData = resData.map((val) => ({
  //           // console.log(val.id)
  //           // console.log(val.data.firstName)

  //           //it not affectted it only add last data to array
  //           // setData([...data, { id: val.id, firstName: val.data.firstName, lastName: val.data.lastName, firmName: val.data.firmName }])

  //           id: val.id,
  //           firstName: val.data.firstName,
  //           lastName: val.data.lastName,
  //           firmName: val.data.firmName
  //         }));


  //         setData(ddlData);
  //       }

  //       // }
  //     } catch (error) {
  //       console.error("Error while bind ddl : ", error);
  //       // console.error("Error while bind ddl : ", error?.response?.data);
  //       // if (!error?.response?.data?.isSuccess && error?.response?.data?.message?.[0]?.includes('is already taken')) {
  //       //   setError(`It seems you already have an account, Please go to Login page by click on 'Login now' Button`);
  //       // }
  //     }

  //   })();
  // }, [])

  console.log("Drop Down Data : ", data);

  const handleInputChange = async (event: React.ChangeEvent<{}>, value: any) => {

    console.log("Searched text term : ", value);
    // Call your .NET API here with the search text
    // const response = await fetch(`your-api-url?q=${value}`);
    // const data = await requestInstance.getDoctorDdlData('bulk');
    // const data = await response.json();
    // setData(data);
  };


  const handleOptionChange = (event: React.ChangeEvent<{}>, value: any) => {
    if (value != null && value.id >= 0) {
      // setSelectedId(value.id);


      setFormData({ ...formData, receiverId: value.id });
      console.log("Selected Option Value is : ", value.id)
    } else {
      // setSelectedId(null);
      console.log("Selected Option Value is null ")
    }
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
    if (formData.receiverId > 0) {


      try {
        setError('');
        const resData = await requestInstance.sendConnectionRequest(formData);
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


    } else {
      setError("Please select connection");
    }
  }



  return (
    <form className='mx-2 flex gap-5 border-none flex-col items-center justify-center border max-w-[600px] m-auto p-5 rounded-lg bg-[var(--light-blue)] w-full'>
      <h1 className='text-4xl text-center p-[2rem] text-white font-bold'>New Connection Request</h1>

      <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
        {/* <select className='text-black px-3 py-2 rounded-lg w-full' name="userType" id="userType" onChange={handleChangeInput} value={formData.userType}> */}
        {/* <select className='text-black px-3 py-2 rounded-lg w-full' name="userType" id="userType">
          <option value="-1">Select User Type</option>
          <option value="0">Doctor</option>
          <option value="1">Laboratory</option>
          <option value="2">Agent</option>
          <option value="3">Medical</option>
          <option value="4">Admin</option>
        </select> */}

        {/* <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={top100Films}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Movie" />}
        /> */}

        {/* <Autocomplete
          disablePortal
          id="combo-box-demo2"
          options={top100Films}
          getOptionLabel={(opt) => `${opt.label} ( ${opt.year} )`}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Search by name or clinic name" />}
          // onChange={handleOptionChange}
          onInputChange={handleInputChange}
          onChange={handleOptionChange}
        /> */}

        {/* <Autocomplete
        disablePortal
        id="combo-box-demo2"
        options={data}
        getOptionLabel={(opt) => `${opt.firstName} ${opt.lastName} ( ${opt.firmName} )`}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Search by name or clinic name" />}
        // onChange={handleOptionChange}
        onInputChange={handleInputChange}
        onChange={handleOptionChange}
      /> */}

        <Autocomplete
          disablePortal
          id="combo-box-demo2"
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          options={data}
          // getOptionLabel={(opt) => `${opt.firstName} ${opt.lastName} (${opt.firmName})`}
          getOptionLabel={(opt) => opt.displayLabel}
          sx={{ width: 300 }}
          // renderInput={(params) => <TextField {...params} label="Search by name or clinic name" />}
          onInputChange={(event, newInputValue) => {
            fetchDdlData(newInputValue);
          }}
          onChange={handleOptionChange}

          renderInput={(params) => (
            <TextField
              {...params}
              label="Search"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />





        {/* <Autocomplete
          value={value}
          onChange={(event: any, newValue: string | null) => {
            setValue(newValue);
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          id="controllable-states-demo"
          options={options}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Controllable" />}
        /> */}
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

export default newConnection;