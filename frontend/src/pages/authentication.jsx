import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';



// TODO remove, this demo shouldn't need to reset the theme.

// Import necessary modules and create a theme
const defaultTheme = createTheme();

// Exported Authentication component
export default function Authentication() {
    // State variables to store user input and related information
    const [username, setUsername] = React.useState(); // Stores the username input
    const [password, setPassword] = React.useState(); // Stores the password input
    const [name, setName] = React.useState(); // Stores the name input (for registration)
    const [error, setError] = React.useState(); // Tracks any errors during authentication
    const [message, setMessage] = React.useState(); // Tracks success or informational messages

    const [formState, setFormState] = React.useState(0);
    // Tracks the current form state: 0 for login, 1 for registration

    const [open, setOpen] = React.useState(false);
    // Controls whether a success/error message dialog is open

    // Destructuring `handleRegister` and `handleLogin` from the authentication context
    // AuthContext is expected to provide these methods for handling login and registration
    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    // Function to handle the authentication process (either login or registration)
    let handleAuth = async () => {
        try {
            if (formState === 0) {
                // If the form is in login state
                let result = await handleLogin(username, password);
                // Calls the login function with the username and password
            }
            if (formState === 1) {
                // If the form is in registration state
                let result = await handleRegister(name, username, password);
                console.log(result); // Logs the registration result for debugging
                setUsername(""); // Clears the username input field
                setMessage(result); // Sets a success message
                setOpen(true); // Opens the success message dialog
                setError(""); // Clears any previous errors
                setFormState(0); // Resets the form state to login
                setPassword(""); // Clears the password input field
            }
        } catch (err) {
            // Handles errors during the authentication process
            console.log(err); // Logs the error for debugging
            let message = err.response.data.message; // Extracts the error message from the response
            setError(message); // Sets the error message to be displayed
        }
    };

    // Return or render logic for the component goes here (not provided in this snippet)




    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>


                        <div>
                            <Button variant={formState === 0 ? "contained" : ""} onClick={() => { setFormState(0) }}>
                                Sign In
                            </Button>
                            <Button variant={formState === 1 ? "contained" : ""} onClick={() => { setFormState(1) }}>
                                Sign Up
                            </Button>
                        </div>

                        <Box component="form" noValidate sx={{ mt: 1 }}>
                            {formState === 1 ? <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Full Name"
                                name="username"
                                value={name}
                                autoFocus
                                onChange={(e) => setName(e.target.value)}
                            /> : <></>}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus
                                onChange={(e) => setUsername(e.target.value)}

                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}

                                id="password"
                            />

                            <p style={{ color: "red" }}>{error}</p>

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Login " : "Register"}
                            </Button>

                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar

                open={open}
                autoHideDuration={4000}
                message={message}
            />

        </ThemeProvider>
    );
}