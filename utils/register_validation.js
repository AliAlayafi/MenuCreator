const username_regex = /^[a-zA-Z]+$/;
const email_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


function validateUsername(username) {
    return username_regex.test(username);
}

function validateEmail(email) {
    return email_regex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}



module.exports = {
    validateUsername,
    validateEmail,
    validatePassword
};