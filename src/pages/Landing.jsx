import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'

function Landing() {
    const history = useHistory()
    useEffect(() => {
        if (!localStorage.getItem('user'))
            history.push("/signin")
        else
            history.push('home')
    }, [])
    return (
        <div></div>
    )
}

export default Landing