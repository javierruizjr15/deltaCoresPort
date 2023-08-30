import React from "react";
import '../index.css'; 
import { Link } from "react-router-dom";

const NavRight = () => {

    return (
        <>
            <div className="column nav-item ">
                <div>
                    <p className="flex-top-right">
                        <Link to="/" className="white-link">Home</Link>
                    </p>
                </div>
                <div>
                    <p className="flex-bottom-right">
                        Audio Icon
                    </p>
                </div>
            </div>
        </>
    )
}

export default NavRight;
