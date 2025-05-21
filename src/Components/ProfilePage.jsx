import React, { useEffect, useState } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../Components/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../Components/firebase";
import "./ProfilePage.css";

function ProfilePage() {
    const [user] = useAuthState(auth);
    const [activeBookings, setActiveBookings] = useState([]);
    const [completedBookings, setCompletedBookings] = useState([]);
    const [cancelledBookings, setCancelledBookings] = useState([]);
    const [reviews, setReviews] = useState({});

    useEffect(() => {
        if (user) {
            const fetchBookings = async () => {
                try {
                    const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
                    const querySnapshot = await getDocs(q);

                    const active = [];
                    const completed = [];
                    const cancelled = [];

                    const loadedReviews = {}; // Sharhlarni to'plash uchun

                    querySnapshot.forEach(doc => {
                        const data = doc.data();
                        const bookingData = { id: doc.id, ...data };
                        if (data.status === "active") active.push(bookingData);
                        else if (data.status === "completed") completed.push(bookingData);
                        else if (data.status === "cancelled") cancelled.push(bookingData);

                        if (data.review) loadedReviews[doc.id] = data.review;
                    });

                    setActiveBookings(active);
                    setCompletedBookings(completed);
                    setCancelledBookings(cancelled);

                    setReviews(loadedReviews);
                } catch (error) {
                    console.error("Buyurtmalarni olishda xatolik:", error);
                }
            };

            fetchBookings();
        }
    }, [user]);

    if (!user) return <p>Iltimos, tizimga kiring.</p>;
    return (
        <div className='ProfilePage'>
            <h2>Profil</h2>
            <p><strong>Email:</strong> {user.email}</p>

            <div className="bookings">
                <h3>🔹 Hozirgi buyurtmalar</h3>
                {activeBookings.map((booking, index) => (
                    <div key={index} className="booking-card">
                        <p>Xizmat: {booking.service}</p>
                        <p>Band qilingan joy: {booking.region}</p>
                        <br />
                        <p><strong>Sana:</strong> {booking.createdAt ? booking.createdAt.toDate().toLocaleString() : "Noma’lum sana"}</p>


                        <button
                            className="cancel-button"
                            onClick={async () => {
                                const confirm = window.confirm("Buyurtmani bekor qilmoqchimisiz?");
                                if (!confirm) return;
                                try {
                                    const bookingRef = doc(db, "bookings", booking.id);
                                    await updateDoc(bookingRef, { status: "cancelled" });
                                    setActiveBookings(prev => prev.filter(b => b.id !== booking.id));
                                } catch (err) {
                                    console.error("Bekor qilishda xatolik:", err);
                                    alert("Bekor qilishda xatolik yuz berdi");
                                }
                            }}
                        >
                            ❌ Bekor qilish
                        </button>
                    </div>
                ))}


                <h3>🔸 O‘tgan buyurtmalar</h3>
                {completedBookings.map((booking, index) => (
                    <div key={booking.id} className="booking-card completed">
                        <p>Xizmat: {booking.service}</p>
                        <p>Band qilingan joy: {booking.region}</p>
                        <br />
                        <p><strong>Sana:</strong> {booking.createdAt?.toDate().toLocaleString()}</p>

                        {booking.rating ? (
                            <p>⭐ Baho: {booking.rating}/5</p>
                        ) : (
                            <div>
                                <label>Baho bering: </label>
                                <select
                                    onChange={async (e) => {
                                        const value = parseInt(e.target.value);
                                        try {
                                            const bookingRef = doc(db, "bookings", booking.id);
                                            await updateDoc(bookingRef, { rating: value });
                                            const updated = [...completedBookings];
                                            updated[index].rating = value;
                                            setCompletedBookings(updated);
                                        } catch (err) {
                                            console.error("Reyting saqlashda xatolik:", err);
                                            alert("Reytingni saqlab bo‘lmadi");
                                        }
                                    }}
                                >
                                    <option value="">Tanlang</option>
                                    <option value="1">1 - Juda yomon</option>
                                    <option value="2">2 - Yomon</option>
                                    <option value="3">3 - O‘rtacha</option>
                                    <option value="4">4 - Yaxshi</option>
                                    <option value="5">5 - A’lo</option>
                                </select>
                            </div>
                        )}

                        {/* Sharh yozish va saqlash */}
                        {!booking.review && (
                            <div style={{ marginTop: "10px" }}>
                                <label>Sharh yozing:</label>
                                <textarea
                                    rows={3}
                                    style={{ width: "100%", resize: "vertical" }}
                                    value={reviews[booking.id] || ""}
                                    onChange={(e) => setReviews(prev => ({ ...prev, [booking.id]: e.target.value }))}
                                    placeholder="Sharhingizni yozing..."
                                />
                                <button
                                    onClick={async () => {
                                        try {
                                            const reviewText = reviews[booking.id]?.trim() || "";
                                            if (!reviewText) {
                                                alert("Iltimos, sharh kiriting!");
                                                return;
                                            }
                                            const bookingRef = doc(db, "bookings", booking.id);
                                            await updateDoc(bookingRef, { review: reviewText });

                                            const updated = [...completedBookings];
                                            updated[index].review = reviewText;
                                            setCompletedBookings(updated);

                                            setReviews(prev => ({ ...prev, [booking.id]: "" }));

                                            alert("Sharh muvaffaqiyatli saqlandi!");
                                        } catch (err) {
                                            console.error("Sharh saqlashda xatolik:", err);
                                            alert("Sharhni saqlab bo‘lmadi");
                                        }
                                    }}
                                    style={{ marginTop: "5px" }}
                                >
                                    Sharhni saqlash
                                </button>
                            </div>
                        )}


                        {/* Saqlangan sharhni ko'rsatamiz */}
                        {booking.review && (
                            <p style={{ marginTop: "10px", fontStyle: "italic", color: "#555" }}>
                                <strong>Sharh:</strong> {booking.review}
                            </p>
                        )}
                    </div>
                ))}




                <h3 style={{ color: "red" }}>❌ Bekor qilingan buyurtmalar</h3>
                {cancelledBookings.length === 0 ? <p>Hozircha yo'q</p> :
                    cancelledBookings.map((booking, index) => (
                        <div key={index} className="booking-card cancelled">
                            <p>Xizmat: {booking.service}</p>
                            <p>Band qilingan joy: {booking.region}</p>
                            <br />
                            <p><strong>Bekor qilingan sana:</strong> {booking.createdAt?.toDate().toLocaleString()}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default ProfilePage;
