import React, { useState, useMemo } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Components/firebase'; // firebase faylingizdan auth ni import qiling
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";
import './AdminLoginPage.css'; // ixtiyoriy: stil fayl
import { useNavigate } from "react-router-dom";

function AdminSignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const states = useStoreState();
    const langData = useMemo(() => locale[states.lang], [states.lang]);
    const navigate = useNavigate();

    const handleSignup = async () => {
        if (!email || !password) return alert("Iltimos, barcha maydonlarni to‘ldiring");
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Ro‘yxatdan muvaffaqiyatli o‘tdingiz!");
            setEmail('');
            setPassword('');
            navigate("/");
        } catch (error) {
            console.error("Ro‘yxatdan o‘tishda xatolik:", error);
            alert("Xatolik: " + error.message);
        }
    };

    return (
        <div className="AdminSignupPage">
            <div className="form">
                <h2>{langData.royxatdan_otish}</h2>
                <input
                    type="email"
                    placeholder={langData.email}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder={langData.parol}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button onClick={handleSignup}>{langData.royxatdan_otish}</button>
            </div>
        </div>
    );
}

export default AdminSignupPage;
