import React, { useMemo } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { auth } from '../Components/firebase';
import locale from "../localization/locale.json";
import { useDispatch } from "react-redux";
import { setLang } from "../Redux/lang";
import { useStoreState } from "../Redux/selector";

import './AdminNavbar.css';

function AdminNavbar({ setIsAdmin }) {
    const navigate = useNavigate();
    const states = useStoreState(); // <-- Hookni ichkariga o‘tkazdik
    const dispatch = useDispatch(); // <-- Hookni ichkariga o‘tkazdik

    const langData = useMemo(() => locale[states.lang], [states.lang]);

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
                <li><NavLink to="/AdminServicesPage">{langData?.services || "Xizmatlar"}</NavLink></li>
                <li><NavLink to="/AdminBookingsPage">{langData?.bookings || "Buyurtmalar"}</NavLink></li>
                <li><NavLink to="/DashboardPage">{langData?.completed || "Bajarilgan buyurtmalar"}</NavLink></li>
                <button onClick={handleLogout}>{langData?.logout || "Chiqish"}</button>
            </ul>
            <select
                className='language'
                value={states.lang}
                onChange={(e) => dispatch(setLang(e.target.value))}
            >
                <option value="uz">UZ</option>
                <option value="en">EN</option>
                <option value="ru">RU</option>
            </select>
        </nav>
    );
}

export default AdminNavbar;
