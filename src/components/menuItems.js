import React from "react";
import '../index.css'; 
import { Link } from "react-router-dom";
import ExLine from "./exLine";

const MenuItems = () => {

    return (
        <>
            <div className="column menu-item">
                <p>
                    <Link to="/about" className="white-link">About</Link>
                </p>
            </div>
            <div className="column menu-item">
                <p>
                    <Link to="/work" className="white-link">Work</Link>
                </p>
                <ExLine />
            </div>
            <div className="column menu-item">
                <p>
                    <Link to="/contact" className="white-link">Contact</Link> 
                </p>
            </div>
        </>
    )
}

export default MenuItems;