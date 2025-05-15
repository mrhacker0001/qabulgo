import React, { useMemo, useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
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
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const servicesSnapshot = await getDocs(collection(db, "services"));
      const servicesData = await Promise.all(
        servicesSnapshot.docs.map(async (doc) => {
          const service = { id: doc.id, ...doc.data() };

          // Shu xizmatga bog'langan vaqtlarni olish
          const timeQuery = query(collection(db, "serviceTimes"), where("serviceId", "==", doc.id));
          const timeSnapshot = await getDocs(timeQuery);
          const times = timeSnapshot.docs.map(t => t.data().timeSlot);

          return { ...service, times };
        })
      );
      setServices(servicesData);
    } catch (error) {
      console.error("Ma'lumotlarni olishda xatolik:", error);
    }
  };

  const handleAddService = async () => {
    if (!name || !price || !duration || !location || !workplace) {
      alert("Iltimos, barcha maydonlarni to‘ldiring.");
      return;
    }

    try {
      await addDoc(collection(db, "services"), {
        name,
        price: Number(price),
        duration: Number(duration),
        location,
        workplace,
      });

      // Formani tozalash
      setName('');
      setPrice('');
      setDuration('');
      setLocation('');
      setWorkplace('');

      fetchServices();
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
      fetchServices(); // Yangi vaqtlarni qayta yuklash
    } catch (err) {
      console.error("Vaqt qo‘shishda xatolik:", err);
      alert("Vaqtni qo‘shishda xatolik yuz berdi");
    }
  };

  return (
    <div className='AdminServicesPage'>
      <div className="form">
        <h2>{langData.yangi}</h2>

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
          type="number"
          placeholder={langData.vaqt}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
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

        <button onClick={handleAddService}>{langData.qoshish}</button>
      </div>

      <hr />

      <div className="service-list-section">
        <h3>{langData.mavjud_xizmatlar || "Mavjud xizmatlar"}</h3>
        {services.map(service => (
          <div key={service.id} className="admin-service">
            <h4>{service.name}</h4>

            {/* Avvaldan mavjud vaqtlar */}
            <div className="existing-times">
              <strong>{langData.bosh_vaqtlar || "Bo‘sh vaqtlar"}:</strong>
              {service.times && service.times.length > 0 ? (
                <ul>
                  {service.times.map((time, idx) => (
                    <li key={idx}>{time}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontStyle: "italic", color: "gray" }}>
                  {langData.vaqt_yoq || "Hali vaqt qo‘shilmagan"}
                </p>
              )}
            </div>

            {/* Yangi vaqt qo‘shish */}
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
