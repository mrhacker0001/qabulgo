import React, { useMemo } from 'react';
import "./HomePage.css";
import logo1 from "./assets/qabulgo2-Photoroom.png";
import makeup from "./icons/makeup-pouch.png"
import plumber from "./icons/plumber.png"
import hairdresser from "./icons/barber.png"
import builder from "./icons/wall.png"
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";

function HomePage() {

    const states = useStoreState();
    const langData = useMemo(() => locale[states.lang], [states.lang]);

    const services = [
        { img: makeup, name: "Beauty shop" },
        { img: plumber, name: "Santexnik" },
        { img: hairdresser, name: "Sartarosh" },
        { img: builder, name: "Quruvchi" }
    ]

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
                        <img src={service.img} alt="" />
                        <h2>{service.name}</h2>
                        <button >
                            {langData.buyurtma}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomePage;
