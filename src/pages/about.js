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
                    <div className="profile-picture">
                        <img src={require("../images/venomjokercircle.png")} alt="Javier Ruiz Profile" className="profile-img" />
                    </div>
                    <div className="about-column about-text">
                            <p className="header-text">I am Javier Ruiz, a seasoned Software Engineer,</p>
                            <p className="p-pad">
                                I have a proven track record of over 3 years in the software development field. 
                                    I hold a prestigious Masters of Science in Computer Science and a Bachelors of Science in Electrical Engineering, 
                                    underscoring my strong academic foundation.<br /><br /> 
                                Throughout my career, I have demonstrated expertise in crafting cutting-edge web applications using the React library 
                                    within the MERN stack. My proficiency extends to all phases of the development lifecycle, including building, testing, 
                                    and deploying applications that meet both user and business needs.<br /><br /> 
                                My primary focus lies in front-end development, and I specialize in leveraging technologies such as React, JavaScript, 
                                    HTML, CSS, WebGL, Flexbox, and JSX to create intuitive and visually appealing user interfaces. I thrive on solving 
                                    complex problems and ensuring seamless user experiences.<br /><br /> 
                                I am enthusiastic about contributing my skills and creativity to your organization, and I am eager to take on new challenges 
                                    that allow me to build exceptional digital solutions. Let's collaborate and bring your vision to life!
                            </p>
                    </div>
                        <NavRight />
                </div>
            </Polygon>
        </>
 
    );
};

export default About;