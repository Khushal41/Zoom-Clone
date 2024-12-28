import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Please provide both username and password" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (isPasswordCorrect) {
            const token = crypto.randomBytes(20).toString("hex");
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username or password" });
        }
    } catch (e) {
        console.error(e); // Log error for debugging
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during login" });
    }
};

const register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            username,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(httpStatus.CREATED).json({ message: "User registered successfully" });
    } catch (e) {
        console.error(e); // Log error for debugging
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred during registration" });
    }
};

const getUserHistory = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Token is required" });
    }

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid or expired token" });
        }

        const meetings = await Meeting.find({ user_id: user.username });
        res.status(httpStatus.OK).json(meetings);
    } catch (e) {
        console.error(e); // Log error for debugging
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while fetching user history" });
    }
};

const addToHistory = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const { meeting_code } = req.body;

    if (!token || !meeting_code) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Token and meeting code are required" });
    }

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid or expired token" });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code,
        });

        await newMeeting.save();
        res.status(httpStatus.CREATED).json({ message: "Meeting added to history" });
    } catch (e) {
        console.error(e); // Log error for debugging
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred while adding to history" });
    }
};

export { login, register, getUserHistory, addToHistory };
