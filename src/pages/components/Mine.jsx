import React from 'react'
import Decimal from 'decimal.js'
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
    return (
        <>
            {split && <div className="w-100 p-2 d-flex flex-column justify-content-center lin-grad" style={{ borderRadius: '10px', color: 'black' }}>
                <div className='' style={{ fontSize: '1.2rem', fontWeight: 'bolder' }}>
                    My Expenses
                </div>
                <div className='bold-font d-flex align-items-center' style={{ fontSize: '3rem' }}>
                    {/* <span style={{ fontSize: '2rem', fontWeight: 'bold' }}><ImSigma /> : </span> */}
                    <span style={{ fontSize: '3rem', fontWeight: 'bold' }}> ₹ </span>
                    {getTotalExpense()}
                </div>
            </div>}
        </>
    )
}

export default Mine