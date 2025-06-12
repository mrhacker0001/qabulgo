import React, { useMemo, useState } from 'react'
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';


function Navbar() {
    const states = useStoreState();
    const langData = useMemo(() => locale[states.lang], [states.lang]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
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
        <>
            <div className='Navbar'>
                <NavLink to='/'><img src={logo} alt="logo" /></NavLink>

                <div className="texts">
                    <NavLink to='/Support'><span>{langData.yordam}</span></NavLink>
                    <NavLink to='/ServicesPage'><span>{langData.services}</span></NavLink>
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
            <div className="navbar-media">
                <NavLink to='/'> <img src={logo} alt="..." className='logo' /></NavLink>
                <div className="search-panel-media">
                    <select
                        className='language-media'
                        value={states.lang}
                        onChange={(e) => dispatch(setLang(e.target.value))}
                    >
                        <option value="uz">UZ</option>
                        <option value="en">EN</option>
                        <option value="ru">RU</option>

                    </select>

                    <button className="menu-icon" onClick={() => setShowMenu(!showMenu)}>
                        <FontAwesomeIcon icon={showMenu ? faTimes : faBars} className='icon' />
                    </button>
                </div>
                <div className={`mobile-menu ${showMenu ? 'open' : ''}`}>
                    <div className="media-texts">
                        <NavLink to='/Support'><span>{langData.yordam}</span></NavLink>
                        <NavLink to='/ServicesPage'><span>{langData.services}</span></NavLink>
                    </div>

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
        </>
    )
}

export default Navbar;
