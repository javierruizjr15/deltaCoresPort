import React from "react";
import '../index.css'; 
import LogoLeft from "../components/logoleft";
import NavRight from "../components/navRight";
import Polygon from "../components/polygon";

const About = () => {
         
    return (
        <>
            <Polygon>
                <div className="home=page">
                    <LogoLeft />
                    <div className="about-column about-text">
                            <p className="header-text">I'm Javier Ruiz, A Software Engineer.</p>
                            <p className="p-pad">I have over 3 years of programming experience.<br />
                                I hold a Masters of Science Computer Science with a Bachelors of Science Electrical Engineering. <br />     
                                I have experience building, testing, and deploying web applications with React library in a MERN stack. <br />
                                I am seeking front end developer positions working with React, JavaScript, HTML, CSS, WebGL, Flexbox, and JSX. <br /> 
                                I build cool things and would be honored to build something for you!</p>
                    </div>
                        <NavRight />
                </div>
            </Polygon>
        </>
 
    );
};

export default About;