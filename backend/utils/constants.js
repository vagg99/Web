const StartingTokens = 100; // Tokens that every user starts with , and gets every month
const TTLS = 86400; // Time to live for cache in seconds (1 day)
const port = 3000; // Port that the server will listen to
const frontend = "http://localhost:5500"; // Frontend url
const secret = "nektarios"; // express session secret

module.exports = {
    StartingTokens,
    TTLS,
    port,
    frontend,
    secret
}