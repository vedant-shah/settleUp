import React from 'react'
import './home.css'

import { BsPlusCircleFill } from "react-icons/bs";
import { useHistory } from 'react-router-dom';
import Topbar from './components/Topbar';
function Home() {
    const history = useHistory()
    return (
        <>
            <Topbar />
            <BsPlusCircleFill className='button' onClick={() => { history.push("/addsplit") }} />
        </>
    )
}

export default Home