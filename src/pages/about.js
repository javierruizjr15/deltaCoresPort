import React from "react";
import '../index.css'; 
import LogoLeft from "../components/logoleft";
import NavRight from "../components/navRight";

const About = () => {
         
    return (
        <>
            <div className="home-page">
                <LogoLeft />
                <div className="column menu-item about-column">
                    <p>
                        <p>About</p>
                    </p>
                </div>
                    <NavRight />
            </div>
        </>
 
    );
};

export default About;