import React from "react";
import logo from '../../images/logo.png'
import { MdSettingsSuggest } from "react-icons/md";
function Topbar() {
  return (
    <>
      <div
        className="d-flex justify-content-between p-3 align-items-center"
        style={{
          position: "stickyTop",
          // top: "0",
          width: "100vw",
          // borderRadius: '0 0 20px 20px',
          backgroundColor: "#141414",
        }}>
        <img style={{ width: "250px" }} src={logo} alt="" />
        <MdSettingsSuggest style={{ color: "white", fontSize: "2.5rem" }} />
      </div>
    </>
  );
}

export default Topbar;
