import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../Components/firebase';
import { useStoreState } from "../Redux/selector";
import { auth } from '../Components/firebase';

import locale from "../localization/locale.json";
import './AdminBookingsPage.css';

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [servicesMap, setServicesMap] = useState({});
  const [filterToday, setFilterToday] = useState(false);

  const states = useStoreState();
  const langData = useMemo(() => locale[states.lang], [states.lang]);

  useEffect(() => {
    const fetchBookings = async () => {
      const currentAdmin = auth.currentUser;
      if (!currentAdmin) return;

      const snapshot = await getDocs(collection(db, "bookings"));
      const bookingsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(booking => booking.adminId === currentAdmin.uid); // 🟡 Faqat shu admin uchun

      setBookings(bookingsData);

      const serviceIds = [...new Set(bookingsData.map(b => b.serviceId))];
      const serviceMap = {};

      for (const id of serviceIds) {
        const serviceDoc = await getDoc(doc(db, "services", id));
        if (serviceDoc.exists()) {
          serviceMap[id] = serviceDoc.data();
        }
      }

      setServicesMap(serviceMap);
    };

    fetchBookings();
  }, []);


  const handleDelete = async (id) => {
    const confirm = window.confirm("Haqiqatan ham o‘chirmoqchimisiz?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "bookings", id));
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error("O‘chirishda xatolik:", err);
      alert("O‘chirishda xatolik yuz berdi");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status: newStatus });
      setBookings(prev =>
        prev.map(b => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error("Statusni o‘zgartirishda xatolik:", err);
      alert("Statusni o‘zgartirishda xatolik yuz berdi");
    }
  };


  const filteredBookings = useMemo(() => {
    if (!filterToday) return bookings;

    const today = new Date().toISOString().split("T")[0];
    return bookings.filter(booking => booking.time?.includes(today));
  }, [bookings, filterToday]);

  return (
    <div className="AdminBookingsPage">
      <h2>{langData.barcha_buyurtmalar}</h2>


      {filteredBookings.length === 0 ? (
        <p>{langData.buyurtmalar_yoq}</p>
      ) : (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{langData.ism}</th>
              <th>{langData.telefon}</th>
              <th>{langData.xizmat}</th>
              <th>{langData.manzil}</th>
              <th>Status</th>
              <th>{langData.ochirish}</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking, index) => {
              const service = servicesMap[booking.serviceId];
              return (
                <tr key={booking.id}>
                  <td>{index + 1}</td>
                  <td>{booking.name}</td>
                  <td>{booking.phone}</td>
                  <td>{service?.name || '...'}</td>
                  <td>{service?.workplace}, {service?.location}</td>
                  <td>
                    <span className={`status ${booking.status || ''}`}>
                      {booking.status || '...'}
                    </span>
                    <div className="status-buttons">
                      <button onClick={() => handleStatusChange(booking.id, "completed")}>✅ finished</button>
                      <button onClick={() => handleStatusChange(booking.id, "cancelled")}>❌ cancelled</button>
                    </div>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(booking.id)}>
                      {langData.ochirish}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      )}
    </div>
  );
}

export default AdminBookingsPage;
