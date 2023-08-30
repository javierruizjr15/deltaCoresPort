import React from "react";
import '../index.css'; 
import deltacoreslogo from "../images/DCSpiral3white_Layer 1.png";

const LogoLeft = () => {
    
    return (
        <>
                <div className="column flex-top-left">
                    <img 
                        src={deltacoreslogo} 
                        alt="delta cores logo" 
                        style={{ width: "72px", height: "72px" }} 
                        /> 
                </div>
        </>
    )
}

export default LogoLeft;