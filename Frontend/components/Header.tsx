'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Dialog from './Dialog';
import NewConnection from '../components/new-connection-request';
import NewReferral from './new-referral-request';
const Header = () => {
  // const Header = () => {
  const isUserLoggedin = window?.localStorage.getItem('accessToken');
  const router = useRouter();
  const [popupVisible, setPopupVisible] = useState(false);
  const [isNewConPop, setIsNewConPop] = useState(false);

  // const profileItems: MenuProps['items'] = [
  //   {
  //     key: '0',
  //     label: (<a>Profile</a>),
  //   },
  //   {
  //     key: '1',
  //     label: (<a>Profile</a>),
  //   },
  //   {
  //     type: 'divider'
  //   }
  // ];
  if (!isUserLoggedin) {
    router.push('/login');
  }

  // async function onClose() {
  function onClose() {
    // "use server"
    console.log("Model has closed")
    setPopupVisible(false);

  }

  // async function onOk() {
  function onOk() {
    // "use server"
    console.log("Ok was clicked")
    setPopupVisible(false);

  }

  // async function openNewConnectionPopup() {
  //  function openPopup() {
  function openPopup(openNecCon: boolean) {
    // if(isNewConPop){

    // }
    console.log("openNewConnectionPopup called")

    setPopupVisible(true);
    setIsNewConPop(openNecCon);
  }

  return (
    <>
      <Dialog title={isNewConPop?'New Connection Request':'New Referral Request'} onClose={onClose} onOk={onOk} popupVisible={popupVisible}>
        {/* <Dialog title='Example Modal' onClose={onClose} onOk={onOk} popupVisible={true}> */}
        {/* <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur assumenda ab repudiandae minima sint, laudantium ipsam autem aliquam totam. Neque provident ipsa consequuntur pariatur voluptas itaque voluptates quae facere facilis!</p> */}

        {isNewConPop ? <NewConnection close={onClose} /> : <NewReferral close={onClose} />}
        {/* {isNewConPop && <NewConnection close={onClose} />}
        {!isNewConPop && <NewReferral close={onClose} />} */}
        {/* {popupVisible && ( */}
        {/* isNewConPop ? <NewConnection close={onClose} /> : <NewReferral close={onClose} /> */}
        {/* )} */}
      </Dialog>
      <div className='h-[80px] bg-[var(--dark-blue)] text-white sticky top-0'>
        <header className='max-w-[1460px] mx-auto px-5 flex items-center justify-between h-full'>
          <Link href={'/'}>
            <h2 className='text-3xl font-bold'>LOGO</h2>
          </Link>
          <ul className="flex gap-4 ml-auto mr-10">
            {isUserLoggedin && <li className='text-lg px-2'><Link href={'/#'} onClick={() => openPopup(false)}>New Refer Request</Link></li>}
            {isUserLoggedin && <li className='text-lg px-2'><Link href={'/#'} onClick={() => openPopup(true)}>New Connection Request</Link></li>}
            {isUserLoggedin && <li className='text-lg px-2'><Link href={'/my-connections'}>My Connections</Link></li>}
            {isUserLoggedin && <li className='text-lg px-2'><Link href={'/#'}>My Patients</Link></li>}
            {!isUserLoggedin && <li className='text-lg px-2'><Link href={'/login'}>Login</Link></li>}
            {!isUserLoggedin && <li className='text-lg px-2'><Link href={'/register'}>Sign-up</Link></li>}
            <li className='text-lg px-2'><Link href={'/#'}>About</Link></li>
          </ul>
          {isUserLoggedin &&
            // <Dropdown menu={{profileItems}} arrow trigger={['click']}>
            <Link href={'/profile'}>
              <div className="h-[50px] w-[50px] bg-[var(--light-blue)] rounded-full flex items-center justify-center text-lg">
                YG
              </div>
            </Link>
            // </Dropdown>
          }
        </header>
      </div>
    </>
  )
}

export default Header