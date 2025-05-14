import React, { useState, useMemo } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Components/firebase';
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";
import './AdminLoginPage.css'; // stil fayli (ixtiyoriy)
import { useNavigate } from "react-router-dom";

function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const states = useStoreState();
  const langData = useMemo(() => locale[states.lang], [states.lang]);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) return alert("Iltimos, barcha maydonlarni to‘ldiring");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Tizimga muvaffaqiyatli kirdingiz!");
      setEmail('');
      setPassword('');
      navigate("/");

    } catch (error) {
      console.error("Kirishda xatolik:", error);
      alert("Xatolik: " + error.message);
    }
  };

  return (
    <div className="AdminLoginPage">
      <div className="form">
        <h2>{langData.admin_kirish}</h2>

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
        <button onClick={handleLogin}>{langData.kirish}</button>
      </div>
    </div>
  );
}

export default AdminLoginPage;
