import React, { useEffect, useState } from 'react'
import { GoPrimitiveDot } from 'react-icons/go'
import { RxTriangleDown } from 'react-icons/rx'
import { RxTriangleUp } from 'react-icons/rx'
import { TbArrowBigRightLinesFilled } from 'react-icons/tb'

function Balances({ split }) {
    let { balances } = split
    let balance = { ...balances }
    const [settlementsArray, setSettlementsArray] = useState([])
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
        console.log(temp)
        setSettlementsArray(temp)
    }

    useEffect(() => {
        getSettlementArray()
    }, [])

    const getTotalExpense = () => {
        let sum = 0;
        split.expenses.forEach(expense => {
            sum += Number(expense.amount)
        })
        return sum.toFixed(2)
    }
    const getTotalPaidBy = (friend) => {
        let sum = 0;
        split.expenses?.forEach(expense => {
            if (expense.paidBy === friend)
                sum += Number(expense.amount)
        })
        return sum.toFixed(2)
    }
    return (
        <>
            {split && <div className="w-100 p-2 d-flex flex-column justify-content-center" style={{ backgroundColor: '#67e9a9', borderRadius: '10px', color: 'black' }}>
                <div className='' style={{ fontSize: '1.2rem', fontWeight: 'bolder' }}>
                    Total
                </div>
                <div className='bold-font d-flex align-items-center' style={{ fontSize: '3rem' }}>
                    {/* <span style={{ fontSize: '2rem', fontWeight: 'bold' }}><ImSigma /> : </span> */}
                    <span style={{ fontSize: '3rem', fontWeight: 'bold' }}> ₹ </span>
                    {getTotalExpense()}
                </div>
            </div>}
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
                                    <tr >
                                        <td className='text-start ' style={{ textOverflow: 'ellipsis', overflow: 'hiddden' }}><GoPrimitiveDot style={{ color: split.balances[friend] >= 0 ? "#67e9a9" : "#f27979" }} />{friend}</td>
                                        <td className='text-center'>₹{getTotalPaidBy(friend)}</td>
                                        <td className='text-left' style={{ color: split.balances[friend] >= 0 ? "#67e9a9" : "#f27979" }}>{split.balances[friend] >= 0 ? <RxTriangleUp style={{ fontSize: '1.5rem' }} /> : <RxTriangleDown style={{ fontSize: '1.5rem' }} />} {Math.abs(split.balances[friend])}</td>
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
                                <div className="card flex-row align-items-center justify-content-between w-100 px-3 d-flex" style={{}}>
                                    <div className='my-3' style={{ display: 'inline' }}>
                                        <img src={`https://api.dicebear.com/6.x/big-ears-neutral/svg?mouth=variant0704,variant0705,variant0501&seed=${settlement.from}&radius=40&size=48`} alt="" />
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
                                        <img src={`https://api.dicebear.com/6.x/big-ears-neutral/svg?mouth=variant0707,variant0702,variant0201&seed=${settlement.to}&radius=40&size=48`} alt="" />
                                    </div>
                                </div>
                                <div className='w-100 py-1 d-flex justify-content-center' style={{ backgroundColor: '#141414', borderRadius: '0px 0 5px 5px', border: '1px solid #141414' }}>Mark as Paid</div>
                            </div>
                        )
                    })
                }

            </div>
        </>
    )
}

export default Balances