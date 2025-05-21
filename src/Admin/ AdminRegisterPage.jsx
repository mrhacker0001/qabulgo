import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../Components/firebase';
import "./AdminLoginPage.css"

function AdminRegisterPage() {
    const [secret, setSecret] = useState('');
    const [accessGranted, setAccessGranted] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [region, setRegion] = useState('');
    const [number, setNumber] = useState('');
    const [service, setService] = useState('');
    const [name, setName] = useState('');

    const handleSecretSubmit = (e) => {
        e.preventDefault();
        if (secret === "2222") {
            setAccessGranted(true);
        } else {
            alert("Noto‘g‘ri maxfiy parol!");
        }
    };

    const registerAdmin = async (e) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'admins', user.uid), {
                email: user.email,
                role: 'admin',
                region,
                service,
                number,
                name
            });

            alert("Admin muvaffaqiyatli ro‘yxatdan o‘tdi");

            // Formani tozalash
            setEmail('');
            setPassword('');
            setRegion('');
            setNumber('');
            setService('');
            setName('');

        } catch (error) {
            console.error("Xatolik:", error);
            alert("Xatolik: " + error.message);
        }
    };

    const services = [
        { name: "quruvchi" },
        { name: "beauty shop" },
        { name: "sartarosh" },
        { name: "santexnik" },
    ];

    const regionname = [
        { name: "Namangan" },
        { name: "Andijon" },
        { name: "Farg'ona" },
        { name: "Toshkent" },
        { name: "Xorazm" },
        { name: "Jizzax" },
        { name: "Qashqadaryo" },
        { name: "Surxandaryo" },
        { name: "Navoiy" },
        { name: "Samarqand" },
        { name: "Buxoro" },
        { name: "Sirdaryo" }
    ];

    return (
        <div className="AdminRegisterPage" style={{ padding: "20px" }}>
            {!accessGranted ? (
                <form onSubmit={handleSecretSubmit}>
                    <h3>Maxfiy kodni kiriting</h3>
                    <input
                        type="password"
                        placeholder="Maxfiy parol"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        required
                    />
                    <button type="submit">Kirish</button>
                </form>
            ) : (
                <form onSubmit={registerAdmin}>
                    <h2>Admin ro‘yxatdan o‘tish</h2>

                    <input
                        type="text"
                        placeholder="Ismingiz"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Parol"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Telefon raqam"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        required
                    />

                    <select value={region} onChange={(e) => setRegion(e.target.value)} required>
                        <option value="">Viloyat tanlang</option>
                        {regionname.map((item, index) => (
                            <option key={index} value={item.name}>{item.name}</option>
                        ))}
                    </select>

                    <select value={service} onChange={(e) => setService(e.target.value)} required>
                        <option value="">Xizmat turi</option>
                        {services.map((item, index) => (
                            <option key={index} value={item.name}>{item.name}</option>
                        ))}
                    </select>

                    <button type="submit">Ro‘yxatdan o‘tish</button>
                </form>
            )}
        </div>
    );
}

export default AdminRegisterPage;
