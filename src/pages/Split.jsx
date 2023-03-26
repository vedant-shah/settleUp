import React, { useState, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { IoChevronBack } from 'react-icons/io5'
import { BsPiggyBank } from 'react-icons/bs'
import { FaExchangeAlt } from 'react-icons/fa'
import { BsPlusCircleFill } from 'react-icons/bs'
import { RiUserReceived2Line } from 'react-icons/ri'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Split() {
    const history = useHistory()
    const { id } = useParams()
    const splitsRef = collection(db, "splits");
    const [showAddNewExpense, setShowAddNewExpense] = useState(false)
    const [startDate, setStartDate] = useState(new Date());
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

    const addNewExpenseModal = <>
        <div className='' style={{ height: '100vh', width: '100vw', position: 'absolute', zIndex: '100', backgroundColor: '#171717' }}>
            <div style={{ borderBottom: '1.5px solid #9ec0e5' }} className='d-flex py-4 px-3 align-items-center'>
                <IoChevronBack onClick={() => { setShowAddNewExpense(false) }} style={{ fontSize: '2.5rem', color: '#9ec0e5' }} />
                <h5 className='mont mx-4 display-6'>Add New Expense</h5>
            </div>
            {split && <form className='mt-4 px-4' >
                <input type="text" className="form-control" placeholder="Title"
                // style={{ width: '80%' }}
                />
                <div className="input-group mb-3">
                    <span className="input-group-text" id="basic-addon1">₹</span>
                    <input type="number" className="form-control" placeholder="Amount"
                    // style={{ width: '80%' }}
                    />
                </div>

                <div className='d-flex align-items-center'>
                    <span>Date:</span>
                    <DatePicker dateFormat={"dd/MM/yyyy"} selected={startDate} onChange={(date) => setStartDate(date)} />
                </div>

                <div className='d-flex align-items-center '>
                    <span>Paid By:</span>
                    <select
                        style={{ width: "50%" }}
                        className="form-select mx-3"
                        // {...register("currency")}
                        aria-label="Default select example"
                    >
                        {split.participants.map(friend => {
                            return (<option key={Math.random()} value={friend}>{friend}</option>)
                        })}

                    </select>
                </div>
            </form>}
        </div>
    </>
    let { name } = JSON.parse(localStorage.getItem("user"));
    name = name.substring(0, name.indexOf(' ')).toLowerCase()
    return (<>
        {split && <div style={{ height: '100vh', width: '100vw' }}>
            {showAddNewExpense && addNewExpenseModal}
            <div
                className="d-flex justify-content-center flex-column p-0 align-items-start"
                style={{
                    position: "stickyTop",
                    // top: "0",
                    width: "100vw",
                    // borderRadius: '0 0 20px 20px',
                    backgroundColor: "#141414",
                }}>
                <div className='d-flex w-100 px-4 align-items-center justify-content-between'>
                    <div className='d-flex py-3 align-items-center'>
                        <IoChevronBack onClick={() => { history.push('/home') }} style={{ fontSize: '2.5rem', color: '#9ec0e5' }} />
                        <h2 className='mont mx-4 display-4'>{split.title}</h2>
                    </div>
                    <div className='px-3' style={{ backgroundColor: split.balances[name] < 0 ? '#edbe90' : '#89e289', color: '#141414', borderRadius: '10px' }}>
                        ₹ {split.balances[name]}
                    </div>
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
            {currentTab === 1 && <BsPlusCircleFill className='button' onClick={() => { setShowAddNewExpense(true) }} />}
        </div>}
    </>)
}

export default Split