import React, { useMemo, useState } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { db } from "../Components/firebase";
import "./AdminServicesPage.css";
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";

function AdminServicesPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [workplace, setWorkplace] = useState('');
  const states = useStoreState();
  const langData = useMemo(() => locale[states.lang], [states.lang]);

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

      // maydonlarni tozalaymiz
      setName('');
      setPrice('');
      setDuration('');
      setLocation('');
      setWorkplace('');
    } catch (error) {
      console.error("Xizmat qo‘shishda xatolik:", error);
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
    </div>
  );
}

export default AdminServicesPage;
