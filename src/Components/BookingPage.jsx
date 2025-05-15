import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "./BookingPage.css";
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";
import { auth } from "./firebase";



function BookingPage() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const states = useStoreState();
  const langData = useMemo(() => locale[states.lang], [states.lang]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const docRef = doc(db, "services", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setService(docSnap.data());
        } else {
          console.log("Xizmat topilmadi");
        }
      } catch (err) {
        console.error("Xatolik:", err);
      }
    };
    fetchService();
  }, [id]);


  useEffect(() => {
    const fetchTimes = async () => {
      const q = query(collection(db, "serviceTimes"), where("serviceId", "==", id));
      const querySnapshot = await getDocs(q);
      const timeList = [];
      querySnapshot.forEach(doc => {
        timeList.push(doc.data().timeSlot);
      });
    };

    if (id) fetchTimes();
  }, [id]);

  const handleBooking = async () => {
    if (!name || !phone) return alert("Iltimos, barcha maydonlarni to‘ldiring");

    const user = auth.currentUser;
    if (!user) {
      alert("Buyurtma berish uchun tizimga kiring");
      return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        name,
        phone,
        serviceId: id,
        serviceName: service?.name || "",
        workplace: service?.workplace || "",
        location: service?.location || "",
        status: "active", // status qo‘shiladi
        createdAt: serverTimestamp(),
      });

      alert("Buyurtma muvaffaqiyatli yuborildi!");
      setName(""); setPhone("");
    } catch (err) {
      console.error("Xatolik:", err);
      alert("Buyurtma yuborishda xatolik yuz berdi");
    }
  };

  return (
    <div className='BookingPage'>
      <div className="booking">
        <h1>{langData.buyurtma}</h1>

        {service && (
          <div className="service-details">
            <h2>{service.name}</h2>
            <p><strong>{langData.narx}:</strong> {service.price} so‘m</p>
            <p><strong>{langData.vaqt}:</strong> {service.duration} daqiqa</p>
            <p><strong>{langData.place}</strong> {service.workplace}</p>
            <p><strong>{langData.joylashuv}</strong> {service.location}</p>
          </div>
        )}

        <div className="inputs">
          <label>
            {langData.ism}
            <input value={name} onChange={e => setName(e.target.value)} type="text" />
          </label>
          <label>
            {langData.telefon}
            <input value={phone} onChange={e => setPhone(e.target.value)} type="text" />
          </label>
          <button onClick={handleBooking}>{langData.buyurtma}</button>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
