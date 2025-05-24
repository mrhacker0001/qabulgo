import React, { useMemo, useEffect, useState } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../Components/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../Components/firebase";
import "./ProfilePage.css";
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";


function ProfilePage() {
    const [user] = useAuthState(auth);
    const [activeBookings, setActiveBookings] = useState([]);
    const [completedBookings, setCompletedBookings] = useState([]);
    const [cancelledBookings, setCancelledBookings] = useState([]);
    const [reviews, setReviews] = useState({});
    const states = useStoreState();
    const langData = useMemo(() => locale[states.lang], [states.lang]);

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

    if (!user) return <p>{langData.please}</p>;
    return (
        <div className='ProfilePage'>
            <h2>{langData.profil}</h2>
            <p><strong>{langData.email}:</strong> {user.email}</p>

            <div className="bookings">
                <h3>🔹 {langData.bookings}</h3>
                {activeBookings.map((booking, index) => (
                    <div key={index} className="booking-card">
                        <p>{langData.xizmat}: {booking.service}</p>
                        <p>{langData.booked}: {booking.region}</p>
                        <br />
                        <p><strong>{langData.date}:</strong> {booking.createdAt ? booking.createdAt.toDate().toLocaleString() : "Noma’lum sana"}</p>


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
                            ❌ {langData.cancel}
                        </button>
                    </div>
                ))}


                <h3>🔸 {langData.pastbooks}</h3>
                {completedBookings.map((booking, index) => (
                    <div key={booking.id} className="booking-card completed">
                        <p>{langData.xizmat}: {booking.service}</p>
                        <p>{langData.booked}: {booking.region}</p>
                        <br />
                        <p><strong>{langData.date}:</strong> {booking.createdAt?.toDate().toLocaleString()}</p>

                        {booking.rating ? (
                            <p>⭐ {langData.rate}: {booking.rating}/5</p>
                        ) : (
                            <div>
                                <label>{langData.giverate}: </label>
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
                                    <option value="">{langData.select}</option>
                                    <option value="1">1 - {langData.first}</option>
                                    <option value="2">2 - {langData.second}</option>
                                    <option value="3">3 - {langData.third}</option>
                                    <option value="4">4 - {langData.forth}</option>
                                    <option value="5">5 - {langData.fifth}</option>
                                </select>
                            </div>
                        )}

                        {/* Sharh yozish va saqlash */}
                        {!booking.review && (
                            <div style={{ marginTop: "10px" }}>
                                <label>{langData.comment}:</label>
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
                                    {langData.save}
                                </button>
                            </div>
                        )}


                        {/* Saqlangan sharhni ko'rsatamiz */}
                        {booking.review && (
                            <p style={{ marginTop: "10px", fontStyle: "italic", color: "#555" }}>
                                <strong>{langData.review}:</strong> {booking.review}
                            </p>
                        )}
                    </div>
                ))}




                <h3 style={{ color: "red" }}>❌ {langData.bekor_qilingan}</h3>
                {cancelledBookings.length === 0 ? <p>{langData.no}</p> :
                    cancelledBookings.map((booking, index) => (
                        <div key={index} className="booking-card cancelled">
                            <p>{langData.xizmat}: {booking.service}</p>
                            <p>{langData.booked}: {booking.region}</p>
                            <br />
                            <p><strong>{langData.cancelleddate}:</strong> {booking.createdAt?.toDate().toLocaleString()}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default ProfilePage;
