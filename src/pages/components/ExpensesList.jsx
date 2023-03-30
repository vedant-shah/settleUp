import React from 'react'
import dayjs from 'dayjs'
function ExpensesList({ nickname, setShowExpensesPage, setViewExpenseObject, expense }) {
    // console.log("date:", date.toDate())
    return (
        <div key={Math.random()} onClick={() => {
            setShowExpensesPage(true)
            setViewExpenseObject(expense)
        }} className='p-3' style={{ width: '100%', borderBottom: '1px solid white' }}>
            <div className='p-0 m-0 d-flex justify-content-between align-items-center'>
                <span style={{ color: '#9ec0e5', fontSize: '1.35rem' }}>{expense.title}</span>
                <span style={{ color: !expense.sharedBy.includes(nickname) ? '#9ec0e5' : '#f27979', fontSize: '1.35rem' }}>₹ {Number(expense.amount).toFixed(2)}</span>
            </div>
            <div className='p-0 m-0 d-flex justify-content-between'>
                <span>Paid By: <span style={{ fontWeight: 'bold' }}>
                    {expense.paidBy}
                </span>
                </span>
                <span>{dayjs(expense.date.toDate()).format("DD/MM/YYYY")}</span>
            </div>
        </div>
    )
}

export default ExpensesList