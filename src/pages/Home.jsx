import React from 'react'
import './home.css'
import { BsPlusCircleFill } from "react-icons/bs";
import { useHistory } from 'react-router-dom';
function Home() {
    const history = useHistory()
    return (
        <div>
            <h3>SettleUp</h3>
            <BsPlusCircleFill className='button' onClick={() => { history.push("/addtrip") }} />
        </div>
    )
}

export default Home