import React, { useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import dayjs from "dayjs";
import { HiOutlineTrash } from 'react-icons/hi'
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";
import Decimal from 'decimal.js';

function ViewExpense({ expense, setShowExpensesPage, nickname, split, documentID }) {
  console.log("split:", split)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const removeExpense = async () => {
    expense.sharedBy.forEach(person => {
      const balancesNumeral = new Decimal(split.balances[person].toFixed(2))
      const amountPerPersonNumeral = new Decimal((expense.amountPerPerson[person]).toFixed(2))
      split.balances[person] = (balancesNumeral.plus(amountPerPersonNumeral)).toNumber()
      split.individualExpenses[person] = (new Decimal(split.individualExpenses[person].toFixed(2)).minus(new Decimal(expense.amountPerPerson[person].toFixed(2)))).toNumber()
    })
    const balancesPaidByNumeral = new Decimal(split.balances[expense.paidBy].toFixed(2))
    split.balances[expense.paidBy] = (balancesPaidByNumeral.minus(new Decimal(Number(expense.amount).toFixed(2)))).toNumber()
    const filteredExpense = split.expenses.filter(e => {
      if (e.title !== expense.title) {
        return e
      }
    })
    // console.log("filteredExpense:", filteredExpense)
    // let participantBalance = new Decimal(0.00)
    // split.participants.forEach(participant => {
    //   console.log(filteredExpense)
    //   filteredExpense.forEach(expense => {
    //     if (expense.sharedBy.includes(participant)) {
    //       participantBalance = participantBalance.minus(new Decimal((expense.amount / expense.sharedBy.length).toFixed(2)))
    //       split.individualExpenses[participant] = (new Decimal(split.individualExpenses[participant])).plus(new Decimal((expense.amount / expense.sharedBy.length).toFixed(2))).toNumber()
    //     }
    //     if (expense.paidBy === participant)
    //       participantBalance = new Decimal(participantBalance).plus(new Decimal(Number(expense.amount).toFixed(2)))
    //     console.log("participantBalance:", Decimal.isDecimal(participantBalance))
    //   })
    //   split.balances[participant] = participantBalance.toNumber()
    // })
    const localSplit = { ...split, expenses: filteredExpense }
    try {
      const userDocInstance = doc(db, "splits", documentID)
      await updateDoc(userDocInstance, localSplit)
    } catch (e) {
      console.log("e:", e)

    }
    location.reload()
    console.log("localSplit:", localSplit)
  }

  return (
    <>
      <div className="d-flex flex-column" style={{ height: "100vh", width: "100vw", zIndex: "1000", backgroundColor: '#141414', position: 'absolute' }}>
        <div style={{ height: '30%', width: '100%', backgroundColor: '#171717' }} className="d-flex flex-column ">
          <div className="d-flex p-3 justify-content-between align-items-center" style={{ height: '3rem', width: '100%' }}>
            <IoChevronBack onClick={() => {
              setShowExpensesPage(false)
            }} style={{ fontSize: '2rem', color: '#9ec0e5', cursor: 'pointer' }} />
            <HiOutlineTrash style={{ fontSize: '2rem', color: '#f27979' }} onClick={() => { setShowDeleteModal(true) }} />
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
        {showDeleteModal && <>
          <div className="d-flex p-3 justify-content-center align-items-center" style={{ position: 'absolute', height: '100vh', width: '100vw', backgroundColor: 'rgba(0,0,0,0.7)', top: '0', left: '0', zIndex: '2000', backdropFilter: 'blur(5px)' }}>
            <div className='w-100 d-flex flex-column' style={{ backgroundColor: '#252525', borderRadius: '10px' }}>
              <div className='p-3'>

                <h5 className='text-center mont mb-3'>
                  Are you sure you want to Delete <span style={{ color: '#f27979' }}>{expense.title}</span> ?
                </h5>
                <span><i>Note: This cannot be undone.</i></span>
              </div>
              <div className="w-100">
                <button type="button" onClick={() => {
                  setShowDeleteModal(false)
                }} className="btn w-50 btn-danger">No</button>
                <button type="button" onClick={removeExpense} className="btn w-50 btn-success">Yes</button>
              </div>
            </div>
          </div>
        </>}
        <div className=" d-flex flex-column ps-3" style={{ flexGrow: '1', width: '100%' }}>
          <h3 className="mont my-4 mx-auto">Split:</h3>
          <div style={{ overflowY: 'scroll' }}>
            {expense.sharedBy.map((person, index) => {
              return <div className="d-flex justify-content-between p-2" style={{ backgroundColor: index % 2 === 0 ? "#171717" : "#202020", borderBottom: '1px solid gray', color: !(person === nickname) ? 'white' : '#9ec0e5' }} key={Math.random()}>
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
