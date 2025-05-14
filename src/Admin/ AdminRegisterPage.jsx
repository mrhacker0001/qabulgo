import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../Components/firebase';

function AdminRegisterPage() {
    const [secret, setSecret] = useState('');
    const [accessGranted, setAccessGranted] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSecretSubmit = (e) => {
        e.preventDefault();
        if (secret === "2222") { // bu faqat siz biladigan maxfiy parol
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

            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                role: 'admin'
            });

            alert("Admin muvaffaqiyatli ro‘yxatdan o‘tdi");
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error("Xatolik:", error);
            alert("Xatolik: " + error.message);
        }
    };

    return (
        <div className="AdminRegisterPage">
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
                    <button type="submit">Ro‘yxatdan o‘tish</button>
                </form>
            )}
        </div>
    );
}

export default AdminRegisterPage;
