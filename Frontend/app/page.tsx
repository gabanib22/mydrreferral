"use client";
import Header from "@/components/Header";
import { requestInstance } from "@/request";
import Link from "next/link";
import { useEffect, useState } from "react";

type RefferalResponse = {
  Mobile: string,
  Email: string,
  DoctorName: string,
  Amount: number,
  Notes: string,
}

function Home() {
  const [referralData, setReferralData] = useState<RefferalResponse[]>([]);
  const [doctorData, setDoctorData] = useState<RefferalResponse[]>([]);
  useEffect(() => {
    const getRequest = async () => {
      const referrals = await requestInstance.getRefferals();
      setReferralData(referrals.data);
      console.log(referrals.data);

      const doctors = await requestInstance.getDoctors();
      setDoctorData(doctors.data);
      console.log(doctors.data);
    }
    getRequest();
  }, [])
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh - 80px)] gap-2 items-center justify-between p-10">
        <div className="w-[50%]">
          <div className="border rounded-xl p-2 bg-[var(--light-blue)]">
            <div className="p-3 flex items-center text-xl font-semibold">
              <span className="w-[70%]">My Referrals</span>
              <span className="">Status</span>
            </div>
            {referralData?.map((item, index) => (
              <div key={index} className="p-3 flex items-center text-lg">
                <span className="w-[70%] flex flex-col">
                  <span>{item?.DoctorName}</span>
                  <span>Refer to {item?.Mobile}</span>
                </span>
                <span>{item?.Notes}</span>
              </div>))}
          </div>
          <Link passHref legacyBehavior prefetch={false} href={'/all-referrals'}>
            <a className="block py-2 px-3 border w-max rounded mt-3 mx-auto">See all Referrals</a>
          </Link>
        </div>
        <div className="w-[50%]">
          <div className="border rounded-xl p-2 bg-[var(--light-blue)]">
            <div className="p-3 flex items-center text-xl font-semibold">
              <span className="w-[70%]">Doctor Name</span>
              <span className="">Amount</span>
            </div>
            {doctorData?.map((item, index) => (
              <div key={index} className="p-3 flex items-center text-lg">
                <span className="w-[70%] flex flex-col">
                  <span>Refer to {item?.DoctorName}</span>
                </span>
                <span>{item?.Notes}</span>
              </div>))}
          </div>
          <Link passHref legacyBehavior prefetch={false} href={'/all-referrals'}>
            <a className="block py-2 px-3 border w-max rounded mt-3 mx-auto">See all Refered Doctors</a>
          </Link>
        </div>
      </main>
    </>
  )
}

export default Home;

export const revalidate = 20;