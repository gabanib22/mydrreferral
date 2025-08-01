"use client";
import { emailRegex, passwordRegex } from '@/lib/regex';
import { requestInstance } from '@/request';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const Register = () => {
  const router = useRouter();
  const initialForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    userType: -1
  };
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState(initialForm);

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (error) setError("");
    setFormData(prevForm => ({
      ...prevForm,
      [e.target.name]: e.target.value
    }));
  }

  const handleSubmitForm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phoneNumber || formData.userType === -1) {
      setError('Please fill all the fields');
    } else if (!emailRegex.test(formData.email)) {
      setError('Email is not valid');
    } else if (!passwordRegex.test(formData.password)) {
      setError('Password must have at least 6 characters, one non-alphanumeric character and one digit');
    } else if (formData.password !== formData.confirmPassword) {
      setError('Please match your password and confirm password fields');
    } else if (formData.phoneNumber.length !== 10) {
      setError('Phone number must have 10 digits');
    } else {
      try {
        setError('');
        const {confirmPassword, ...registerPayload} = formData;
        const data = await requestInstance.register(registerPayload);
        if (data?.isSuccess) {
          setFormData(initialForm);
          router.push('/login');
        }
      } catch (error) {
        console.error("Error: ", error?.response?.data);
        if (!error?.response?.data?.isSuccess && error?.response?.data?.message?.[0]?.includes('is already taken')) {
          setError(`It seems you already have an account, Please go to Login page by click on 'Login now' Button`);
        }
      }
    }
  }

  return (
    <main className='flex items-center justify-center h-[100vh]'>
      <form className='mx-2 flex gap-5 border-none flex-col items-center justify-center border max-w-[600px] m-auto p-5 rounded-lg bg-[var(--light-blue)] w-full'>
        <h1 className='text-4xl text-center p-[2rem] text-white font-bold'>Register Now</h1>
        <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
          <input className='text-black px-3 py-2 rounded-lg w-full' type="texr" onChange={handleChangeInput} value={formData.firstName} name="firstName" placeholder='First Name' />
        </div>
        <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
          <input className='text-black px-3 py-2 rounded-lg w-full' type="text" onChange={handleChangeInput} value={formData.lastName} name="lastName" placeholder='Last Name' />
        </div>
        <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
          <input className='text-black px-3 py-2 rounded-lg w-full' type="email" onChange={handleChangeInput} value={formData.email} name="email" placeholder='Email ID' />
        </div>
        <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
          <input className='text-black px-3 py-2 rounded-lg w-full' type="number" onChange={handleChangeInput} value={formData.phoneNumber} name="phoneNumber" placeholder='Phone no' />
        </div>
        <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
          <input className='text-black px-3 py-2 rounded-lg w-full' type="password" onChange={handleChangeInput} value={formData.password} name="password" placeholder='Password' />
        </div>
        <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
          <input className='text-black px-3 py-2 rounded-lg w-full' type="password" onChange={handleChangeInput} value={formData.confirmPassword} name="confirmPassword" placeholder='Retype your Password for Confirmation' />
        </div>
        <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
          <select className='text-black px-3 py-2 rounded-lg w-full' name="userType" id="userType" onChange={handleChangeInput} value={formData.userType}>
            <option value="-1">Select User Type</option>
            <option value="0">Doctor</option>
            <option value="1">Laboratory</option>
            <option value="2">Agent</option>
            <option value="3">Medical</option>
            <option value="4">Admin</option>
          </select>
        </div>
        {error && <p className='text-red-500 text-xl font-bold text-center'>{error}</p>}
        <button className="btn bg-[var(--dark-blue)] tracking-wider text-xl uppercase text-white p-2 rounded px-9" onClick={handleSubmitForm}>Register</button>
        <span className='text-white text-left'>Already a member? <Link className='font-bold' href={'/login'}>Login now</Link></span>
      </form>
    </main>
  )
}

export default Register;