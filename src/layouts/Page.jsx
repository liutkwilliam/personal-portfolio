import React from 'react'
import { Outlet } from 'react-router-dom';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

function Page() {
  return (
    <>
      <NavBar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-page min-h-[90vh]">
        <Outlet />
      </div>
      <Footer />
    </>
  )
}

export default Page