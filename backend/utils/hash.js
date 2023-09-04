const jsSHA = require("jssha");// ENCRYPT USER PASSWORDS

// for encrypting passwords
function hash(username,password) {
    let Obj = new jsSHA("SHA-256", "TEXT", username); // uses the user's username as salt
    Obj.update(password);
    return Obj.getHash("HEX");
}

module.exports = hash;