import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "./BookingPage.css";
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";

function BookingPage() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("");
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

  const [times, setTimes] = useState([]);

  useEffect(() => {
    const fetchTimes = async () => {
      const q = query(collection(db, "serviceTimes"), where("serviceId", "==", id));
      const querySnapshot = await getDocs(q);
      const timeList = [];
      querySnapshot.forEach(doc => {
        timeList.push(doc.data().timeSlot);
      });
      setTimes(timeList);
    };

    if (id) fetchTimes();
  }, [id]);

  const handleBooking = async () => {
    if (!name || !phone || !time) return alert("Iltimos, barcha maydonlarni to‘ldiring");

    try {
      await addDoc(collection(db, "bookings"), {
        name,
        phone,
        time,
        serviceId: id,
        serviceName: service?.name || "",
        workplace: service?.workplace || "",
        location: service?.location || "",
        createdAt: serverTimestamp(),
      });

      alert("Buyurtma muvaffaqiyatli yuborildi!");
      setName(""); setPhone(""); setTime("");
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
            <p><strong>Lokatsiya:</strong> {service.location}</p>
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
          <label>
            {langData.vaqti}
            <select value={time} onChange={e => setTime(e.target.value)}>
              <option value="">-- Vaqt tanlang --</option>
              {times.map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>

          </label>
          <button onClick={handleBooking}>{langData.buyurtma}</button>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
