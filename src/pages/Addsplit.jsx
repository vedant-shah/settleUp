import React, { useState } from 'react'
import './Addtrip.css'
import { db } from '../firebase-config';
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid'
import { useForm } from "react-hook-form";

function Addsplit() {
  const [pageNo, setPageNo] = useState(1)
  const tripsRef = collection(db, "trips");
  const {
    register,
    formState: { errors },
    getValues,
    reset,
    handleSubmit,
  } = useForm();
  const submit = async (data) => {
    // if (newTrip === "") return;
    // await addDoc(tripsRef, {
    //   text: newTrip,
    //   createdAt: serverTimestamp()
    // });
    console.log(data)
  }
  // const split = {
  //   id,
  //   title,
  //   description,
  //   currency,
  //   category,
  //   participants: [],
  //   expenses: {},
  //   balances:{},
  // createdAt,
  // createdBy,
  // reimbursement:{
  //   from,
  //   to,
  //   amount,
  //   time
  // }
  // }
  return (
    <div>

      <form onSubmit={handleSubmit(submit)} className="new-trip-form d-flex align-items-center justify-content-center">
        <input
          type="text"
          {...register("title", { required: "Title is Required" })}
          className="new-trip-input m-2"
          placeholder="Name your Split"
        />
        <textarea
          rows="4"
          type="text"
          {...register("description")}
          className="new-trip-input m-2"
          placeholder="Add some Description"
        />

        <button className="button1">
          Add
        </button>

      </form>
    </div>
  )
}

export default Addsplit