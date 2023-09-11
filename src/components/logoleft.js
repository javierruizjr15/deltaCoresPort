import React from "react";
import '../index.css'; 
import deltacoreslogo from "../images/DCOGW1.png";

const LogoLeft = () => {
    
    return (
        <>
                <div className="column">
                    <div className="flex-top-left"> 
                        <img 
                        src={deltacoreslogo} 
                        alt="delta cores logo" 
                        style={{width: "70px", height: "100px" }} 
                        /> 
                    </div>
                </div>
        </>
    )
}

export default LogoLeft;