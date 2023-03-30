import React from "react";
import { IoChevronBack } from "react-icons/io5";
import dayjs from "dayjs";
import { HiOutlineTrash } from 'react-icons/hi'
function ViewExpense({ expense, setShowExpensesPage, nickname }) {
  return (
    <>
      <div className="d-flex flex-column" style={{ height: "100vh", width: "100vw", zIndex: "10000", backgroundColor: '#141414', position: 'absolute' }}>
        <div style={{ height: '30%', width: '100%', backgroundColor: '#171717' }} className="d-flex flex-column ">
          <div className="d-flex p-3 justify-content-between align-items-center" style={{ height: '3rem', width: '100%' }}>
            <IoChevronBack onClick={() => {
              setShowExpensesPage(false)
            }} style={{ fontSize: '2rem', color: '#9ec0e5', cursor: 'pointer' }} />
            <span style={{ fontSize: '2rem', color: '#f27979' }}><HiOutlineTrash /></span>
          </div>
          <div className="d-flex p-4 flex-column justify-content-center align-items-center w-100" style={{ flexGrow: '1' }}>
            <h2 className="" style={{ fontSize: '2.4rem' }}>{expense.title}</h2>
            <h5 className="" style={{ color: !expense.sharedBy.includes(nickname) ? '#9ec0e5' : '#f27979' }}>₹ {Number(expense.amount).toFixed(2)}</h5>
          </div>
          <div className="d-flex p-3 justify-content-between align-items-center" style={{ height: '3rem', width: '100%' }}>
            <h6>Paid By: {expense.paidBy}</h6>
            <h6>{dayjs(expense.date.toDate()).format("DD/MM/YYYY")}</h6>
          </div>
        </div>
        <div className=" d-flex flex-column" style={{ flexGrow: '1', width: '100%' }}>
          <h3 className="mont my-4 mx-auto">Split:</h3>
          <div style={{ overflowY: 'scroll' }}>
            {expense.sharedBy.map(person => {
              return <div className="d-flex justify-content-between p-2" style={{ borderTop: '1px solid gray', borderBottom: '1px solid gray', color: !(person === nickname) ? 'white' : '#9ec0e5' }} key={Math.random()}>
                <span>
                  {person}
                </span>
                <span>
                  ₹ {expense.amountPerPerson[person].toFixed(2)}
                </span>
              </div>
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewExpense;
