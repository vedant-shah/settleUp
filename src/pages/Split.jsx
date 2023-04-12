import React, { useState, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { IoChevronBack } from 'react-icons/io5'
import { BsPiggyBank } from 'react-icons/bs'
import { FaExchangeAlt } from 'react-icons/fa'
import { BsPlusCircleFill } from 'react-icons/bs'
import { RxCross2 } from 'react-icons/rx'
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
    let { nickname } = JSON.parse(localStorage.getItem("user"));
    const [currentTab, setCurrentTab] = useState(() => {
        if (!localStorage.getItem('nicknameChosen'))
            return 0
        else
            return 1
    })
    const [paidBy, setPaidBy] = useState()
    const [dummyState, setDummyState] = useState(0)
    const [showModifySplit, setShowModifySplit] = useState(false)
    const [sharedBy, setSharedBy] = useState([])
    const [sharedByChecks, setSharedByChecks] = useState()
    const [amount, setAmount] = useState(0)
    const [nickNameChosen, setNickNameChosen] = useState(false)
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
        console.log(temp[0])
        setSplit(temp[0])
        setSharedBy(temp[0].participants)
        const { email } = JSON.parse(localStorage.getItem('user'))
        const user = JSON.parse(localStorage.getItem('user'))
        if (!Object.values(temp[0].participantsWithEmail).includes(email)) {
            setShowChooseNameModal(true);
        }
        if (temp[0].participants.includes(nickname)) {
            setCurrentTab(1)
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
                t[participant] = true;
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
        const sum = Object.values(data.amountPerPerson).reduce((total, value) => total + value, 0);
        if (Math.round(Number(data.amount)) !== Math.round(sum)) {
            alert("The Amounts Dont Add Up")
            return
        }
        data["date"] = startDate
        const balancesPaidByNumeral = new Decimal(balances[paidBy].toFixed(2))
        balances[paidBy] = (balancesPaidByNumeral.plus(new Decimal(Number(data.amount).toFixed(2)))).toNumber()
        setSplit({ ...split, expenses, balances })
        const localSplit = { ...split, expenses, balances }
        const { id } = split
        try {
            const userDocInstance = doc(db, "splits", documentID)
            await updateDoc(userDocInstance, localSplit)
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
        setCurrentTab(1)
        localStorage.setItem('nicknameChosen', 'yes')
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
    const [newSplitName, setNewSplitName] = useState('')
    const [newParticipant, setNewParticipant] = useState('')
    const [newFriendsArray, setNewFriendsArray] = useState([])
    const shouldCrossBeVisible = (split, participant) => {
        let value = 'block'
        split.expenses.forEach(expense => {
            if (expense.sharedBy.includes(participant) || expense.paidBy === participant)
                value = 'none'
        })
        return value
    }
    const editSplitModal = <>
        {split && <div className='p-4 d-flex  flex-column' style={{ height: '100vh', width: '100vw', position: 'absolute', zIndex: '100', backgroundColor: '#171717', overflowY: 'scroll' }}>
            <div className="d-flex align-items-center justify-content-between">
                <h2 className='display-4 my-3' style={{ color: '#9ec0e5' }}>Edit Split</h2>
                <RxCross2 onClick={() => {
                    setShowModifySplit(false)
                }} style={{ fontSize: '1.5rem' }} />
            </div>
            <div className='d-flex w-100 justify-content-between align-items-center'>
                <span style={{ fontSize: '1.5rem' }}>Title:</span>
                <input
                    type="text"
                    style={{ height: '2.5rem', width: '75%' }}
                    value={newSplitName}
                    className="form-control m-2"
                    placeholder={split.title[0].toUpperCase() + split.title.substring(1)}
                    onChange={(e) => {
                        setNewSplitName(e.target.value)
                    }}
                />
            </div>
            <h2 className='display-4 my-3' style={{ color: '#9ec0e5' }}>Participants</h2>
            <div style={{ height: '45%', overflowY: 'scroll' }}>

                {
                    split.participants.map(participant => {
                        return (<div className='w-100 my-2 d-flex align-items-center justify-content-between' key={Math.random()}>
                            <h3>
                                {participant}
                            </h3>
                            <RxCross2 style={{ display: shouldCrossBeVisible(split, participant), fontSize: '1.5rem' }} onClick={() => {
                                let temp = { ...split }
                                delete temp.participantsWithEmail[participant]
                                delete temp.balances[participant]
                                temp = { ...temp, participants: temp.participants.filter(friend => friend !== participant) }
                                setSplit({ ...temp })
                                console.log(temp)
                            }} />
                        </div>)
                    })
                }
                {
                    newFriendsArray?.map(participant => {
                        return (<div className='w-100 my-2 d-flex align-items-center justify-content-between' key={Math.random()}>
                            <h3>
                                {participant}
                            </h3>
                            <RxCross2 style={{ display: shouldCrossBeVisible(split, participant), fontSize: '1.5rem' }} onClick={() => {
                                const temp = newFriendsArray.filter(element => element !== participant)
                                setNewFriendsArray(temp)
                            }} />
                        </div>)
                    })
                }
            </div>
            <div className="dflex my-4 align-items-center input-group">
                <input
                    type="text"
                    style={{ height: '2.4rem', width: '65%', display: 'inline' }}
                    value={newParticipant}
                    className="form-control mb-0"
                    placeholder="Add New Paarticipant"
                    onChange={(e) => {
                        setNewParticipant(e.target.value)
                    }}
                />
                <button onClick={() => {
                    if (newParticipant !== '' && !split.participants.includes(newParticipant) && !newFriendsArray.includes(newParticipant)) {
                        setNewFriendsArray([...newFriendsArray, newParticipant])
                        setNewParticipant('')
                    }
                }} className='btn btn-primary m-0'>Add</button>
            </div>
            <span className='my-2'><i>Note: Hit Save to Save the Changes</i></span>
            <button className="btn btn-primary" onClick={async () => {
                const newParticipantsArray = [...split.participants, ...newFriendsArray]
                newFriendsArray.forEach(friend => {
                    split.participantsWithEmail[friend] = ''
                    split.balances[friend] = 0
                })
                if (newSplitName !== '')
                    split.title = newSplitName
                console.log("split:", split)
                try {

                    const userDocInstance = doc(db, "splits", documentID)
                    await updateDoc(userDocInstance, { ...split, participants: newParticipantsArray })
                    location.reload()
                } catch (e) {
                    console.log("e:", e)
                }
            }}>Save</button>
            <button onClick={() => {
                setShowConfirmDelete(true)
            }} className="btn btn-outline-danger my-4">Delete Split</button>
        </div>}
    </>
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)
    const confirmDeleteModal = <>
        {split && <div className='p-4 d-flex justify-content-center align-items-center  flex-column' style={{ height: '100vh', width: '100vw', position: 'absolute', zIndex: '1000', backgroundColor: '#171717', overflowY: 'scroll' }}>
            <div className="card p-3">
                Are you sure you want to Completely Delete the entire Split, for you and all other Participants? This cannot be undone!

                <div className="input-group mt-4">
                    <button className="btn w-50 btn-success" onClick={() => { setShowConfirmDelete(false) }}>No</button>
                    <button className="btn w-50 btn-danger" onClick={() => {
                        alert('Feature Pending. Sorry 😅')
                    }}>Yes</button>
                </div>
            </div>
        </div>}
    </>

    return (<>
        {split && <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
            {showAddNewExpense && addNewExpenseModal}
            {showChooseNameModal && split && chooseNameModal}
            {showConfirmDelete && split && confirmDeleteModal}
            {showModifySplit && split && editSplitModal}
            {showExpensesPage && viewExpenseObject && <ViewExpense setShowExpensesPage={setShowExpensesPage} expense={viewExpenseObject} nickname={nickname} split={split} documentID={documentID} />}
            {currentTab !== 0 && <div
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
                        <h2 onClick={() => {
                            setShowModifySplit(true)
                        }} className='mont mx-4 display-6'>{split.title[0].toUpperCase() + split.title.substring(1)}</h2>
                    </div>
                    <div className='px-2' style={{ backgroundColor: split.balances[nickname] < 0 ? '#f27979' : '#67e9a9', color: '#1a1a1a', borderRadius: '10px', fontSize: '1rem' }}>
                        ₹ {Math.abs(split.balances[nickname].toFixed(2))}
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
            </div>}

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