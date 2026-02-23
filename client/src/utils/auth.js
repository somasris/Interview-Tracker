/**
 * Auth utility helpers.
 * Manages JWT token in localStorage.
 */

const TOKEN_KEY = 'interview_tracker_token';
const USER_KEY = 'interview_tracker_user';

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const setUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
        return null;
    }
};
export const removeUser = () => localStorage.removeItem(USER_KEY);

export const isLoggedIn = () => {
    const token = getToken();
    if (!token) return false;
    try {
        // Decode payload without verifying (server verifies)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

export const logout = () => {
    removeToken();
    removeUser();
};
