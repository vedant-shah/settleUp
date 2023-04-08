import React, { useState, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
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
import Decimal from 'decimal.js';
import "react-datepicker/dist/react-datepicker.css";
import ExpensesList from './components/ExpensesList';
import ViewExpense from './components/ViewExpense';
import Balances from './components/Balances';
import Mine from './components/Mine';

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
    const [docID, setDocID] = useState()
    const [split, setSplit] = useState()
    const [showChooseNameModal, setShowChooseNameModal] = useState(false)
    const [showExpensesPage, setShowExpensesPage] = useState(false)
    const [viewExpenseObject, setViewExpenseObject] = useState()
    const [simpleAdvancedToggle, setSimpleAdvancedToggle] = useState("Simple")
    const [currentTab, setCurrentTab] = useState(1)
    const [paidBy, setPaidBy] = useState()
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
        // console.log(temp[0])
        setSplit(temp[0])
        const { email } = JSON.parse(localStorage.getItem('user'))
        const user = JSON.parse(localStorage.getItem('user'))
        if (!Object.values(temp[0].participantsWithEmail).includes(email)) {
            setShowChooseNameModal(true);
        }
        Object.keys(temp[0].participantsWithEmail).forEach(person => {
            if (temp[0].participantsWithEmail[person] === email) {
                user.nickname = person;
                localStorage.setItem("user", JSON.stringify(user))
            }
        })
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
        setPaidBy(temp[0].participants[0])
    }
    useEffect(() => {
        const { email } = JSON.parse(localStorage.getItem('user'))
        if (!email)
            history.push('/signin')
        else {
            getCurrentSplit()
        }
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
        console.dir("data:", data)
        console.log("split:", split)
        const { expenses, balances, individualExpenses } = split
        expenses.push(data)
        sharedBy.forEach(person => {
            const balancesNumeral = new Decimal(balances[person].toFixed(2))
            const amountPerPersonNumeral = new Decimal((data.amountPerPerson[person]).toFixed(2))
            balances[person] = (balancesNumeral.minus(amountPerPersonNumeral)).toNumber()
            individualExpenses[person] += data.amountPerPerson[person]
        })
        const balancesPaidByNumeral = new Decimal(balances[paidBy].toFixed(2))
        balances[paidBy] = (balancesPaidByNumeral.plus(new Decimal(Number(data.amount).toFixed(2)))).toNumber()
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
    const [choosenCharacter, setChoosenCharacter] = useState('')
    const chooseThisCharacter = async () => {
        let { participantsWithEmail } = split
        const { email } = JSON.parse(localStorage.getItem('user'))
        participantsWithEmail[choosenCharacter] = email
        const updatedSplit = { ...split, participantsWithEmail }
        const userDocInstance = doc(db, "userSplits", documentID)
        const splitsDocInstance = doc(db, "splits", documentID)
        await updateDoc(splitsDocInstance, updatedSplit)
        console.log("updatedSplit:", updatedSplit)

        const userSplitsRef = collection(db, "userSplits");
        const q = query(userSplitsRef, where("email", "==", email))

        const userSplitsData = await getDocs(q)
        //*adding all the data retrieved into array called temp
        const temp = []
        userSplitsData.docs.map(doc => {
            temp.push({ ...doc.data(), id: split.id })
            setDocID(doc.id)
        })
        console.log("temp:", temp[0])

        //* if no doc is retrieved, then initialize else update
        if (temp?.length === 0) {
            const newUserSplit = {
                email,
                allUserSplits: {}
            }
            newUserSplit.allUserSplits[split.title] = split.id

            await addDoc(userSplitsRef, newUserSplit);
        }
        else {
            const { allUserSplits, id } = temp[0]
            allUserSplits[split.title] = split.id
            try {
                const userDocInstance = doc(db, "userSplits", docID)
                await updateDoc(userDocInstance, { allUserSplits: allUserSplits })
            } catch (e) {
                console.log("e:", e)
            }
        }
        location.reload()
    }
    const chooseNameModal = <>
        {split && <div className='p-4 d-flex justify-content-center align-items-center flex-column' style={{ height: '100vh', width: '100vw', position: 'absolute', zIndex: '100', backgroundColor: '#171717' }}>
            {choosenCharacter.length > 0 && <div style={{ position: 'relative' }}> <img style={{ height: '15rem' }} src={`https://api.dicebear.com/6.x/adventurer/svg?scale=100&skinColor=9e5622,f2d3b1,ecad80&seed=${choosenCharacter}&radius=40&size=80`} alt="" /> </div>}
            <div className="card p-4 d-flex justify-content-center align-items-center">
                <h2 className='mont'>Hi, Welcome to {split.title} !</h2>
                <div className="dropdown my-3">

                    <select
                        style={{ borderRadius: "20px", width: "100%" }}
                        className="form-select"
                        aria-label="Default select example"
                        value={choosenCharacter}
                        onChange={(e) => {
                            setChoosenCharacter(e.target.value)
                        }}
                    >
                        <option disabled value={''}>Choose your character</option>
                        {Object.keys(split.participantsWithEmail).map(person => {
                            if (split.participantsWithEmail[person] === '') {
                                return <option key={Math.random()} value={person}>{person}</option>
                            }
                        })}
                    </select>
                </div>
                {choosenCharacter.length > 0 && <span className='my-2' >
                    <i> PS: This cannot be changed later. </i>
                </span>}
                {choosenCharacter.length > 0 && <button style={{ borderRadius: '20px' }} onClick={chooseThisCharacter} className="btn px-3 mt-2 btn-primary">
                    Let's SplitUp!
                </button>}
            </div>
        </div>}
    </>
    let { nickname } = JSON.parse(localStorage.getItem("user"));
    return (<>
        {split && <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
            {showAddNewExpense && addNewExpenseModal}
            {showChooseNameModal && split && chooseNameModal}
            {showExpensesPage && viewExpenseObject && <ViewExpense setShowExpensesPage={setShowExpensesPage} expense={viewExpenseObject} nickname={nickname} split={split} documentID={documentID} />}
            <div
                className="d-flex justify-content-center flex-column p-0 align-items-start"
                style={{
                    position: "stickyTop",
                    // top: "0",
                    width: "100vw",
                    // borderRadius: '0 0 20px 20px',
                    backgroundColor: "#1a1a1a",
                }}>
                <div className='d-flex w-100 px-4 align-items-center justify-content-between'>
                    <div className='d-flex py-3 align-items-center'>
                        <IoChevronBack onClick={() => { history.push('/home') }} style={{ fontSize: '2.5rem', color: '#9ec0e5' }} />
                        <h2 className='mont mx-4 display-6'>{split.title}</h2>
                    </div>
                    <div className='px-3' style={{ backgroundColor: split.balances[nickname] < 0 ? '#f27979' : '#67e9a9', color: '#1a1a1a', borderRadius: '10px' }}>
                        ₹ {split.balances[nickname].toFixed(2)}
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

            {currentTab === 1 &&
                <>
                    <div key={Math.random()} style={{ flexGrow: '1', overflowY: 'scroll' }}>
                        {split.expenses?.map((expense, index) => {
                            return <ExpensesList setShowExpensesPage={setShowExpensesPage}
                                nickname={nickname} index={index}
                                setViewExpenseObject={setViewExpenseObject} expense={expense} key={Math.random()} />
                        })}
                    </div>
                    <BsPlusCircleFill className='button' onClick={() => { setShowAddNewExpense(true) }} />
                </>
            }
            {
                currentTab === 2 &&
                <div key={Math.random()} className='py-3 ps-3' style={{ flexGrow: '1', overflowY: 'scroll' }}>
                    <Balances split={split} documentID={documentID} setSplit={setSplit} />
                </div>
            }
            {
                currentTab === 3 &&
                <div key={Math.random()} className='py-3 ps-3' style={{ flexGrow: '1', overflowY: 'scroll' }}>
                    <Mine split={split} documentID={documentID} setSplit={setSplit} />
                </div>
            }
        </div>}

    </>)
}

export default Split