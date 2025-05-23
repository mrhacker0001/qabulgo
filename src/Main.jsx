import React from 'react'
import HomePage from './Components/HomePage'
import { Routes, Route } from 'react-router-dom'
import AdminBookingsPage from './Admin/AdminBookingsPage'
import AdminLoginPage from './Admin/AdminLoginPage'
import AdminServicesPage from './Admin/AdminServicesPage'
import DashboardPage from './Admin/DashboardPage'
import BookingPage from './Components/BookingPage'
import Support from './Components/Support'
import AdminSignupPage from './Admin/AdminSignupPage'
import AdminRegisterPage from './Admin/ AdminRegisterPage'
import ProfilePage from './Components/ProfilePage'
import ServicesPage from './Components/ServicesPage'


function Main() {
    return (
        <div className='Main'>
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/AdminBookingsPage' element={<AdminBookingsPage />} />
                <Route path='/AdminLoginPage' element={<AdminLoginPage />} />
                <Route path='/AdminSignupPage' element={<AdminSignupPage />} />
                <Route path='/AdminServicesPage' element={<AdminServicesPage />} />
                <Route path='/DashboardPage' element={<DashboardPage />} />
                <Route path='/BookingPage/:id' element={<BookingPage />} />
                <Route path='/Support' element={<Support />} />
                <Route path='/AdminRegisterPage' element={<AdminRegisterPage />} />
                <Route path='/ProfilePage' element={<ProfilePage />} />
                <Route path='/ServicesPage' element={<ServicesPage />} />

            </Routes>
        </div>
    )
}

export default Main