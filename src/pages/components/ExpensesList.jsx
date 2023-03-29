import React from 'react'
import dayjs from 'dayjs'
function ExpensesList({ amount, paidBy, title, date }) {
    return (
        <div className='p-3' style={{ width: '100%', borderBottom: '1px solid white' }}>
            <div className='p-0 m-0 d-flex justify-content-between align-items-center'>
                <span style={{ color: '#9ec0e5', fontSize: '1.35rem' }}>{title}</span>
                <span style={{ color: '#9ec0e5', fontSize: '1.35rem' }}>₹ {Number(amount).toFixed(2)}</span>
            </div>
            <div className='p-0 m-0 d-flex justify-content-between'>
                <span>Paid By: <span style={{ fontWeight: 'bold' }}>
                    {paidBy}
                </span>
                </span>
                <span>{dayjs(date.toDate()).format("DD/MM/YYYY")}</span>
            </div>
        </div>
    )
}

export default ExpensesList