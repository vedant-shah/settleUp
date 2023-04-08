import React from "react";
import logo from '../../images/logo.png'
import { useHistory } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
function ReverseTopBar() {
  const history = useHistory()
  return (
    <>
      <div
        className="d-flex justify-content-between p-3 align-items-center"
        style={{
          position: "stickyTop",
          // top: "0",
          width: "100vw",
          // borderRadius: '0 0 20px 20px',
          backgroundColor: "#1a1a1a",
        }}>
        <IoChevronBack onClick={() => { history.push("/home") }} style={{ fontSize: '2.5rem', color: '#9ec0e5' }} />
        <img style={{ width: "250px" }} src={logo} alt="" />

      </div>
    </>
  );
}

export default ReverseTopBar;