import React, { useMemo } from 'react'
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";
import { useDispatch } from "react-redux";
import { setLang } from "../Redux/lang";
import logo from "../assets/qabulgo1.png"
import "./Navbar.css"
import { NavLink } from 'react-router-dom'



function Navbar() {
    const states = useStoreState();
    const langData = useMemo(() => locale[states.lang], [states.lang]);
    const dispatch = useDispatch();

    return (
        <div className='Navbar'>
            <NavLink to='/'><img src={logo} alt="" /></NavLink>
            <div className="texts">
                <NavLink to='/Support'><span>{langData.yordam}</span></NavLink>
                <NavLink to='/AdminBookingsPage'><span>{langData.buyurtma}</span></NavLink>
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
                <button>{langData.register}</button>
                <button>{langData.login}</button>
            </div>

        </div>
    )
}

export default Navbar