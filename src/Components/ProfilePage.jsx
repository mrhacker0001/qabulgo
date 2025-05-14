import React, { useEffect, useState } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../Components/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../Components/firebase";
import "./ProfilePage.css";

function ProfilePage() {
    const [user] = useAuthState(auth);
    const [activeBookings, setActiveBookings] = useState([]);
    const [completedBookings, setCompletedBookings] = useState([]);

    useEffect(() => {
        if (user) {
            const fetchBookings = async () => {
                try {
                    const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
                    const querySnapshot = await getDocs(q);

                    const active = [];
                    const completed = [];

                    querySnapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.status === "active") {
                            active.push(data);
                        } else if (data.status === "completed") {
                            completed.push(data);
                        }
                    });

                    setActiveBookings(active);
                    setCompletedBookings(completed);
                } catch (error) {
                    console.error("Buyurtmalarni olishda xatolik:", error);
                }
            };

            fetchBookings();
        }
    }, [user]);

    if (!user) {
        return <p>Iltimos, tizimga kiring.</p>;
    }

    return (
        <div className='ProfilePage'>
            <h2>Profil</h2>
            <p><strong>Email:</strong> {user.email}</p>

            <div className="bookings">
                <h3>🔹 Hozirgi buyurtmalar</h3>
                {activeBookings.length === 0 ? <p>Hozircha yo'q</p> :
                    activeBookings.map((booking, index) => (
                        <div key={index} className="booking-card">
                            <p>Xizmat: {booking.serviceName}</p>
                            <p>Sana: {booking.date}</p>
                        </div>
                    ))
                }

                <h3>🔸 O‘tgan buyurtmalar</h3>
                {completedBookings.length === 0 ? <p>Hozircha yo'q</p> :
                    completedBookings.map((booking, index) => (
                        <div key={index} className="booking-card completed">
                            <p>Xizmat: {booking.serviceName}</p>
                            <p>Sana: {booking.date}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default ProfilePage;
