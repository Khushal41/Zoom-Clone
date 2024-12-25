import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({
    userData: null,
    setUserData: () => { },
});

const client = axios.create({
    baseURL: `${server}/api/v1/users`,
    // baseURL: "localhost:3000/api/v1/users",
});

export const AuthProvider = ({ children }) => {
    const authContext = useContext(AuthContext) || {};
    const [userData, setUserData] = useState(authContext.userData);
    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            const request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            });
            if (request.status === httpStatus.CREATED) {
                return request.data.message;
            }
        } catch (err) {
            console.error("Registration Error:", err);
            return null;
        }
    };

    const handleLogin = async (username, password) => {
        try {
            const request = await client.post("/login", { username, password });
            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
                router("/home");
            }
        } catch (err) {
            console.error("Login Error:", err);
            return null;
        }
    };

    const getHistoryOfUser = async () => {
        try {
            const request = await client.get("/get_all_activity", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            return request.data;
        } catch (err) {
            console.error("Error fetching user history:", err);
            return null;
        }
    };

    const addToUserHistory = async (meetingCode) => {
        try {
            const request = await client.post("/add_to_activity", {
                meeting_code: meetingCode,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            return request.data;
        } catch (err) {
            console.error("Error adding to user history:", err);
            return null;
        }
    };

    const data = {
        userData,
        setUserData,
        addToUserHistory,
        getHistoryOfUser,
        handleRegister,
        handleLogin,
    };

    return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
