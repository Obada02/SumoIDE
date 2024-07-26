// src/Gauge.js
import React from 'react';

const Gauge = ({ value, max, label }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const percentage = value / max;
    const offset = circumference - percentage * circumference;

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
                stroke="#00ff00"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 60 60)"
            />
            <text x="60" y="60" textAnchor="middle" dy="7" fontSize="20">{value}</text>
            <text x="60" y="85" textAnchor="middle" dy="7" fontSize="12">{label}</text>
        </svg>
    );
};

export default Gauge;
