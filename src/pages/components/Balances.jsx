import React, { useEffect, useState } from 'react'
import { GoPrimitiveDot } from 'react-icons/go'
import { RxTriangleDown } from 'react-icons/rx'
import { RxTriangleUp } from 'react-icons/rx'
import { TbArrowBigRightLinesFilled } from 'react-icons/tb'
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";
import Decimal from 'decimal.js'

function Balances({ split, documentID, setSplit }) {
    let { balances } = split
    let balance = { ...balances }
    const [settlementsArray, setSettlementsArray] = useState([])
    const [markAsPaid, setMarkAsPaid] = useState()
    const [showMarkAsPaidModal, setShowMarkAsPaidModal] = useState(false)
    function getMin(bal) {
        let min = bal[Object.keys(bal)[0]];
        Object.keys(bal).forEach(person => {
            if (bal[person] < min)
                min = bal[person]
        })
        return Object.keys(bal).find(key => bal[key] === min);
    }

    function getMax(bal) {
        let max = bal[Object.keys(bal)[0]];
        Object.keys(bal).forEach(person => {
            if (bal[person] > max)
                max = bal[person]
        })
        return Object.keys(bal).find(key => bal[key] === max);
    }
    const getSettlementArray = () => {
        let temp = []
        while (1) {
            const min = getMin(balance);
            const max = getMax(balance);
            if (balance[min] === 0 || balance[max] === 0)
                break;
            if (Math.abs(balance[min]) <= balance[max]) {
                temp.push({ from: min, to: max, amount: Math.abs(balance[min]) })
                // console.log(min + " pays " + max + " " + Math.abs(balances[min]))
                balance[max] = parseFloat((balance[max] - Math.abs(balance[min])).toFixed(2));
                balance[min] = 0;
            } else if (Math.abs(balance[min]) > balance[max]) {
                temp.push({ from: min, to: max, amount: Math.abs(balance[min]) })
                // console.log(min + " pays " + max + " " + Math.abs(balances[min]))
                balance[min] = parseFloat((balance[min] + balance[max]).toFixed(2));
                balance[max] = 0;
            }
        }
        setSettlementsArray(temp)
    }
    const markBalanceAsPaid = async () => {
        split.reimbursement.push(markAsPaid)
        const temp = new Decimal(split.balances[markAsPaid.from].toFixed(2))
        const temp1 = new Decimal(split.balances[markAsPaid.to].toFixed(2))
        split.balances[markAsPaid.from] = (temp.plus(new Decimal(Number(markAsPaid.amount).toFixed(2)))).toNumber()
        split.balances[markAsPaid.to] = (temp1.minus(new Decimal(Number(markAsPaid.amount).toFixed(2)))).toNumber()
        try {
            const userDocInstance = doc(db, "splits", documentID)
            await updateDoc(userDocInstance, split)
        } catch (e) {
            console.log("e:", e)
        }
        setSplit({ ...split })
        setMarkAsPaid()
        setShowMarkAsPaidModal(false)
        console.log("split.reimbursement:", split)
    }
    useEffect(() => {
        getSettlementArray()
    }, [])

    const getTotalExpense = () => {
        let sum = 0;
        split.expenses.forEach(expense => {
            sum += Number(expense.amount)
        })
        return Number(sum.toFixed(2)).toLocaleString(undefined, { minimumFractionDigits: 2 });
    }
    const getTotalPaidBy = (friend) => {
        let sum = 0;
        split.expenses?.forEach(expense => {
            if (expense.paidBy === friend)
                sum += Number(expense.amount)
        })
        split.reimbursement?.forEach(expense => {
            if (expense.from === friend)
                sum += Number(expense.amount)
            if (expense.to === friend)
                sum -= Number(expense.amount)
        })
        return sum.toFixed(2)
    }
    return (
        <>
            {split && <div className="w-100 p-2 d-flex lin-grad1 flex-column justify-content-center" style={{ borderRadius: '10px', color: 'black' }}>
                <div className='' style={{ fontSize: '1.2rem', fontWeight: 'bolder' }}>
                    Total
                </div>
                <div className='bold-font d-flex align-items-center' style={{ fontSize: '3rem' }}>
                    {/* <span style={{ fontSize: '2rem', fontWeight: 'bold' }}><ImSigma /> : </span> */}
                    <span style={{ fontSize: '3rem', fontWeight: 'bold' }}> ₹ </span>
                    {getTotalExpense()}
                </div>
            </div>}
            {showMarkAsPaidModal && <>
                <div className="d-flex p-3 justify-content-center align-items-center" style={{ position: 'absolute', height: '100vh', width: '100vw', backgroundColor: 'rgba(0,0,0,0.7)', top: '0', left: '0', zIndex: '2000', backdropFilter: 'blur(5px)' }}>
                    <div className='w-100 d-flex flex-column' style={{ backgroundColor: '#252525', borderRadius: '10px' }}>
                        <div className='p-3'>

                            <h5 className='text-center mont mb-3'>
                                Are you sure <span style={{ color: '#f27979' }}>{markAsPaid.from}</span> has paid <span style={{ color: '#67e9a9' }}>{markAsPaid.to}</span> , ₹ {markAsPaid.amount}?
                            </h5>
                            <span><i>Note: This cannot be undone.</i></span>
                        </div>
                        <div className="w-100">
                            <button type="button" onClick={() => {
                                setMarkAsPaid()
                                setShowMarkAsPaidModal(false)
                            }} className="btn w-50 btn-danger">No</button>
                            <button type="button" onClick={markBalanceAsPaid} className="btn w-50 btn-success">Yes</button>
                        </div>
                    </div>
                </div>
            </>}
            <div className='my-4'>
                {split && <table className='table table-sm table-dark table-borderless table-striped' style={{ tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            <th className='text-center' scope="col">Name</th>
                            <th className='text-center' scope="col">Expenditure</th>
                            <th className='text-center' scope="col">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            split.participants.map(friend => {
                                return (
                                    <tr key={Math.random()}>
                                        <td className='text-center ' style={{ textOverflow: 'ellipsis', overflow: 'hiddden' }}><GoPrimitiveDot style={{ color: split.balances[friend] >= 0 ? "#67e9a9" : "#f27979" }} />{friend}</td>
                                        <td className='text-center'>₹{getTotalPaidBy(friend)}</td>
                                        <td className='text-center' style={{ color: split.balances[friend] >= 0 ? "#67e9a9" : "#f27979" }}>{split.balances[friend] >= 0 ? <RxTriangleUp style={{ fontSize: '1.5rem' }} /> : <RxTriangleDown style={{ fontSize: '1.5rem' }} />} {Math.abs(split.balances[friend])}</td>
                                    </tr>
                                )
                            })
                        }


                    </tbody>
                </table>}
            </div>
            <div>
                <h3>Settle Ups:</h3>
                {
                    settlementsArray?.map(settlement => {
                        return (
                            <div className='my-2' key={Math.random()}>
                                <div className="card flex-row align-items-center justify-content-between w-100 px-2 d-flex" style={{}}>
                                    <div className='my-2' style={{ display: 'inline' }}>
                                        <img src={`https://api.dicebear.com/6.x/adventurer/svg?scale=100&skinColor=9e5622,f2d3b1,ecad80&seed=${settlement.from}&radius=40&size=80`} alt="" />
                                        {/* <img src={`https://api.dicebear.com/6.x/big-ears-neutral/svg?mouth=variant0704,variant0705,variant0501&seed=${settlement.from}&radius=40&size=48`} alt="" /> */}
                                    </div>
                                    <div className='d-flex justify-content-center align-items-center flex-column'>
                                        <span>
                                            {settlement.from}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: '#f27979' }}>
                                            ₹ {settlement.amount}
                                        </span>
                                    </div>
                                    <div><TbArrowBigRightLinesFilled style={{ fontSize: '1.4rem', color: '#9ec0e5' }} /></div>
                                    <div>{settlement.to}</div>
                                    <div>
                                        {/* <img src={`https://api.dicebear.com/6.x/big-ears-neutral/svg?mouth=variant0707,variant0702,variant0201&seed=${settlement.to}&radius=40&size=48`} alt="" /> */}
                                        <img src={`https://api.dicebear.com/6.x/adventurer/svg?scale=100&skinColor=9e5622,f2d3b1,ecad80&seed=${settlement.to}&radius=40&size=80`} alt="" />
                                    </div>
                                </div>
                                <div className='w-100 py-1 d-flex justify-content-center' onClick={() => {
                                    setShowMarkAsPaidModal(true)
                                    setMarkAsPaid(settlement)
                                }} style={{ backgroundColor: '#1a1a1a', borderRadius: '0px 0 5px 5px', border: '1px solid #1a1a1a' }}>Mark as Paid</div>
                            </div>
                        )
                    })
                }

            </div>
        </>
    )
}

export default Balances