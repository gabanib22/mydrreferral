"use client";
import React, { useState } from 'react'
import SettingsIcon from '@mui/icons-material/Settings';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { DatePicker, Upload, UploadFile } from 'antd';

const CommonList = [
  {
    icon: SettingsIcon,
    slug: 'security-and-privacy',
    label: "Security and Privacy"
  },
  {
    icon: SettingsIcon,
    slug: 'subscription-plans-and-addons',
    label: "Subscription Plans and Add-ons"
  },
  {
    icon: SettingsIcon,
    slug: 'help',
    label: "Help"
  },
];

const DoctorList = [
  {
    icon: SettingsIcon,
    slug: 'personal-info',
    label: "Personal Info"
  },
  {
    icon: SettingsIcon,
    slug: 'clinical-info',
    label: "Clinical Info"
  },
];

const MedicalList = [
  {
    icon: SettingsIcon,
    slug: 'medical-info',
    label: "Medical Info"
  },
];

const LaboratoryList = [
  {
    icon: SettingsIcon,
    slug: 'laboratory-info',
    label: "Laboratory Info"
  },
];

const fileList: UploadFile[] = [
  {
    uid: '0',
    name: 'xxx.png',
    status: 'uploading',
    percent: 33,
  },
  {
    uid: '-1',
    name: 'yyy.png',
    status: 'done',
    url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    thumbUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  },
  {
    uid: '-2',
    name: 'zzz.png',
    status: 'error',
  },
];

const renderContent = (role: string) => {
  switch (role) {
    case 'personal-info':
      return (
        <>
          <h2 className='text-3xl font-bold mb-5'>Personal Info</h2>
          <span className="bg-green-500 px-4 py-2 text-white rounded-3xl inline-block mb-3">Approved</span>
          <div className="flex flex-wrap gap-y-3">
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="firstName">First Name</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="firstName" placeholder='First Name' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="lastName">Last Name</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="lastName" placeholder='Last Name' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="email">Email</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="email" name="email" placeholder='Email' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="contact">Contact Number</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="contact" placeholder='Contact Number' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="flat">Flat / House no. / Society Name</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="flat" placeholder='Flat no.' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="road">Road / Street Name</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="road" placeholder='Road / Street Name' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="pincode">Pin Code</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="pincode" placeholder='Pincode' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="city">City</label>
              <select className='text-black px-3 py-2 rounded-lg border' name="city" id="">
                <option value="-1">Select</option>
                <option value="surat">Surat</option>
              </select>
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="state">State</label>
              <select className='text-black px-3 py-2 rounded-lg border' name="state" id="">
                <option value="-1">Select</option>
                <option value="gujarat">Gujarat</option>
              </select>
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="country">Country</label>
              <select className='text-black px-3 py-2 rounded-lg border' name="country" id="">
                <option value="-1">Select</option>
                <option value="india">India</option>
              </select>
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="dob">Date of Birth</label>
              <DatePicker className='py-2 px-3' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="dop">Date of Paction</label>
              <DatePicker className='py-2 px-3' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="dop">Upload files</label>
              <Upload
                className='w-full'
                action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                listType="picture"
                defaultFileList={[...fileList]}
              >
                <div className="flex gap-2 flex-col items-center border py-3 px-10 rounded-lg ">
                  <UploadFileIcon className='text-5xl' />
                  <button >Click to Upload</button>
                </div>
              </Upload>
            </div>
            <div className="flex px-2 gap-3 mt-3 w-full justify-center">
              <button className='border px-5 py-2 rounded text-lg font-bold'>Cancel</button>
              <button className='border px-5 py-2 rounded text-lg font-bold bg-blue-500 text-white'>Save</button>
            </div>
          </div>
        </>
      )

    case 'clinical-info':
      return (
        <>
          <h2 className='text-3xl font-bold mb-5'>Clinical Info</h2>
          <span className="bg-green-500 px-4 py-2 text-white rounded-3xl inline-block mb-3">Approved</span>
          <div className="flex flex-wrap gap-y-3">
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="clinicName">Clinic Name</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="clinicName" placeholder='Clinic Name' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="email">Reception Email</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="email" name="email" placeholder='Email' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="contact">Reception Contact Number</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="contact" placeholder='Contact Number' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="dob">Date of Establishment</label>
              <DatePicker className='py-2 px-3' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="flat">Flat / House no. / Society Name</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="flat" placeholder='Flat no.' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="road">Road / Street Name</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="road" placeholder='Road / Street Name' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="pincode">Pin Code</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="pincode" placeholder='Pincode' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="city">City</label>
              <select className='text-black px-3 py-2 rounded-lg border' name="city" id="">
                <option value="-1">Select</option>
                <option value="surat">Surat</option>
              </select>
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="state">State</label>
              <select className='text-black px-3 py-2 rounded-lg border' name="state" id="">
                <option value="-1">Select</option>
                <option value="gujarat">Gujarat</option>
              </select>
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="country">Country</label>
              <select className='text-black px-3 py-2 rounded-lg border' name="country" id="">
                <option value="-1">Select</option>
                <option value="india">India</option>
              </select>
            </div>
            <div className="flex px-2 gap-3 mt-3 w-full justify-center">
              <button className='border px-5 py-2 rounded text-lg font-bold'>Cancel</button>
              <button className='border px-5 py-2 rounded text-lg font-bold bg-blue-500 text-white'>Save</button>
            </div>
          </div>
        </>
      )

    case 'medical-info':
      return (
        <>
          <h2 className='text-3xl font-bold mb-5'>Medical Info</h2>
          <span className="bg-green-500 px-4 py-2 text-white rounded-3xl inline-block mb-3">Approved</span>
          <div className="flex flex-wrap gap-y-3">
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="medicalName">Medical Name</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="medicalName" placeholder='Medical Name' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="email">Reception Email</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="email" name="email" placeholder='Email' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="contact">Reception Contact Number</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="contact" placeholder='Contact Number' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="dob">Date of Establishment</label>
              <DatePicker className='py-2 px-3' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="flat">Flat / House no. / Society Name</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="flat" placeholder='Flat no.' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="road">Road / Street Name</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="road" placeholder='Road / Street Name' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="pincode">Pin Code</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="pincode" placeholder='Pincode' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="city">City</label>
              <select className='text-black px-3 py-2 rounded-lg border' name="city" id="">
                <option value="-1">Select</option>
                <option value="surat">Surat</option>
              </select>
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="state">State</label>
              <select className='text-black px-3 py-2 rounded-lg border' name="state" id="">
                <option value="-1">Select</option>
                <option value="gujarat">Gujarat</option>
              </select>
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="country">Country</label>
              <select className='text-black px-3 py-2 rounded-lg border' name="country" id="">
                <option value="-1">Select</option>
                <option value="india">India</option>
              </select>
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="dop">Upload files</label>
              <Upload
                className='w-full'
                action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                listType="picture"
                defaultFileList={[...fileList]}
              >
                <div className="flex gap-2 flex-col items-center border py-3 px-10 rounded-lg ">
                  <UploadFileIcon className='text-5xl' />
                  <button >Click to Upload</button>
                </div>
              </Upload>
            </div>
            <div className="flex px-2 gap-3 mt-3 w-full justify-center">
              <button className='border px-5 py-2 rounded text-lg font-bold'>Cancel</button>
              <button className='border px-5 py-2 rounded text-lg font-bold bg-blue-500 text-white'>Save</button>
            </div>
          </div>
        </>
      )

    case 'laboratory-info':
      return (
        <>
          <h2 className='text-3xl font-bold mb-5'>Laboratory Info</h2>
          <span className="bg-green-500 px-4 py-2 text-white rounded-3xl inline-block mb-3">Approved</span>
          <div className="flex flex-wrap gap-y-3">
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="laboratoryName">Laboratory Name</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="laboratoryName" placeholder='Laboratory Name' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="email">Reception Email</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="email" name="email" placeholder='Email' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="contact">Reception Contact Number</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="contact" placeholder='Contact Number' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="dob">Date of Establishment</label>
              <DatePicker className='py-2 px-3' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="flat">Flat / House no. / Society Name</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="flat" placeholder='Flat no.' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="road">Road / Street Name</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="road" placeholder='Road / Street Name' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="pincode">Pin Code</label>
              <input className='text-black px-3 py-2 rounded-lg border' type="text" name="pincode" placeholder='Pincode' />
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="city">City</label>
              <select className='text-black px-3 py-2 rounded-lg border' name="city" id="">
                <option value="-1">Select</option>
                <option value="surat">Surat</option>
              </select>
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="state">State</label>
              <select className='text-black px-3 py-2 rounded-lg border' name="state" id="">
                <option value="-1">Select</option>
                <option value="gujarat">Gujarat</option>
              </select>
            </div>
            <div className="flex flex-col px-2 gap-2 w-[50%]">
              <label className='text-sm font-bold' htmlFor="country">Country</label>
              <select className='text-black px-3 py-2 rounded-lg border' name="country" id="">
                <option value="-1">Select</option>
                <option value="india">India</option>
              </select>
            </div>
            <div className="flex flex-col px-2 gap-2 w-full">
              <label className='text-sm font-bold' htmlFor="dop">Upload files</label>
              <Upload
                className='w-full'
                action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                listType="picture"
                defaultFileList={[...fileList]}
              >
                <div className="flex gap-2 flex-col items-center border py-3 px-10 rounded-lg ">
                  <UploadFileIcon className='text-5xl' />
                  <button >Click to Upload</button>
                </div>
              </Upload>
            </div>
            <div className="flex px-2 gap-3 mt-3 w-full justify-center">
              <button className='border px-5 py-2 rounded text-lg font-bold'>Cancel</button>
              <button className='border px-5 py-2 rounded text-lg font-bold bg-blue-500 text-white'>Save</button>
            </div>
          </div>
        </>
      )

    case 'security-and-privacy':
      return (
        <>
          <h2 className='text-3xl font-bold mb-5'>Security and Privacy</h2>
        </>
      )
    case 'subscription-plans-and-addons':
        return (
        <>
          <h2 className='text-3xl font-bold mb-5'>Subscription Plans and Add-ons</h2>
        </>
      )
    case 'help':
      return (
        <>
          <h2 className='text-3xl font-bold mb-5'>Help</h2>
        </>
      )
  
    default:
      break;
  }
}

const currentLoggedInPerson = 'doctor';

const Profile: React.FC = () => {
  
  const currentPerson = (currentLoggedInPerson === 'doctor' ? DoctorList : currentLoggedInPerson === 'medical' ? MedicalList : currentLoggedInPerson === 'laboratory' ? LaboratoryList : []);
  const [currentContent, setCurrentContent] = useState(currentPerson[0]?.slug);
  const NavbarMenuList = [
    ...currentPerson,
    ...CommonList
  ]

  return (
    <>
      <main className="wrapper">
        <div className="content flex gap-2 max-w-[1460px] mx-auto">
          <nav className="sidebar border-r-2 h-[calc(100vh-80px)] p-2 sticky top-[80px]">
            <div className='font-bold text-4xl my-5 mx-3'>LOGO</div>
            <ul className='flex flex-col gap-5 py-3'>
              {NavbarMenuList.map((item, index) => (
                <li key={index} className='flex items-center cursor-pointer gap-2' onClick={() => setCurrentContent(item.slug)}>
                  <item.icon />
                  {item.label}
                </li>))}
            </ul>
          </nav>
          <div className="container p-10">
            <div className="max-w-[800px] mx-auto">
              {renderContent(currentContent)}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Profile