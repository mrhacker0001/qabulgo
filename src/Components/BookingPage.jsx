import React, { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "./firebase";
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";
import "./BookingPage.css";

function BookingPage() {
  const states = useStoreState();
  const langData = useMemo(() => locale[states.lang], [states.lang]);

  const regions = [
    "Namangan", "Andijon", "Farg'ona", "Toshkent", "Xorazm",
    "Jizzax", "Qashqadaryo", "Surxandaryo", "Navoiy", "Samarqand",
    "Buxoro", "Sirdaryo"
  ];
  const services = ["quruvchi", "beauty shop", "sartarosh", "santexnik"];

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const [admins, setAdmins] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [adress, setAdress] = useState("");

  useEffect(() => {
    if (!selectedRegion || !selectedService) {
      setAdmins([]);
      setSelectedAdminId("");
      return;
    }

    const fetchAdmins = async () => {
      try {
        const q = query(
          collection(db, "admins"),
          where("role", "==", "admin"),
          where("region", "==", selectedRegion),
          where("service", "==", selectedService)
        );
        const querySnapshot = await getDocs(q);

        const adminsData = [];

        for (const docSnap of querySnapshot.docs) {
          const adminData = docSnap.data();

          // Adminning buyurtmalarini olish
          const bookingsQuery = query(
            collection(db, "bookings"),
            where("adminId", "==", docSnap.id)
          );
          const bookingsSnapshot = await getDocs(bookingsQuery);
          const ordersCount = bookingsSnapshot.size;

          // Baholarni yig'ish
          let totalRating = 0;
          let ratingCount = 0;

          bookingsSnapshot.forEach((bookingDoc) => {
            const bookingData = bookingDoc.data();
            if (bookingData.rating !== undefined && bookingData.rating !== null) {
              totalRating += bookingData.rating;
              ratingCount++;
            }
          });

          adminsData.push({
            id: docSnap.id,
            number: adminData.number || "Noma'lum",
            ordersCount,
            rating: totalRating,
            ratingCount,
          });
        }

        setAdmins(adminsData);

        if (adminsData.length === 1) {
          setSelectedAdminId(adminsData[0].id);
        } else {
          setSelectedAdminId("");
        }
      } catch (error) {
        console.error("Adminlarni olishda xatolik:", error);
      }
    };

    fetchAdmins();
  }, [selectedRegion, selectedService]);

  const handleBooking = async () => {
    if (!name || !phone || !adress || !selectedRegion || !selectedService || !selectedAdminId) {
      alert("Iltimos, barcha maydonlarni to‘ldiring va adminni tanlang");
      return;
    }

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
        adress,
        adminId: selectedAdminId,
        region: selectedRegion,
        service: selectedService,
        status: "active",
        createdAt: serverTimestamp(),
      });

      alert("Buyurtma muvaffaqiyatli yuborildi!");
      setName("");
      setPhone("");
      setAdress("");
      setSelectedRegion("");
      setSelectedService("");
      setAdmins([]);
      setSelectedAdminId("");
    } catch (error) {
      console.error("Buyurtma berishda xatolik:", error);
      alert("Buyurtma yuborishda xatolik yuz berdi");
    }
  };

  return (
    <div className="BookingPage">
      <div className="booking-page">
        <h1>{langData.buyurtma}</h1>

        <label>
          {langData.selectregion}:
          <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
            <option value="">-- {langData.region} --</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </label>

        <label>
          {langData.selectservice}:
          <select value={selectedService} onChange={e => setSelectedService(e.target.value)}>
            <option value="">-- {langData.nom} --</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </label>

        <label>
          {langData.ism}:
          <input type="text" value={name} onChange={e => setName(e.target.value)} />
        </label>

        <label>
          {langData.telefon}:
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} />
        </label>

        <label>
          {langData.adress}:
          <input type="text" value={adress} onChange={e => setAdress(e.target.value)} />
        </label>

        <button onClick={handleBooking}>{langData.buyurtma}</button>
      </div>

      <div className="admin-profiles-page">
        <h1>{langData.admins}</h1>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{langData.telefon}</th>
              <th>{langData.completed}</th>
              <th>{langData.average}</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin, index) => {
              const avgRating = admin.ratingCount > 0 ? (admin.rating / admin.ratingCount).toFixed(1) : "0.0";
              return (
                <tr key={admin.id}>
                  <td>{index + 1}</td>
                  <td>{admin.number}</td>
                  <td>{admin.ordersCount}</td>
                  <td>{avgRating} ⭐</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default BookingPage;
