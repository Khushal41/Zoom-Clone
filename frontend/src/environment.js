const IS_PROD = true; // Toggle this to switch environments
const server = IS_PROD
    ? "https://apnacollegebackend.onrender.com"
    : "http://localhost:8000";

export default server;
