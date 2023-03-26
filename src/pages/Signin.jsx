import React from "react";
import { signInWithGoogle } from "../firebase-config";
import { FcGoogle } from "react-icons/fc";
import { useHistory } from "react-router-dom";
function Signin() {
  const history = useHistory()
  const signin = async () => {
    try {
      const result = await signInWithGoogle()
      console.log(result);
      const user = JSON.stringify({
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        nickname: result.user.displayName.substring(0, result.user.displayName.indexOf(' ')).toLowerCase(),
        profilePicture: result.user.photoURL,
      });
      localStorage.setItem("user", user);
      history.push("/home")

    } catch (error) {
      console.log("error:", error)

    }
  }
  return (
    <>
      <div className="d-flex align-items-center justify-content-center" style={{ width: '100vw', height: '100vh' }}>

        <button className="pb-3" onClick={signin}
          style={{ color: 'white', backgroundColor: 'black' }}
        ><span className="me-2 mb-2" style={{ fontSize: '1.5rem', color: 'black' }}><FcGoogle /></span> Sign In with Google</button>
      </div>
    </>
  );
}

export default Signin;
