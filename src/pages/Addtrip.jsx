import React from 'react'
import  './Addtrip.css'
import { useState } from "react";
import { db } from '../firebase-config';
import {
    collection,
    addDoc,
    serverTimestamp,
  } from "firebase/firestore";

function Addtrip() {
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (newTrip === "") return;
    await addDoc(tripsRef, {
      text: newTrip,
      createdAt: serverTimestamp()
    });
    setNewTrip("");
    } 
        const [newTrip, setNewTrip] = useState("");
        const tripsRef = collection(db, "trips");
    return (
        <div>
            
            <form onSubmit={handleSubmit} className="new-trip-form">
        <input
          type="text"
          onChange={(event) => setNewTrip(event.target.value)}
          value={newTrip}
          className="new-trip-input"
          placeholder="Name your trip"
        />
       
        <button class="button1">
          Add
        </button>
        
      </form>
        </div>
    )
}

export default Addtrip