import React, { useState, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
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
    const [paidBy, setPaidBy] = useState("")
    const [sharedBy, setSharedBy] = useState([])
    const [sharedByChecks, setSharedByChecks] = useState()
    const [amount, setAmount] = useState(0)
    const [customAmountObject, setCustomAmountObject] = useState()
    const [total, setTotal] = useState(0)
    const [documentID, setDocumentID] = useState('')
    const [numberOfNonCustom, setNumberOfNonCustom] = useState(0)
    const q = query(splitsRef, where("id", "==", id))
    const getCurrentSplit = async () => {
        const splitsData = await getDocs(q)
        const temp = []
        splitsData.docs.map(doc => {
            temp.push({ ...doc.data(), id })
            setDocumentID(doc.id)
        })
        console.log("temp:", temp)
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
        setCustomAmountObject(() => {
            const t = {}
            temp[0].participants.forEach((participant, index) => {
                // index === 0 ? t[participant] = true :
                t[participant] = undefined;
            })
            return t
        })
    }
    useEffect(() => {
        getCurrentSplit()
    }, [])
    useEffect(() => {
        setTotal(amount)
    }, [amount])
    useEffect(() => {
        let count = 0;

        for (let key in sharedByChecks) {
            if (sharedByChecks[key] === true && !customAmountObject[key]) {
                count++;
            }
        }
        setNumberOfNonCustom(count)
    }, [sharedByChecks])

    //* on submit function
    const addNewExpense = async (data) => {
        data["amount"] = amount
        data["date"] = startDate
        data["sharedBy"] = sharedBy
        data["paidBy"] = paidBy

        const temp = {}
        if (simpleAdvancedToggle === 'Simple') {
            const splitValue = Number((amount / sharedBy.length).toFixed(2))
            for (let key in sharedByChecks) {
                if (sharedByChecks[key])
                    temp[key] = splitValue
            }
            data["amountPerPerson"] = temp
        }
        else {
            for (let key in sharedByChecks) {
                const splitValue = Number((total / numberOfNonCustom).toFixed(2))
                if (sharedByChecks[key] && customAmountObject[key]) {
                    temp[key] = customAmountObject[key]
                }
                else if (sharedByChecks[key] && !customAmountObject[key]) {
                    temp[key] = splitValue

                }
            }
            data["amountPerPerson"] = temp
        }
        console.log("data:", data)
        console.log("split:", split)
        const { expenses, balances, individualExpenses } = split
        expenses.push(data)
        sharedBy.forEach(person => {
            balances[person] -= data.amountPerPerson[person]
            individualExpenses[person] += data.amountPerPerson[person]
        })
        balances[paidBy] += Number(data.amount)
        setSplit({ ...split, expenses, balances })
        const localSplit = { ...split, expenses, balances }
        const { id } = split
        console.log("id:", id)
        try {
            const userDocInstance = doc(db, "splits", documentID)
            await updateDoc(userDocInstance, localSplit)
            // history.push(`/split/${id}`)
            location.reload()
        } catch (error) {
            console.log("error:", error)

        }

    }
    const addNewExpenseModal = <>
        <div className='' style={{ height: '100vh', width: '100vw', position: 'absolute', zIndex: '100', backgroundColor: '#171717' }}>
            <div style={{ borderBottom: '1.5px solid #9ec0e5' }} className='d-flex py-4 px-3 align-items-center'>
                <IoChevronBack onClick={() => { setShowAddNewExpense(false) }} style={{ fontSize: '2.5rem', color: '#9ec0e5' }} />
                <h5 className='mont mx-4 display-6'>Add New Expense</h5>
            </div>
            {split && <form onSubmit={handleSubmit(addNewExpense)} style={{ height: '85vh' }} className='mt-4 px-4' >
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
                        // {...register("paidBy")}
                        value={paidBy}
                        onChange={e => {
                            setPaidBy(e.target.value)
                        }}
                        aria-label="Default select example"
                    >
                        {split.participants.map(friend => {
                            return (<option key={Math.random()} value={friend}>{friend}</option>)
                        })}

                    </select>
                </div>
                <div className='mt-2' style={{ height: '50%', }}>
                    <div className='d-flex align-items-center mb-4 justify-content-between' style={{ backgroundColor: '#171717' }}>
                        <h5 className='text-left '>Shared By:</h5>
                        <button type="button" onClick={() => {
                            setSimpleAdvancedToggle(previous => {
                                console.log("previous:", previous)
                                if (previous === 'Simple')
                                    return 'Advanced'
                                else {
                                    setCustomAmountObject(() => {
                                        const t = {}
                                        split.participants.forEach((participant, index) => {
                                            // index === 0 ? t[participant] = true :
                                            t[participant] = undefined;
                                        })
                                        return t
                                    })
                                    setTotal(amount)
                                    return 'Simple'
                                }
                            })


                        }}>
                            {simpleAdvancedToggle}
                        </button>
                    </div>
                    <div style={{ overflowY: 'scroll', height: '80%' }}>

                        {amount > 0 && split.participants.map(friend => {
                            return <div key={friend} className="form-check my-2 d-flex align-items-center justify-content-between">
                                <div className='d-flex align-items-center'>
                                    <FormControlLabel control={<Checkbox onChange={(e) => {
                                        if (!e.target.checked) {
                                            customAmountObject[friend] = undefined
                                            setTotal(() => {
                                                let temp = amount;
                                                Object.values(customAmountObject).forEach((value) => {
                                                    if (value)
                                                        temp -= value
                                                })
                                                return temp
                                            })
                                            let count = 0;

                                            for (let key in sharedByChecks) {
                                                if (sharedByChecks[key] === true && !customAmountObject[key]) {
                                                    count++;
                                                }
                                            }
                                            if (simpleAdvancedToggle === 'Advanced') {
                                                const textInput = document.getElementById(friend)
                                                textInput.value = ''
                                                setNumberOfNonCustom(count)
                                            }
                                        }
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
                                            customAmountObject[friend] = undefined
                                        }
                                        setSharedByChecks(sharedByChecks => ({
                                            ...sharedByChecks,
                                            [friend]: !sharedByChecks[friend],
                                        }))
                                    }} checked={sharedByChecks[friend]} />} label={friend} />
                                </div>
                                {simpleAdvancedToggle === 'Simple' ? <>
                                    {amount ? <span>
                                        {sharedBy.includes(friend) ? "₹" + (amount / sharedBy.length).toFixed(2) : "₹ 0.00"}
                                    </span> : <span>
                                        ₹ 0.00
                                    </span>}
                                </> :
                                    <input type="number" id={friend} className="form-control"
                                        value={customAmountObject[friend]}
                                        disabled={!sharedByChecks[friend]}
                                        onBlur={(e) => {
                                            if (e.target.value !== '') {
                                                // setNumberOfNonCustom(() => {
                                                //     let count = 0
                                                //     Object.values(customAmountObject).forEach(value => {
                                                //         if (!value)
                                                //             count++
                                                //     })
                                                //     return count
                                                // })
                                                setTotal(total - e.target.value)
                                                setCustomAmountObject({
                                                    ...customAmountObject, [friend]: Number(Number((e.target.value)).toFixed(2))
                                                })
                                                setTotal(() => {
                                                    let temp = amount;
                                                    Object.values(customAmountObject).forEach((value) => {
                                                        if (value)
                                                            temp -= value
                                                    })
                                                    return temp
                                                })
                                            }
                                        }}
                                        onChange={(e) => {
                                            if (e.target.value !== '') {
                                                setCustomAmountObject({
                                                    ...customAmountObject, [friend]: Number(Number((e.target.value)).toFixed(2))
                                                })
                                            }
                                            let count = 0;

                                            for (let key in sharedByChecks) {
                                                if (sharedByChecks[key] === true && !customAmountObject[key]) {
                                                    count++;
                                                }
                                            }
                                            setNumberOfNonCustom(count)

                                        }}
                                        placeholder={sharedByChecks[friend] ? (total / numberOfNonCustom).toFixed(2)
                                            : ""
                                        }
                                        style={{ width: '40%' }}
                                    />
                                }

                            </div>
                        })}
                    </div>
                </div>
                <button disabled={amount > 0 && sharedBy.length >= 1 ? false : true} >
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