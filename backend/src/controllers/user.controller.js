import httpStatus from "http-status"; // Importing HTTP status codes for consistent response status handling.
import { User } from "../models/user.model.js"; // Importing the User model for database interactions related to users.
import bcrypt, { hash } from "bcrypt"; // Importing bcrypt for password hashing and comparison.
import crypto from "crypto"; // Importing crypto for generating random tokens.
import { Meeting } from "../models/meeting.model.js"; // Importing the Meeting model for database interactions related to meetings.

// Login function for user authentication
const login = async (req, res) => {
    const { username, password } = req.body; // Extracting username and password from the request body.

    // Check if username or password is missing.
    if (!username || !password) {
        return res.status(400).json({ message: "Please Provide" }); // Return a 400 error if inputs are incomplete.
    }

    try {
        const user = await User.findOne({ username }); // Fetch the user from the database using the provided username.
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" }); // Return 404 if the user does not exist.
        }

        // Compare the provided password with the hashed password in the database.
        let isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (isPasswordCorrect) {
            // Generate a random token for the user.
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token; // Save the token to the user's record.
            await user.save(); // Update the user in the database.

            // Return the generated token with a 200 status.
            return res.status(httpStatus.OK).json({ token: token });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Username or password" }); // Return 401 if password is incorrect.
        }

    } catch (e) {
        // Catch and return any unexpected errors.
        return res.status(500).json({ message: `Something went wrong ${e}` });
    }
};

// Register function for creating a new user
const register = async (req, res) => {
    const { name, username, password } = req.body; // Extracting name, username, and password from the request body.

    try {
        // Check if a user with the given username already exists.
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User already exists" }); // Return 302 if the user exists.
        }

        // Hash the provided password using bcrypt.
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user object.
        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        await newUser.save(); // Save the new user to the database.

        // Return a success message with a 201 status.
        res.status(httpStatus.CREATED).json({ message: "User Registered" });

    } catch (e) {
        // Catch and return any unexpected errors.
        res.json({ message: `Something went wrong ${e}` });
    }
};

// Function to fetch the meeting history of a user
const getUserHistory = async (req, res) => {
    const { token } = req.query; // Extract the token from the query parameters.

    try {
        // Find the user associated with the given token.
        const user = await User.findOne({ token: token });

        // Fetch all meetings related to the user's username.
        const meetings = await Meeting.find({ user_id: user.username });

        res.json(meetings); // Return the list of meetings as a JSON response.
    } catch (e) {
        // Catch and return any unexpected errors.
        res.json({ message: `Something went wrong ${e}` });
    }
};

// Function to add a meeting code to a user's history
const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body; // Extract token and meeting code from the request body.

    try {
        // Find the user associated with the given token.
        const user = await User.findOne({ token: token });

        // Create a new meeting object with the user's username and meeting code.
        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        });

        await newMeeting.save(); // Save the new meeting to the database.

        // Return a success message with a 201 status.
        res.status(httpStatus.CREATED).json({ message: "Added code to history" });
    } catch (e) {
        // Catch and return any unexpected errors.
        res.json({ message: `Something went wrong ${e}` });
    }
};

// Exporting the functions to use them in routes or other modules
export { login, register, getUserHistory, addToHistory };
