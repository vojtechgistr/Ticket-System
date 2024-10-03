﻿import React from "react";

const AuthWave = ({styles}: {styles?: React.CSSProperties}) => {
    return (
        <svg style={styles} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#845EC2" fillOpacity="1"
                  d="M0,32L120,48C240,64,480,96,720,90.7C960,85,1200,43,1320,21.3L1440,0L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path>
        </svg>
    );
}

export default AuthWave;