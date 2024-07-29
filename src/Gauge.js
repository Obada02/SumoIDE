import React from 'react';

const Gauge = ({ value, max, name }) => {
    if (name.match(/TIME/)) {
        max = 2000;
    }

    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const percentage = value / max;
    let offset = circumference - percentage * circumference;

    console.log(name, value);
    //if (name === 'TURN_LEFT_TIME')
     //    offset = -offset;

    if (name.match(/TIME/)) {
        let seconds = Math.floor(value / 1000);
        let milliseconds = value % 1000;
        let leadingZeros = '';

        for (let i = 0; i < 3 - milliseconds.toString().length; i++) {
            leadingZeros += '0';
        }
        value = `${seconds}:${leadingZeros}${value % 1000}`;
    }
    return (
        <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="#e6e6e6"
                strokeWidth="10"
            />
            <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="#201E43"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 60 60)"
            />
            <text x="60" y="60" textAnchor="middle" dy="7" fontSize="20">{value}</text>
        </svg>
    );
};

export default Gauge;
