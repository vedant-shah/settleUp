import React, { useState, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { IoChevronBack } from 'react-icons/io5'
import { BsPiggyBank } from 'react-icons/bs'
import { FaExchangeAlt } from 'react-icons/fa'
import { BsPlusCircleFill } from 'react-icons/bs'
import { RiUserReceived2Line } from 'react-icons/ri'
function Split() {
    const history = useHistory()
    const { id } = useParams()
    const splitsRef = collection(db, "splits");
    const [split, setSplit] = useState()
    const [currentTab, setCurrentTab] = useState(1)
    const q = query(splitsRef, where("id", "==", id))
    const getCurrentSplit = async () => {
        const splitsData = await getDocs(q)
        const temp = []
        splitsData.docs.map(doc => {
            temp.push({ ...doc.data(), id: doc.id })
        })
        setSplit(temp[0])
    }
    useEffect(() => {
        getCurrentSplit()
    }, [])

    return (<>
        {split && <div style={{ height: '100vh', width: '100vw' }}>
            <div
                className="d-flex justify-content-center flex-column p-0 align-items-start"
                style={{
                    position: "stickyTop",
                    // top: "0",
                    width: "100vw",
                    // borderRadius: '0 0 20px 20px',
                    backgroundColor: "#141414",
                }}>
                <div className='d-flex p-2 align-items-center'>
                    <IoChevronBack onClick={() => { history.push('/home') }} style={{ fontSize: '2.5rem', color: '#9ec0e5' }} />
                    <h2 className='mont mx-4 display-4'>{split.title}</h2>
                </div>
                <div className='mt-3 w-100 d-flex justify-content-around'>
                    <div style={{ borderBottom: currentTab === 1 ? '2px solid #cb2727' : undefined }} onClick={() => { setCurrentTab(1) }}>
                        <BsPiggyBank style={{ fontSize: '2rem' }} />
                        <p className=''>Expenses</p>
                    </div>
                    <div style={{ borderBottom: currentTab === 2 ? '2px solid #ffffff' : undefined }} onClick={() => { setCurrentTab(2) }}>
                        <FaExchangeAlt style={{ fontSize: '2rem' }} />
                        <p className=''>Balances</p>
                    </div>
                    <div style={{ borderBottom: currentTab === 3 ? '2px solid #89e289' : undefined }} onClick={() => { setCurrentTab(3) }}>
                        <RiUserReceived2Line style={{ fontSize: '2rem' }} />
                        <p className=''>Mine</p>
                    </div>

                </div>
            </div>
            <BsPlusCircleFill className='button' onClick={() => { history.push("/addsplit") }} />
        </div>}
    </>)
}

export default Split