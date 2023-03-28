import React, { useState, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { IoChevronBack } from 'react-icons/io5'
import { BsPiggyBank } from 'react-icons/bs'
import { FaExchangeAlt } from 'react-icons/fa'
import { BsPlusCircleFill } from 'react-icons/bs'
import { useForm } from 'react-hook-form';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { RiUserReceived2Line } from 'react-icons/ri'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Split() {
    const history = useHistory()
    const { id } = useParams()
    const splitsRef = collection(db, "splits");
    const {
        register,
        formState: { errors },
        getValues,
        reset,
        handleSubmit,
    } = useForm();
    const [showAddNewExpense, setShowAddNewExpense] = useState(false)
    const [startDate, setStartDate] = useState(new Date());
    const [split, setSplit] = useState()
    const [simpleAdvancedToggle, setSimpleAdvancedToggle] = useState("Simple")
    const [currentTab, setCurrentTab] = useState(1)
    const [sharedBy, setSharedBy] = useState([])
    const [sharedByChecks, setSharedByChecks] = useState()
    const [amount, setAmount] = useState(0)
    // const [total, setTotal] = useState(0)
    // const [numberOfNonCustom, setNumberOfNonCustom] = useState(0)
    const q = query(splitsRef, where("id", "==", id))
    const getCurrentSplit = async () => {
        const splitsData = await getDocs(q)
        const temp = []
        splitsData.docs.map(doc => {
            temp.push({ ...doc.data(), id: doc.id })
        })
        setSplit(temp[0])
        // setSharedBy([temp[0].participants[0]])
        setSharedByChecks(() => {
            const t = {}
            temp[0].participants.forEach((participant, index) => {
                // index === 0 ? t[participant] = true :
                t[participant] = false;
            })
            return t
        })
    }
    useEffect(() => {
        getCurrentSplit()
    }, [])
    // useEffect(() => {
    //     setTotal(amount)
    // }, [amount])
    // useEffect(() => {
    //     console.log("sharedBy.length:", sharedBy.length)
    //     setNumberOfNonCustom(sharedBy.length)
    // }, [sharedBy])

    //* on submit function
    const addNewExpense = (data) => {
        console.log("data:", data)

    }
    const addNewExpenseModal = <>
        <div className='' style={{ height: '100vh', width: '100vw', position: 'absolute', zIndex: '100', backgroundColor: '#171717' }}>
            <div style={{ borderBottom: '1.5px solid #9ec0e5' }} className='d-flex py-4 px-3 align-items-center'>
                <IoChevronBack onClick={() => { setShowAddNewExpense(false) }} style={{ fontSize: '2.5rem', color: '#9ec0e5' }} />
                <h5 className='mont mx-4 display-6'>Add New Expense</h5>
            </div>
            {split && <form onSubmit={handleSubmit(addNewExpense)} style={{ height: '90vh' }} className='mt-4 px-4' >
                <input type="text" className="form-control" placeholder="Title"
                    {...register("title", { required: "Title is Required" })}
                // style={{ width: '80%' }}
                />
                <div className="input-group mb-3">
                    <span className="input-group-text" id="basic-addon1">₹</span>
                    <input type="number"
                        value={amount}
                        onChange={(e) => {
                            setAmount(e.target.value)
                        }}
                        className="form-control"
                        // {...register("amount", { required: "Amount is Required" })} 
                        placeholder="Amount"
                    // style={{ width: '80%' }}
                    />
                </div>

                <div className='d-flex align-items-center'>
                    <span>Date:</span>
                    <DatePicker className="mx-3" dateFormat="PPP" selected={startDate} onChange={(date) => setStartDate(date)} />
                </div>

                <div className='d-flex align-items-center '>
                    <span>Paid By:</span>
                    <select
                        style={{ width: "50%" }}
                        className="form-select mx-3"
                        {...register("paidBy")}
                        aria-label="Default select example"
                    >
                        {split.participants.map(friend => {
                            return (<option key={Math.random()} value={friend}>{friend}</option>)
                        })}

                    </select>
                </div>
                <div className='mt-2' style={{ height: '50%', overflowY: 'scroll' }}>
                    <div className='d-flex align-items-center mb-4 justify-content-between'>
                        <h5 className='text-left '>Shared By:</h5>
                        <button type="button" onClick={() => {
                            setSimpleAdvancedToggle(previous => {
                                if (previous === 'Simple')
                                    return 'Advanced'
                                else
                                    return 'Simple'
                            })
                        }}>
                            {simpleAdvancedToggle}
                        </button>
                    </div>
                    {split.participants.map(friend => {
                        return <div key={Math.random()} className="form-check my-2 d-flex align-items-center justify-content-between">
                            <div className='d-flex align-items-center'>
                                <FormControlLabel control={<Checkbox onChange={(e) => {
                                    if (!sharedByChecks[friend]) {
                                        const temp = sharedBy
                                        temp.push(friend)
                                        setSharedBy(temp)
                                    }
                                    else {
                                        const temp = [...sharedBy]
                                        const index = temp.indexOf(friend);
                                        if (index > -1) { // only splice array when item is found
                                            temp.splice(index, 1); // 2nd parameter means remove one item only
                                        }
                                        setSharedBy([...temp])
                                    }
                                    setSharedByChecks(sharedByChecks => ({
                                        ...sharedByChecks,
                                        [friend]: !sharedByChecks[friend],
                                    }))
                                    console.log(sharedByChecks)
                                }} checked={sharedByChecks[friend]} />} label={friend} />
                            </div>
                            {simpleAdvancedToggle === 'Simple' ? <>
                                {amount ? <span>
                                    {sharedBy.includes(friend) ? "₹" + (amount / sharedBy.length).toFixed(2) : "₹ 0.00"}
                                </span> : <span>
                                    ₹ 0.00
                                </span>}
                            </> :
                                <input type="text" className="form-control" id="exampleFormControlInput1" placeholder={""}
                                    style={{ width: '40%' }}
                                />
                            }

                        </div>
                    })}
                </div>
                <button >
                    Submit
                </button>
            </form>}
        </div>
    </>
    let { nickname } = JSON.parse(localStorage.getItem("user"));
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
                        <h2 className='mont mx-4 display-6'>{split.title}</h2>
                    </div>
                    <div className='px-3' style={{ backgroundColor: split.balances[nickname] < 0 ? '#edbe90' : '#89e289', color: '#141414', borderRadius: '10px' }}>
                        ₹ {split.balances[nickname]}
                    </div>
                </div>
                <div className='mt-3 w-100 d-flex justify-content-around'>
                    <div style={{ borderBottom: currentTab === 1 ? '2px solid #cb2727' : undefined }} className='d-flex flex-column align-items-center' onClick={() => { setCurrentTab(1) }}>
                        <BsPiggyBank style={{ fontSize: '2rem' }} />
                        <p className=''>Expenses</p>
                    </div>
                    <div style={{ borderBottom: currentTab === 2 ? '2px solid #ffffff' : undefined }} className='d-flex flex-column align-items-center' onClick={() => { setCurrentTab(2) }}>
                        <FaExchangeAlt style={{ fontSize: '2rem' }} />
                        <p className=''>Balances</p>
                    </div>
                    <div style={{ borderBottom: currentTab === 3 ? '2px solid #89e289' : undefined }} className='d-flex flex-column align-items-center' onClick={() => { setCurrentTab(3) }}>
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