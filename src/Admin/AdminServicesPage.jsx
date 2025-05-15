import React, { useMemo, useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../Components/firebase";
import "./AdminServicesPage.css";
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";

function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [timeInputs, setTimeInputs] = useState({});
  const states = useStoreState();
  const langData = useMemo(() => locale[states.lang], [states.lang]);

  useEffect(() => {
    const fetchServices = async () => {
      const snapshot = await getDocs(collection(db, "services"));
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesData);
    };
    fetchServices();
  }, []);

  const handleAddService = async () => {
    if (!name || !price || !duration || !location || !workplace) {
      alert("Iltimos, barcha maydonlarni to‘ldiring.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "services"), {
        name,
        price: Number(price),
        duration: Number(duration),
        location,
        workplace,
      });

      setServices(prev => [...prev, { id: docRef.id, name, price, duration, location, workplace }]);
      setName('');
      setPrice('');
      setDuration('');
      setLocation('');
      setWorkplace('');
    } catch (error) {
      console.error("Xizmat qo‘shishda xatolik:", error);
    }
  };

  const handleTimeChange = (serviceId, value) => {
    setTimeInputs(prev => ({ ...prev, [serviceId]: value }));
  };

  const handleAddTime = async (serviceId) => {
    const timeSlot = timeInputs[serviceId];
    if (!timeSlot) return alert("Vaqtni kiriting");

    try {
      await addDoc(collection(db, "serviceTimes"), {
        serviceId,
        timeSlot,
        createdAt: new Date()
      });
      alert("Yangi vaqt qo‘shildi!");
      setTimeInputs(prev => ({ ...prev, [serviceId]: "" }));
    } catch (err) {
      console.error("Xatolik:", err);
      alert("Vaqtni qo‘shishda xatolik yuz berdi");
    }
  };

  return (
    <div className='AdminServicesPage'>
      {/* Yangi xizmat qo‘shish formasi */}
      <div className="form">
        <h2>{langData.yangi}</h2>

        <input type="text" placeholder={langData.nom} value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" placeholder={langData.narx} value={price} onChange={(e) => setPrice(e.target.value)} />
        <input type="number" placeholder={langData.vaqt} value={duration} onChange={(e) => setDuration(e.target.value)} />
        <input type="text" placeholder={langData.place} value={workplace} onChange={(e) => setWorkplace(e.target.value)} />
        <input type="text" placeholder={langData.joylashuv} value={location} onChange={(e) => setLocation(e.target.value)} />

        <button onClick={handleAddService}>{langData.qoshish}</button>
      </div>

      {/* HR chizig‘i va mavjud xizmatlarga vaqt qo‘shish formasi */}
      <hr />

      <div className="service-list-section">
        {services.map(service => (
          <div key={service.id} className="admin-service">
            <h4>{service.name}</h4>
            <div className="services-list">
              <input
                type="text"
                placeholder={langData.masalan}
                value={timeInputs[service.id] || ""}
                onChange={(e) => handleTimeChange(service.id, e.target.value)}
              />
              <button onClick={() => handleAddTime(service.id)}>{langData.qoshish}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

}

export default AdminServicesPage;
