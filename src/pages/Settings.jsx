import React, { useState } from "react";
import { MdVerified } from 'react-icons/md'
import { MdModeEditOutline } from 'react-icons/md'
import { MdCheck } from 'react-icons/md'
import { useHistory } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import ReverseTopBar from "./components/ReverseTopBar";
function Settings() {
    const history = useHistory()
    const [edit, setEdit] = useState(false)
    const [newNickName, setNewNickName] = useState('')
    const user = JSON.parse(localStorage.getItem("user"));
    const { name, profilePicture, email, nickname } = user;
    const updateNickName = () => {
        localStorage.setItem("user", JSON.stringify({ ...user, nickname: newNickName }))
        location.reload();
    }
    const signUserOut = async () => {
        try {
            await signOut(auth)
            localStorage.clear("user")
            history.push("/signin")
        } catch (error) {
            console.log("error:", error)

        }
    }
    return (
        <>
            <div className='' style={{ height: '100vh', width: '100vw' }}>
                <div><ReverseTopBar /></div>
                <div className=" py-4 d-flex align-items-center flex-column">
                    <img className="mx-auto" style={{ borderRadius: "200px", width: '150px' }} src={profilePicture} />
                    <h2 className="mt-4 mb-0 mont">Welcome, {nickname}</h2>
                    <div className="d-flex align-items-center mb-4 mt-2">

                        <h6 className="">
                            {email} </h6>
                        <MdVerified className="mx-2 " style={{ color: '#89e289' }} />
                    </div>
                    <div style={{ width: '80%' }} className="d-flex  align-items-center justify-content-around">
                        <span style={{ fontWeight: 'bold' }}>
                            Nick Name:
                        </span>
                        {!edit && <><h5 className="my-4">
                            {nickname}</h5>
                            <MdModeEditOutline onClick={() => { setEdit(true) }} />
                        </>
                        }
                        {edit && <div className="input-group ">
                            <input type="text" className="form-control"
                                value={newNickName}
                                onChange={e => {
                                    setNewNickName(e.target.value)
                                }}
                                placeholder={nickname}
                                aria-describedby="basic-addon2" />
                            <div className="input-group-append"
                                onClick={updateNickName}
                            >
                                <span className="input-group-text" id="basic-addon2"><MdCheck style={{ fontSize: '1.5rem' }}

                                /></span>
                            </div>
                        </div>}
                    </div>
                </div>
                <button type="button" onClick={signUserOut} class="btn btn-outline-danger" style={{ width: '50%' }}>Signout</button>
            </div>

        </>
    );
}

export default Settings