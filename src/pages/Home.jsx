import React, { useState, useEffect } from 'react'
import './home.css';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { BsPlusCircleFill } from "react-icons/bs";
import { FcNext } from "react-icons/fc";
import { useHistory } from 'react-router-dom';
import Topbar from './components/Topbar';
function Home() {
    useEffect(() => {
        if (!localStorage.getItem('user'))
            history.push("/signin")
    }, [])
    const history = useHistory()
    const { email } = JSON.parse(localStorage.getItem("user"));
    const userSplitsRef = collection(db, "userSplits");
    const q = query(userSplitsRef, where("email", "==", email))
    const [allSplitsOfCurrentUser, setAllSplitsOfCurrentUser] = useState()
    const getUserSplits = async () => {
        const userSplitsData = await getDocs(q)
        const temp = []
        userSplitsData.docs.map(doc => {
            temp.push({ ...doc.data(), id: doc.id })
        })
        setAllSplitsOfCurrentUser(temp);
    }
    useEffect(() => {
        getUserSplits()
    }, [])

    return (
        <>
            <Topbar />
            {/* {allSplitsOfCurrentUser && console.log(allSplitsOfCurrentUser[0])} */}
            <div className='p-3' style={{ height: '90vh', overflowY: 'scroll' }}>
                {
                    allSplitsOfCurrentUser?.length > 0 && Object.keys(allSplitsOfCurrentUser[0].allUserSplits).map(split => (
                        <div
                            onClick={() => {
                                const id = allSplitsOfCurrentUser[0].allUserSplits[split]

                                history.push(`/split/${id}`)
                            }}
                            key={Math.random()} className="d-flex align-items-center justify-content-between p-5 my-3" style={{ backgroundColor: '#1a1a1a', fontSize: '1.5rem', borderRadius: '25px', height: '5rem' }}>

                            <p className='m-0 mont' style={{ display: 'inline-flex', fontFamily: 'Delicious Handrawn' }}>{split}</p>
                            <FcNext />
                        </div>
                    ))
                }
            </div>
            <BsPlusCircleFill className='button' onClick={() => { history.push("/addsplit") }} />
        </>
    )
}

export default Home