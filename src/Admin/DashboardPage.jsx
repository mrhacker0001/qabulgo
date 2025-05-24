import React, { useEffect, useState, useMemo } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../Components/firebase";
import "./DashboardPage.css";
import { setLang } from "../Redux/lang";
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";





function DashboardPage() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const states = useStoreState(); // <-- Hookni ichkariga o‘tkazdik
  const langData = useMemo(() => locale[states.lang], [states.lang]);


  useEffect(() => {
    const fetchAdminInfoAndRatings = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1. Admin ma'lumotlarini "admins" kolleksiyasidan olish
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDocSnap = await getDoc(adminDocRef);

        if (!adminDocSnap.exists()) {
          setAdminInfo(null);
          setLoading(false);
          return;
        }

        const adminData = adminDocSnap.data();
        setAdminInfo({
          name: adminData.name || "Noma'lum",
          phone: adminData.number || "Noma'lum",
        });

        // 2. Adminning bookinglari bo‘yicha reytinglarni olish
        const bookingsQuery = query(collection(db, "bookings"), where("adminId", "==", user.uid));
        const bookingsSnapshot = await getDocs(bookingsQuery);

        if (!bookingsSnapshot.empty) {
          const ratingsList = [];
          let totalRating = 0;

          bookingsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.rating) {
              const ratingNumber = Number(data.rating);
              totalRating += ratingNumber;

              ratingsList.push({
                id: doc.id,
                rating: ratingNumber,
                review: data.review || "",
                userName: data.name || "Foydalanuvchi",
                createdAt: data.createdAt ? data.createdAt.toDate().toLocaleString() : "Noma'lum sana",
              });
            }
          });

          if (ratingsList.length > 0) {
            setAverageRating((totalRating / ratingsList.length).toFixed(1));
          }

          ratingsList.sort((a, b) => b.rating - a.rating);
          setRatings(ratingsList);
        }

      } catch (error) {
        console.error("Xatolik yuz berdi:", error);
      }

      setLoading(false);
    };

    fetchAdminInfoAndRatings();
  }, []);

  if (loading) return <div>{langData.loading}</div>;

  if (!adminInfo) return <div>{langData.noinfo}</div>;

  return (
    <div className="DashboardPage" style={{ padding: "20px" }}>
      <h2>{langData.admin}: {adminInfo.name}</h2>
      <p>{langData.telefon}: {adminInfo.phone}</p>

      <div style={{ marginTop: "10px", marginBottom: "20px" }}>
        <h3>{langData.static}:</h3>
        <p>{langData.count}: <b>{ratings.length}</b></p>
        <p>{langData.average}: <b>{averageRating} / 5</b></p>
      </div>

      <h3>{langData.countm}:</h3>
      {ratings.length === 0 ? (
        <p>{langData.norating}</p>
      ) : (
        <ul style={{ padding: 0, listStyleType: "none" }}>
          {ratings.map(r => (
            <li key={r.id} style={{ marginBottom: "15px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
              <b>{r.userName}</b> - <span>{r.rating} / 5</span><br />
              {r.review && (
                <div style={{ marginTop: "5px" }}>
                  <i>"{r.review}"</i>
                </div>
              )}
              <small style={{ color: "gray" }}>{r.createdAt}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DashboardPage;
