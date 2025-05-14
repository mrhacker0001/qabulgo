import React, { useMemo } from 'react'
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";
import { useDispatch } from "react-redux";
import { setLang } from "../Redux/lang";
import logo from "../assets/qabulgo1.png"
import "./Navbar.css"
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from "firebase/auth";
import { auth } from "../Components/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

function Navbar() {
    const states = useStoreState();
    const langData = useMemo(() => locale[states.lang], [states.lang]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [user] = useAuthState(auth); // foydalanuvchi holati

    const handleLogout = () => {
        signOut(auth).then(() => {
            alert("Tizimdan chiqdingiz");
            navigate("/"); // logoutdan keyin bosh sahifaga qaytadi
        }).catch(err => {
            console.error("Logout xatolik:", err);
        });
    };

    return (
        <div className='Navbar'>
            <NavLink to='/'><img src={logo} alt="logo" /></NavLink>

            <div className="texts">
                <NavLink to='/Support'><span>{langData.yordam}</span></NavLink>
                <NavLink to='/AdminRegisterPage'><span>{langData.buyurtma}</span></NavLink>
            </div>

            <div className="buttons">
                <select
                    className='language'
                    value={states.lang}
                    onChange={(e) => dispatch(setLang(e.target.value))}
                >
                    <option value="uz">UZ</option>
                    <option value="en">EN</option>
                    <option value="ru">RU</option>
                </select>

                {user ? (
                    <>
                        <NavLink to="/ProfilePage">
                            <button>{langData.profil}</button>
                        </NavLink>
                        <button onClick={handleLogout}>{langData.chiqish}</button>
                    </>
                ) : (
                    <>
                        <button><NavLink to="/AdminSignupPage">{langData.register}</NavLink></button>
                        <button><NavLink to="/AdminLoginPage">{langData.login}</NavLink></button>
                    </>
                )}
            </div>
        </div>
    )
}

export default Navbar;
