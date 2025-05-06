import React, { useEffect, useMemo, useState } from 'react';
import "./HomePage.css";
import logo1 from "./assets/qabulgo2-Photoroom.png";
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // Firebase config
import { useNavigate } from "react-router-dom";

function HomePage() {
    const states = useStoreState();
    const langData = useMemo(() => locale[states.lang], [states.lang]);

    const [services, setServices] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "services"));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setServices(data);
            } catch (error) {
                console.error("Xizmatlarni olishda xatolik:", error);
            }
        };

        fetchServices();
    }, []);

    const handleBooking = (serviceId) => {
        navigate(`/BookingPage/${serviceId}`);
    };

    return (
        <div className='HomePage'>
            <div className="first-page">
                <img src={logo1} alt="" />
                <div className="right-side">

                </div>
            </div>

            <div className="service-card">
                {services.map(service => (
                    <div className="service-cart" key={service.id}>
                        <h2>{service.name}</h2>
                        <p>{langData.narx}: {service.price} so‘m</p>
                        <p>{langData.vaqt}: {service.duration} daqiqa</p>
                        <button onClick={() => handleBooking(service.id)}>
                            {langData.buyurtma}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomePage;
