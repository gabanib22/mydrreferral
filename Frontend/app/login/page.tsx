"use client";
import { emailRegex, passwordRegex } from '@/lib/regex';
import { requestInstance } from '@/request';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const Login = () => {
  const router = useRouter();
  const initialForm = {
    userName: '',
    password: '',
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
    if (!formData.userName || !formData.password) {
      setError('Please fill all the fields');
    } else if (!emailRegex.test(formData.userName)) {
      setError('Email is not valid');
    } else if (!passwordRegex.test(formData.password)) {
      setError('Password must have at least 6 characters, one non-alphanumeric character and one digit');
    } else {
      try {
        setError('');
        const data = await requestInstance.login(formData);
        if (data) {
          setFormData(initialForm);
          window.localStorage.setItem("accessToken", data?.accessToken);
          router.push('/');
        }
      } catch (error) {
        console.error("Error: ", error?.response?.data);
        if (!error?.response?.data?.isSuccess) {
          setError(error?.response?.data?.message?.[0]);
        }
      }
    }
  }
  return (
    <main className='flex items-center justify-center h-[100vh]'>
      <form className='mx-2 border-none flex gap-5 flex-col items-center justify-center border max-w-[500px] m-auto p-5 rounded-lg bg-[var(--light-blue)] w-full'>
        <h1 className='text-4xl text-center p-[2rem] text-white font-bold'>Login Now</h1>
        <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
          <input className='text-black px-3 py-2 rounded-lg w-full' type="email" onChange={handleChangeInput} value={formData.userName} name="userName" placeholder='Email ID' id="email" />
        </div>
        <div className="form-group flex gap-2 justify-between items-center w-full max-w-[80%]">
          <input className='text-black px-3 py-2 rounded-lg w-full' type="password" onChange={handleChangeInput} value={formData.password} name="password" placeholder='Password' id="password" />
        </div>
        <span className='text-white text-left'>Forgot Password?</span>
        {error && <p className='text-red-500 text-xl font-bold text-center'>{error}</p>}
        <button className="btn bg-[var(--dark-blue)] text-xl uppercase text-white p-2 rounded px-9" onClick={handleSubmitForm}>Login</button>
        <span className='text-white text-left'>Not a member? <Link className='font-bold' href={'/register'}>Signup now</Link></span>
      </form>
    </main>
  )
}

export default Login;