import React from "react";
import '../index.css';
import LogoLeft from "../components/logoleft";
import NavRight from "../components/navRight";
import Polygon from "../components/polygon";

const Contact = () => {
    
    return (
        <>
            <Polygon>
                <div>
                    <LogoLeft />
                    <div className="contact-column contact-text">
                        {/* <p className="contact-text-no-ighlight">Contact Javier Ruiz</p> */}
                        <p>
                         <span className="contact-text-no-highlight">Email: </span>javierruizjr15@gmail.com
                        </p>
                    </div>
                    <NavRight />
                </div>
            </Polygon>
        </>
    )
}

export default Contact; 
