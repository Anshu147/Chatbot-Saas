import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15m' // Short-lived
    });
};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d' // Long-lived
    });
};