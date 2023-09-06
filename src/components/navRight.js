import React from "react";
import '../index.css'; 
import { Link } from "react-router-dom";

const NavRight = () => {

    return (
        <>
            <div className="column nav-item ">
                    <div className="flex-top-right">
                        <Link to="/" className="white-link">Home</Link>
                    </div>
                    <div className="flex-bottom-right">
                        Audio Icon
                    </div>
            </div>
        </>
    )
}

export default NavRight;
