import React, { useEffect, useState, useMemo } from 'react';
import {
  collection, getDocs, doc, getDoc, deleteDoc, updateDoc
} from 'firebase/firestore';
import { db, auth } from '../Components/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";
import './AdminBookingsPage.css';

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [servicesMap, setServicesMap] = useState({});
  const [currentFilter, setCurrentFilter] = useState('today');
  const [currentAdminId, setCurrentAdminId] = useState(null);

  const states = useStoreState();
  const langData = useMemo(() => locale[states.lang], [states.lang]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentAdminId(user.uid);
        try {
          const snapshot = await getDocs(collection(db, "bookings"));
          const bookingsData = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(booking => booking.adminId === user.uid);

          setBookings(bookingsData);

          const serviceIds = [...new Set(bookingsData.map(b => b.serviceId).filter(id => !!id))];
          const serviceMap = {};

          for (const id of serviceIds) {
            if (!id) continue;
            try {
              const serviceDoc = await getDoc(doc(db, "services", id));
              if (serviceDoc.exists()) {
                serviceMap[id] = serviceDoc.data();
              }
            } catch (err) {
              console.error("Xizmatni olishda xatolik:", err);
            }
          }

          setServicesMap(serviceMap);
        } catch (err) {
          console.error("Bookinglarni olishda xatolik:", err);
        }
      }
    });

    return () => unsubscribe();
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
    const today = new Date().toISOString().split("T")[0];
    switch (currentFilter) {
      case 'today':
        return bookings.filter(booking => booking.time?.includes(today));
      case 'completed':
        return bookings.filter(b => b.status === "completed");
      case 'cancelled':
        return bookings.filter(b => b.status === "cancelled");
      default:
        return bookings;
    }
  }, [bookings, currentFilter]);

  const totalStats = useMemo(() => ({
    all: bookings.length,
    today: bookings.filter(b => b.time?.includes(new Date().toISOString().split("T")[0])).length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  }), [bookings]);

  return (
    <div className="AdminBookingsPage">
      <h2>{langData.barcha_buyurtmalar}</h2>

      <div className="filter-buttons">
        <button onClick={() => setCurrentFilter('today')}>{langData.bugungi}</button>
        <button onClick={() => setCurrentFilter('all')}>{langData.barchasi}</button>
        <button onClick={() => setCurrentFilter('completed')}>✅ {langData.tugatildi}</button>
        <button onClick={() => setCurrentFilter('cancelled')}>❌ {langData.bekor_qilingan}</button>
      </div>

      <div className="booking-stats">
        <p>{langData.barchasi}: {totalStats.all}</p>
        <p>{langData.bugungi}: {totalStats.today}</p>
        <p>{langData.tugatildi}: {totalStats.completed}</p>
        <p>{langData.bekor_qilingan}: {totalStats.cancelled}</p>
      </div>

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
                  <td>{booking?.service || langData.xizmat_topilmadi}</td>
                  <td>{booking ? `${booking.adress}` : '...'}</td>
                  <td>
                    <span className={`status ${booking.status || ''}`}>
                      {booking.status || '...'}
                    </span>
                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <div className="status-buttons">
                        <button onClick={() => handleStatusChange(booking.id, "completed")}>✅ finished</button>
                        <button onClick={() => handleStatusChange(booking.id, "cancelled")}>❌ cancelled</button>
                      </div>
                    )}
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
