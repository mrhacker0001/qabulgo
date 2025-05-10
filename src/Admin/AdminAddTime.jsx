import React, { useState, useMemo } from 'react';
import { db } from '../Components/firebase';
import { collection, addDoc } from 'firebase/firestore';
import "./AdminServicesPage.css"
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";

function AdminAddTime({ serviceId }) {
    const [timeSlot, setTimeSlot] = useState("");
    const states = useStoreState();
    const langData = useMemo(() => locale[states.lang], [states.lang]);

    const handleAddTime = async () => {
        if (!timeSlot) return alert("Vaqtni kiriting");

        try {
            await addDoc(collection(db, "serviceTimes"), {
                serviceId,
                timeSlot,
                createdAt: new Date()
            });
            alert("Yangi vaqt qo‘shildi!");
            setTimeSlot("");
        } catch (err) {
            console.error("Xatolik:", err);
            alert("Vaqtni qo‘shishda xatolik yuz berdi");
        }
    };

    return (
        <div className='services-list'>
            <h4>{langData.dushanba}</h4>
            <input
                type="text"
                placeholder={langData.masalan}
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
            />
            <button onClick={handleAddTime}>{langData.qoshish}</button>
        </div>
    );
}

export default AdminAddTime;
