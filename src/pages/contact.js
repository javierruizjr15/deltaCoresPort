import React from "react";
import '../index.css';
import LogoLeft from "../components/logoleft";
import NavRight from "../components/navRight";
import Polygon from "../components/polygon";
import { GithubOutlined, MailOutlined, LinkedinOutlined } from "@ant-design/icons";

const Contact = () => {
    const emailLink = "javierruizjr15@gmail.com"
    const githubLink =  "https://github.com/javierruizjr15"
    const linkedinLink = "https://www.linkedin.com/in/javier-ruiz-jr/"


    return (
        <>
            <Polygon>
                <div className="home-page">
                    <LogoLeft />
                    <div className="contact-column contact-text">
                        <p className="contact-icon">
                         <span className="contact-text-no-highlight">
                          <MailOutlined />
                         </span> 
                         <span className="contact-icon-value">
                          <a href={`mailto:${emailLink}`} style={{ textDecoration: 'none', color: 'inherit', whiteSpace: 'nowrap'}}>{emailLink}</a>
                         </span>
                        </p>
                        <p className="contact-icon">
                         <span className="contact-text-no-highlight">
                          <GithubOutlined />
                         </span> 
                         <span className="contact-icon-value">
                          <a href={githubLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', whiteSpace: 'nowrap'}}>github.com/javierruizjr15</a>
                         </span>
                        </p>
                        <p className="contact-icon">
                         <span className="contact-text-no-highlight">
                          <LinkedinOutlined /> 
                         </span> 
                         <span className="contact-icon-value">
                          <a href={linkedinLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', whiteSpace: 'nowrap'}}>linkedin.com/in/javier-ruiz-jr</a>
                         </span>
                        </p>
                    </div>
                    <NavRight />
                </div>
            </Polygon>
        </>
    )
}

export default Contact; 
