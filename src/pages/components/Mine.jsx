import React from 'react'
import Decimal from 'decimal.js'
import { BiTrendingDown, BiTrendingUp } from 'react-icons/bi'
function Mine({ split, documentID, setSplit }) {
    const { nickname } = JSON.parse(localStorage.getItem('user'))
    const getTotalExpense = () => {
        let total = new Decimal(0.00)
        split.expenses.forEach(expense => {
            if (expense.paidBy === nickname)
                total = total.plus(new Decimal(expense.amount))
        })
        split.reimbursement?.forEach(expense => {
            if (expense.from === nickname)
                total = total.plus(new Decimal(expense.amount))
            if (expense.to === nickname)
                total = total.minus(new Decimal(expense.amount))
        })
        return total.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 })
    }
    const toPayOrGetPaid = () => {
        if (Math.round(split.balances[nickname]) > 0)
            return <><tr ><td style={{ backgroundColor: 'skyblue!important' }} className='text-center' >Yet to Receive</td><td className='text-center'>₹ {split.balances[nickname]}</td></tr></>
        else if (Math.round(split.balances[nickname]) < 0)
            return <><tr ><td style={{ backgroundColor: 'skyblue!important' }} className='text-center' >Yet to Pay</td><td className='text-center'>₹ {split.balances[nickname]}</td></tr></>
    }
    return (
        <>
            <div className="d-flex align-items-center justify-content-between px-2 pb-2">

                <h1 className=' m-0 display-5 mont'>Sup, {nickname[0].toUpperCase() + nickname.substring(1)}!</h1>
                <img src={`https://api.dicebear.com/6.x/adventurer/svg?scale=100&skinColor=9e5622,f2d3b1,ecad80&seed=${nickname}&radius=40&size=80`} alt="" />
            </div>
            {split && <div className="w-100 p-2 d-flex flex-column justify-content-center lin-grad" style={{ borderRadius: '10px', color: 'black' }}>
                <div className='' style={{ fontSize: '1.2rem', fontWeight: 'bolder' }}>
                    My Expenses
                </div>
                <div className='bold-font d-flex align-items-center' style={{ fontSize: '3rem' }}>
                    <span style={{ fontSize: '3rem', fontWeight: 'bold' }}> ₹ </span>
                    {getTotalExpense()}
                </div>
            </div>}
            {
                split && <>
                    <div className="d-flex align-items-center w-100 my-3 justify-content-between">
                        <h3 className='mont'>Balance</h3>
                        <div className='d-flex align-items-center'>
                            {split.balances[nickname] >= 0 ? <BiTrendingUp style={{ fontSize: '2rem', color: "#67e9a9" }} /> : <BiTrendingDown style={{ fontSize: '2rem', color: "#f27979" }} />}
                            <h3 className='ms-2' style={{ color: split.balances[nickname] >= 0 ? "#67e9a9" : "#f27979" }}> {Math.abs(split.balances[nickname])}</h3>
                        </div>
                    </div>
                </>
            }
            <div className='my-4'>
                <h2 className='mb-4'>Invoice</h2>
                {split && <table className='table table-sm table-dark table-bordered table-striped' style={{ tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            <th className='text-center' scope="col" style={{ color: '#9ec0e5' }}>Expense</th>
                            <th className='text-center' scope="col" style={{ color: '#9ec0e5' }}>My Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            split.expenses.map(expense => {
                                if (expense.sharedBy.includes(nickname))
                                    return (
                                        <tr key={Math.random()}>
                                            <td className='text-center ' style={{ textOverflow: 'ellipsis', overflow: 'hiddden' }}>{expense.title}</td>
                                            <td className='text-center ' style={{ textOverflow: 'ellipsis', overflow: 'hiddden' }}>₹ {(Number(expense.amountPerPerson[nickname])).toFixed(2)}</td>
                                        </tr>
                                    )
                            })
                        }
                    </tbody>
                </table>}
            </div>
        </>
    )
}

export default Mine