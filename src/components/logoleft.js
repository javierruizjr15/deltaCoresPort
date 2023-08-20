import React from "react";
import '../index.css'; 
import deltacoreslogo from "../images/deltacoreslogo.jpeg";

const LogoLeft = () => {
    
    return (
        <>
                <div className="column flex-top-left">
                    <img 
                        src={deltacoreslogo} 
                        alt="delta cores logo" 
                        style={{ width: "36px", height: "72px" }} 
                        /> 
                </div>
        </>
    )
}

export default LogoLeft;