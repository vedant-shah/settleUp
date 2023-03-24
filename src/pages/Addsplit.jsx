import React, { useState, useEffect } from "react";
import "./Addtrip.css";
import { db } from "../firebase-config";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { RxCross2 } from "react-icons/rx";
import { useHistory } from "react-router-dom";

function Addsplit() {
  const history = useHistory()
  const [pageNo, setPageNo] = useState(1);
  const [currentFriend, setCurrentFriend] = useState("");
  const [friends, setFriends] = useState(() => {
    const { name } = JSON.parse(localStorage.getItem("user"));
    return [name.substring(0, name.indexOf(' '))];
  });
  const [userSplits, setUserSplits] = useState()
  const splitsRef = collection(db, "splits");
  const userSplitsRef = collection(db, "userSplits");
  const {
    register,
    formState: { errors },
    getValues,
    reset,
    handleSubmit,
  } = useForm();

  //* single render use effect
  useEffect(() => { }, []);

  //* Onsubmit function
  const submit = async (data) => {
    try {
      //*current users email
      const { email } = JSON.parse(localStorage.getItem("user"));

      //*user fields to be added before submitting
      data.id = uuidv4()
      data.participants = friends
      data.expenses = {}
      data.balances = {}
      data.reimbursement = []
      data.individualExpenses = {}
      data.participantsWithEmail = {}
      friends.forEach((f, i) => {
        data.balances[f] = 0
        data.individualExpenses[f] = 0
        if (i === 0)
          data.participantsWithEmail[f] = email
        else
          data.participantsWithEmail[f] = ''
      })
      data.createdAt = new Date()
      data.createdBy = friends[0]
      console.log(data);

      //* Submitting new split
      await addDoc(splitsRef, data);

      //* Adding this current split to the users Array.
      //query
      const q = query(userSplitsRef, where("email", "==", email))

      const userSplitsData = await getDocs(q)
      //*adding all the data retrieved into array called temp
      const temp = []
      userSplitsData.docs.map(doc => {
        temp.push({ ...doc.data(), id: doc.id })
      })

      //* if no doc is retrieved, then initialize else update
      if (temp?.length === 0) {
        const newUserSplit = {
          email,
          allUserSplits: [data.id]
        }
        await addDoc(userSplitsRef, newUserSplit);
        console.log("success")
      }
      else {
        const { allUserSplits, id } = temp[0]
        allUserSplits.push(data.id)

        const userDocInstance = doc(db, "userSplits", id)
        await updateDoc(userDocInstance, { allUserSplits: allUserSplits })
      }

      //* navigate on success
      history.push("/home")
    } catch (error) {
      console.log("error:", error)
    }
  };

  //* Page components
  const page1 = (
    <>
      <p style={{ fontSize: "2rem" }} className="mont">
        Let's get ourselves a Name
      </p>
      <input
        onKeyDown={(e) => {
          if (e.keyCode === 13) {
            e.preventDefault();
            setPageNo(pageNo + 1);
          }
        }}
        type="text"
        {...register("title", { required: "Title is Required" })}
        className="new-trip-input m-2"
        placeholder="Name your Split"
      />
    </>
  );
  const page2 = (
    <>
      <p style={{ fontSize: "2rem" }} className="mont">
        Great! Now add some deets...
      </p>
      <textarea
        rows="4"
        type="text"
        {...register("description")}
        className="new-trip-input m-2"
        placeholder="Add some Description"
      />
    </>
  );
  const page3 = (
    <>
      <p style={{ fontSize: "2rem" }} className="mont">
        Cool! Now let's choose Currency and Category...
      </p>
      <select
        style={{ borderRadius: "20px", width: "50%" }}
        className="form-select"
        {...register("currency")}
        aria-label="Default select example"
      >
        <option value="rupee">₹ Rupee</option>
        <option value="dollar">$ Dollar</option>
        <option value="pound">£ Pound</option>
      </select>

      <select
        style={{ borderRadius: "20px", width: "50%" }}
        className="form-select mb-3"
        {...register("category")}
        aria-label="Default select example"
      >
        <option value="trip">Trip</option>
        <option value="house">Shared House</option>
        <option value="event">Event</option>
        <option value="project">Project</option>
      </select>
    </>
  );
  const page4 = (
    <>
      <p style={{ fontSize: "2rem" }} className="mont">
        Perfecto! Let's add some buddies!
      </p>
      <div className="d-flex" style={{ flexWrap: "wrap" }}>
        {Array.isArray(friends) &&
          friends?.map((friend, index) => {
            return (
              <span
                className="px-2 m-1"
                style={{
                  backgroundColor: "rgba(128,128,128,0.4)",
                  borderRadius: "15px",
                }}
                key={uuidv4()}
              >
                {friend}
                <span
                  onClick={() => {
                    setFriends((current) =>
                      current.filter((value, i) => i !== index)
                    );
                  }}
                >
                  {" "}
                  <RxCross2 />
                </span>
              </span>
            );
          })}
      </div>
      <div className="d-flex mt-4">
        <input
          type="text"
          style={{ width: "80%", borderRadius: "20px 0 0 20px" }}
          value={currentFriend}
          onChange={(e) => setCurrentFriend(e.target.value)}
          className="new-trip-input "
          placeholder="Add a friend"
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              e.preventDefault();
              if (currentFriend !== "" && !friends.includes(currentFriend)) {
                setFriends([...friends, currentFriend]);
                setCurrentFriend("");
              }
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (currentFriend !== "" && !friends.includes(currentFriend)) {
              setFriends([...friends, currentFriend]);
              setCurrentFriend("");
            }
          }}
          style={{ borderRadius: "0 20px 20px 0", backgroundColor: "#65b9e6" }}
        >
          add
        </button>
      </div>
    </>
  );
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
      <form
        onSubmit={handleSubmit(submit)}
        className="new-trip-form d-flex align-items-center justify-content-center"
      >
        {pageNo === 1 && page1}
        {pageNo === 2 && page2}
        {pageNo === 3 && page3}
        {pageNo === 4 && page4}

        {pageNo !== 4 && <button
          className="button1"
          type="button"
          onClick={() => {
            const { title } = getValues();
            if (pageNo === 1 && title) setPageNo(pageNo + 1);
            else if (pageNo !== 1) setPageNo(pageNo + 1);
          }}
        >
          Next
        </button>}

        {pageNo === 4 && <button
          style={{ width: "50%" }}
          disabled={friends.length <= 1 ? true : false}
          className="btn btn-outline-info my-5"
          type="submit"
        >
          Finish
        </button>}
      </form>
    </div>
  );
}

export default Addsplit;
