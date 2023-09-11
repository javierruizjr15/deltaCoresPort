import React from "react";
import '../index.css'; 
import LogoLeft from "../components/logoleft";
import NavRight from "../components/navRight";
import Polygon from "../components/polygon";

const About = () => {
         
    return (
        <>
            <Polygon>
                <div>
                    <LogoLeft />
                    <div className="about-column about-text">
                            <h1>I'm Javier, A Software Engineer</h1>
                            <p>I am a software engineer with over 3 years of programming experience.
                                I hold a Masters of Science Computer Science with a Bachelors of Science Electrical Engineering.    
                                I have experience building, testing, and deploying web applications with React library in a MERN stack. 
                                I am seeking front end developer positions working with React, JavaScript, HTML, CSS, WebGL, Flexbox, and JSX. I love to build cool things and would be honored to build something for you!</p>
                    </div>
                        <NavRight />
                </div>
            </Polygon>
        </>
 
    );
};

export default About;