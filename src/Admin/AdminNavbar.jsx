import React from 'react';
import {useNavigate } from 'react-router-dom';
import { auth } from '../Components/firebase';
import { NavLink } from 'react-router-dom'

import './AdminNavbar.css';

function AdminNavbar({ setIsAdmin }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            setIsAdmin(false);
            navigate('/');
        } catch (error) {
            console.error("Chiqishda xatolik:", error);
        }
    };

    return (
        <nav className="admin-navbar">
            <ul>
                <li><NavLink to="/AdminServicesPage">Xizmatlar</NavLink></li>
                <li><NavLink to="/AdminBookingsPage">Buyurtmalar</NavLink></li>
                <li><NavLink to="/AdminDashboardPage">Bajarilgan buyurtmalar</NavLink></li>
                <li><button onClick={handleLogout}>Chiqish</button></li>
            </ul>
        </nav>
    );
}

export default AdminNavbar;
