import React, { useMemo, useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../Components/firebase";
import "./AdminServicesPage.css";
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";

function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [editId, setEditId] = useState(null);

  const states = useStoreState();
  const langData = useMemo(() => locale[states.lang], [states.lang]);

  // 🔄 Firestore'dan xizmatlar ro'yxatini olish (faqat o‘zini)
  useEffect(() => {
    const fetchServices = async () => {
      const currentAdmin = auth.currentUser;
      if (!currentAdmin) return;

      const snapshot = await getDocs(collection(db, "services"));
      const servicesData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(service => service.adminId === currentAdmin.uid);

      setServices(servicesData);
    };
    fetchServices();
  }, []);

  // ➕ Yangi xizmat qo‘shish yoki mavjudini yangilash
  const handleAddOrUpdate = async () => {
    if (!name || !price || !location || !workplace) {
      alert("Iltimos, barcha maydonlarni to‘ldiring.");
      return;
    }

    const currentAdmin = auth.currentUser;
    if (!currentAdmin) {
      alert("Admin aniqlanmadi.");
      return;
    }

    try {
      if (editId) {
        // ✏️ Tahrirlash
        await updateDoc(doc(db, "services", editId), {
          name,
          price: Number(price),
          location,
          workplace,
        });

        setServices(prev =>
          prev.map(service =>
            service.id === editId
              ? { ...service, name, price: Number(price), location, workplace }
              : service
          )
        );
        setEditId(null);
      } else {
        // ➕ Qo‘shish
        const docRef = await addDoc(collection(db, "services"), {
          name,
          price: Number(price),
          location,
          workplace,
          adminId: currentAdmin.uid,
        });

        setServices(prev => [
          ...prev,
          {
            id: docRef.id,
            name,
            price: Number(price),
            location,
            workplace,
            adminId: currentAdmin.uid,
          },
        ]);
      }

      // 🔄 Tozalash
      setName('');
      setPrice('');
      setLocation('');
      setWorkplace('');
    } catch (error) {
      console.error("Xizmat qo‘shishda xatolik:", error);
    }
  };

  // ❌ O‘chirish
  const handleDelete = async (id) => {
    const confirm = window.confirm("Haqiqatan ham o‘chirmoqchimisiz?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "services", id));
      setServices(prev => prev.filter(service => service.id !== id));
    } catch (error) {
      console.error("O‘chirishda xatolik:", error);
      alert("Xizmatni o‘chirishda xatolik yuz berdi.");
    }
  };

  // ✏️ Tahrirlashni boshlash
  const handleEdit = (service) => {
    setName(service.name);
    setPrice(service.price);
    setLocation(service.location);
    setWorkplace(service.workplace);
    setEditId(service.id);
  };

  // 📊 Statistika
  const totalServices = services.length;
  const avgPrice = totalServices > 0
    ? (
      services.reduce((sum, s) => sum + Number(s.price), 0) / totalServices
    ).toFixed(2)
    : 0;

  return (
    <div className='AdminServicesPage'>
      <div className="form">
        <h2>{editId ? langData.tahrirlash : langData.yangi}</h2>

        <input
          type="text"
          placeholder={langData.nom}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder={langData.narx}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="text"
          placeholder={langData.place}
          value={workplace}
          onChange={(e) => setWorkplace(e.target.value)}
        />
        <input
          type="text"
          placeholder={langData.joylashuv}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button onClick={handleAddOrUpdate}>
          {editId ? langData.saqlash : langData.qoshish}
        </button>
      </div>

      <div className="stats">
        <h3>{langData.statistika}</h3>
        <p>{langData.jami_xizmatlar}: {totalServices}</p>
        <p>{langData.ortalacha_narx}: {avgPrice} UZS</p>
      </div>

      <div className="servicess-list">
        <h2>{langData.barcha_xizmatlar}</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>{langData.nom}</th>
              <th>{langData.narx}</th>
              <th>{langData.place}</th>
              <th>{langData.joylashuv}</th>
              <th>{langData.tahrirlash}</th>
              <th>{langData.ochirish}</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={service.id}>
                <td>{index + 1}</td>
                <td>{service.name}</td>
                <td>{service.price}</td>
                <td>{service.workplace}</td>
                <td>{service.location}</td>
                <td>
                  <button onClick={() => handleEdit(service)}>
                    {langData.tahrirlash}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDelete(service.id)}>
                    {langData.ochirish}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminServicesPage;
