import React from "react";
import '../index.css'; 
import LogoLeft from "../components/logoleft";
import NavRight from "../components/navRight";

const About = () => {
         
    return (
        <>
            <div className="home-page">
                <LogoLeft />
                <div className="column menu-item">
                    <p>
                        Blah Blah I am awesome
                    </p>
                </div>
                <NavRight />
            </div>
        </>

    );
};

export default About;