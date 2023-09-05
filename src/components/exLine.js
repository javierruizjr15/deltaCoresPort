import React, { useState, useRef } from 'react';

const ExLine = () => {
    const [width, setWidth] = useState(0);
    const [showLine, setShowLine] = useState(false); // State to determine if the line is visible
    const expandingRef = useRef(false);
    const stopRef = useRef(null);

    const handleMouseDown = () => {
        setShowLine(true); // Make the line visible when the button is held
        expandingRef.current = true;
        setWidth(0);
        expandLine();
        
        // Stop expanding after 4 seconds
        stopRef.current = setTimeout(() => {
            expandingRef.current = false;
        }, 3000);
    }

    const handleMouseUp = () => {
        setShowLine(false); // Hide the line once the button is released
        expandingRef.current = false;
        if (stopRef.current) {
            clearTimeout(stopRef.current);
        }
        setWidth(0); // Reset the width of the line once the button is released
    }

    const expandLine = () => {
        if (expandingRef.current) {
            setWidth(prevWidth => prevWidth + 5);
            setTimeout(expandLine, 50);
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button className="btn btn-dark" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                Click and Hold
            </button>
            {showLine && (
                <div 
                    style={{
                        marginTop: '10px',
                        width: `${width}px`,
                        height: '2px',
                        backgroundColor: 'white',
                        border: '1px solid white',
                        transition: 'width 0.3s ease-out'
                    }}
                ></div>
            )}
        </div>
    );
}

export default ExLine;
