import React from "react";
import '../index.css'; 
import { Link } from "react-router-dom";
import ExLine from "./exLine";

const MenuItems = () => {

    return (
        <>
            <div className="menu-items-container"> 
                <div className="menu-item">
                    <Link to="/about" className="white-link link-spacing">About</Link>
                    <Link to="/work" className="white-link link-spacing">Work</Link>
                    <Link to="/contact" className="white-link link-spacing">Contact</Link>
                </div>
            </div>
            {/* <div className="button-bottom-center">
                <ExLine />
            </div> */}

        </>

/* <>
            <div className="menu-items-container"> 
                <div className="menu-item">
                    <div>
                        <Link to="/about" className="white-link">About</Link>
                    </div>
                </div>
                
                <div className="menu-item work-container">
                    <div>
                        <Link to="/work" className="white-link">Work</Link>
                    </div>
                    <ExLine />
                </div>
                
                <div className="menu-item">
                    <div>
                        <Link to="/contact" className="white-link">Contact</Link> 
                    </div>
                </div>
            </div>
        </> */
    )
}

export default MenuItems;