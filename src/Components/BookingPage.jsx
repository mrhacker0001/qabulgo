import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./BookingPage.css"
import { useStoreState } from "../Redux/selector";
import locale from "../localization/locale.json";

function BookingPage() {
  const states = useStoreState();
  const langData = useMemo(() => locale[states.lang], [states.lang]);

  return (
    <div className='BookingPage'>
      <div className="booking">
        <h1>{langData.buyurtma}</h1>
        <div className="inputs">
          <label>
            {langData.ism}
            <input type="text" name='text' />
          </label>
          <label>
            {langData.telefon}
            <input type="text" name='text' />
          </label>
          <label>
            {langData.vaqti}
            <select>
              <option value="time">26-aprel 10:30  12:30</option>
            </select>
          </label>
          <button>{langData.buyurtma}</button>

        </div>

      </div>
    </div>
  )
}

export default BookingPage