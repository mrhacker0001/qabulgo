import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../Components/firebase";

function DashboardPage() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const fetchAdminInfoAndRatings = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Adminni uid bo'yicha topamiz (agar kerak bo'lsa)
        // Siz hozir bookings dan to'g'ridan-to'g'ri adminId ga user.uid ga teng deb qidiryapsiz
        // Agar adminId user.uid bilan to'g'ri keladigan bo'lsa, shunday qiling:

        // Admin haqida ma'lumot olish uchun users kolleksiyasidan so'rov:
        const adminQuery = query(collection(db, "bookings"), where("adminId", "==", user.uid));
        const adminSnapshot = await getDocs(adminQuery);

        if (!adminSnapshot.empty) {
          const adminDoc = adminSnapshot.docs[0];
          setAdminInfo(adminDoc.data());

          const adminDocId = adminDoc.id; // Admin hujjat IDsi

          // bookings kolleksiyasidan adminId bo'yicha ratinglarni olamiz
          const ratingsQuery = query(collection(db, "bookings"), where("adminId", "==", adminDocId));
          const ratingsSnapshot = await getDocs(ratingsQuery);

          const ratingsList = [];
          ratingsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.rating) {
              ratingsList.push({
                id: doc.id,
                rating: data.rating,
                userName: data.name || "Foydalanuvchi",
                createdAt: data.createdAt ? data.createdAt.toDate().toLocaleString() : "Noma'lum sana",
              });
            }
          });

          setRatings(ratingsList);
        } else {
          setAdminInfo(null);
        }
      } catch (error) {
        console.error("Xatolik yuz berdi:", error);
      }

      setLoading(false);
    };

    fetchAdminInfoAndRatings();
  }, []);

  if (loading) return <div>Yuklanmoqda...</div>;

  if (!adminInfo) return <div>Admin ma'lumotlari topilmadi</div>;

  return (
    <div className="DashboardPage" style={{ padding: "20px" }}>
      <h2>Admin: {adminInfo.name || adminInfo.phone || "Noma'lum admin"}</h2>
      <h3>Foydalanuvchilar baholari:</h3>
      {ratings.length === 0 ? (
        <p>Baholar mavjud emas</p>
      ) : (
        <ul>
          {ratings.map(r => (
            <li key={r.id} style={{ marginBottom: "15px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
              <b>{r.userName}:</b> <br />
              Bahosi: <b>{r.rating} / 5</b> <br />
              <small style={{ color: "gray" }}>{r.createdAt}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DashboardPage;
