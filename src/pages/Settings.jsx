import React from "react";

import { useHistory } from 'react-router-dom';
import Topbarulta from "./components/Topbarulta";
function Settings() {
    const history = useHistory()
    const { name, profilePicture, email } = JSON.parse(localStorage.getItem("user"));
    return (
        <>
            <div><Topbarulta /></div>
            <div className='p-3 d-flex'>
        
                {name}
                {email}
                <img style={{ borderRadius: "200px" }} src={profilePicture}></img>

            </div>

        </>
    );
}

export default Settings