import React, { useState, useEffect } from 'react'
import './Addtrip.css'
import { db } from '../firebase-config';
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid'
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";

function Addsplit() {
  const [pageNo, setPageNo] = useState(1)
  const [currentFriend, setCurrentFriend] = useState('')
  const [friends, setFriends] = useState(() => {
    const { name } = JSON.parse(localStorage.getItem('user'))
    return [name]
  })
  const tripsRef = collection(db, "trips");
  const {
    register,
    formState: { errors },
    getValues,
    reset,
    handleSubmit,
  } = useForm();

  //* single render use effect
  useEffect(() => {

  }, [])

  //* Onsubmit function
  const submit = async (data) => {
    // if (newTrip === "") return;
    // await addDoc(tripsRef, {
    //   text: newTrip,
    //   createdAt: serverTimestamp()
    // });
    console.log(data)
  }

  //* Page components
  const page1 = <>
    <p style={{ fontSize: '2rem' }} className='mont'>Let's get ourselves a Name</p>
    <input
      onKeyDown={e => {
        if (e.keyCode === 13) {
          e.preventDefault();
          setPageNo(pageNo + 1)
        }
      }}
      type="text"
      {...register("title", { required: "Title is Required" })}
      className="new-trip-input m-2"
      placeholder="Name your Split"
    /></>
  const page2 = <><p style={{ fontSize: '2rem' }} className='mont'>Great! Now add some deets...</p><textarea
    rows="4"
    type="text"
    {...register("description")}
    className="new-trip-input m-2"
    placeholder="Add some Description"
  /></>
  const page3 = <><p style={{ fontSize: '2rem' }} className='mont'>Cool! Now let's choose Currency and Category...</p><select style={{ borderRadius: '20px', width: '50%' }} className="form-select"
    {...register("currency")} aria-label="Default select example">
    <option value="rupee">₹ Rupee</option>
    <option value="dollar">$ Dollar</option>
    <option value="pound">£ Pound</option>
  </select>

    <select style={{ borderRadius: '20px', width: '50%' }} className="form-select mb-3"
      {...register("category")} aria-label="Default select example">
      <option value="trip">Trip</option>
      <option value="house">Shared House</option>
      <option value="event">Event</option>
      <option value="project">Project</option>
    </select></>
  const page4 = <>
    <p style={{ fontSize: '2rem' }} className='mont'>Perfecto! Let's add some buddies!</p>
    {Array.isArray(friends) && friends?.map((friend, index) => {
      return <span className='px-2' style={{ backgroundColor: 'rgba(128,128,128,0.4)', borderRadius: '15px' }} key={uuidv4()}>
        {friend}
        <span onClick={() => {
          console.log('hi')
          setFriends(previousFriends => previousFriends.filter(i => i !== index))
        }}> <RxCross2 /></span>
      </span>
    })}
    <div className='d-flex'>

      <input
        type="text"
        style={{ width: '80%', borderRadius: '20px 0 0 20px' }}
        value={currentFriend}
        onChange={e => setCurrentFriend(e.target.value)}
        className="new-trip-input "
        placeholder="Add a friend"
        onKeyDown={e => {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        }}
      />
      <button type='button' onClick={
        () => {
          if (currentFriend !== '' && !friends.includes(currentFriend)) {
            setFriends([...friends, currentFriend])
            setCurrentFriend('')
          }
        }
      } style={{ borderRadius: '0 20px 20px 0' }}>add</button>
    </div>
  </>
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

        {pageNo === 1 && page1}
        {pageNo === 2 && page2}
        {pageNo === 3 && page3}
        {pageNo === 4 && page4}


        <button className="button1"
          type='button' onClick={() => {
            const { title } = getValues()
            if (pageNo === 1 && title)
              setPageNo(pageNo + 1)
            else if (pageNo !== 1)
              setPageNo(pageNo + 1)
          }}>
          Next
        </button>

      </form>
    </div>
  )
}

export default Addsplit