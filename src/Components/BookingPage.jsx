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

  // Adminlar ro'yxatini va har bir adminning buyurtma sonini olish
  useEffect(() => {
    if (!selectedRegion || !selectedService) {
      setAdmins([]);
      setSelectedAdminId("");
      return;
    }

    const fetchAdmins = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "admin"),
          where("region", "==", selectedRegion),
          where("service", "==", selectedService)
        );
        const querySnapshot = await getDocs(q);

        const adminsData = [];

        for (const docSnap of querySnapshot.docs) {
          const adminData = docSnap.data();

          // Har bir admin uchun buyurtma sonini olish
          const bookingsQuery = query(
            collection(db, "bookings"),
            where("adminId", "==", docSnap.id)
          );
          const bookingsSnapshot = await getDocs(bookingsQuery);
          const ordersCount = bookingsSnapshot.size;

          adminsData.push({
            id: docSnap.id,
            number: adminData.number || "Noma'lum",
            ordersCount: ordersCount,
          });
        }

        setAdmins(adminsData);

        // Agar faqat bitta admin bo‘lsa, uni avtomatik tanlash
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

  // Buyurtma berish
  const handleBooking = async () => {
    if (!name || !phone || !selectedRegion || !selectedService || !selectedAdminId) {
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
        adminId: selectedAdminId,
        region: selectedRegion,
        service: selectedService,
        status: "active",
        createdAt: serverTimestamp(),
      });

      alert("Buyurtma muvaffaqiyatli yuborildi!");
      setName("");
      setPhone("");
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
      <h1>{langData.buyurtma}</h1>

      <label>
        Viloyat tanlang:
        <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
          <option value="">-- Viloyat --</option>
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </label>

      <label>
        Xizmat tanlang:
        <select value={selectedService} onChange={e => setSelectedService(e.target.value)}>
          <option value="">-- Xizmat --</option>
          {services.map(service => (
            <option key={service} value={service}>{service}</option>
          ))}
        </select>
      </label>

      {admins.length > 0 && (
        <label>
          Admin tanlang:
          <select value={selectedAdminId} onChange={e => setSelectedAdminId(e.target.value)}>
            <option value="">-- Adminni tanlang --</option>
            {admins.map(admin => (
              <option key={admin.id} value={admin.id}>
                {admin.number} - Buyurtmalar soni: {admin.ordersCount}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        {langData.ism}:
        <input type="text" value={name} onChange={e => setName(e.target.value)} />
      </label>

      <label>
        {langData.telefon}:
        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} />
      </label>

      <button onClick={handleBooking}>{langData.buyurtma}</button>
    </div>
  );
}

export default BookingPage;
