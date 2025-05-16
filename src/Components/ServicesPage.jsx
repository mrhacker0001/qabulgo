import React, { useMemo } from 'react';
import makeup from "./icons/makeup-pouch.png";
import plumber from "./icons/plumber.png";
import hairdresser from "./icons/barber.png";
import builder from "./icons/wall.png";
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";
import "./ServicesPage.css";
import { useNavigate } from 'react-router-dom';

function ServicesPage() {
    const states = useStoreState();
    const langData = useMemo(() => locale[states.lang], [states.lang]);
    const navigate = useNavigate();  // <-- To‘g‘ri chaqirish!

    const services = [
        { id: "beauty-shop", img: makeup, name: "Beauty shop" },
        { id: "plumber", img: plumber, name: "Santexnik" },
        { id: "hairdresser", img: hairdresser, name: "Sartarosh" },
        { id: "builder", img: builder, name: "Quruvchi" }
    ];

    return (
        <div className='ServicesPage'>
            <div className="service-card">
                {services.map(service => (
                    <div className="service-cart" key={service.id}>
                        <img src={service.img} alt={service.name} />
                        <h2>{service.name}</h2>
                        <button onClick={() => navigate(`/BookingPage/${service.id}`)}>
                            {langData.buyurtma}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ServicesPage;
