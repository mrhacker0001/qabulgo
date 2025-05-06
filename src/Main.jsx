import React from 'react'
import HomePage from './Components/HomePage'
import { Routes, Route } from 'react-router-dom'
import AdminBookingsPage from './Components/Admin/AdminBookingsPage'
import AdminLoginPage from './Components/Admin/AdminLoginPage'
import AdminSchedulePage from './Components/Admin/AdminSchedulePage'
import AdminServicesPage from './Components/Admin/AdminServicesPage'
import DashboardPage from './Components/Admin/DashboardPage'
import BookingPage from './Components/BookingPage'
import Support from './Components/Support'


function Main() {
    return (
        <div className='Main'>
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/AdminBookingsPage' element={<AdminBookingsPage />} />
                <Route path='/AdminLoginPage' element={<AdminLoginPage />} />
                <Route path='/AdminSchedulePage' element={<AdminSchedulePage />} />
                <Route path='/AdminServicesPage' element={<AdminServicesPage />} />
                <Route path='/DashboardPage' element={<DashboardPage />} />
                <Route path='/BookingPage' element={<BookingPage />} />
                <Route path='/Support' element={<Support />} />
            </Routes>
        </div>
    )
}

export default Main