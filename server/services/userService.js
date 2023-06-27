"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByUsername = exports.login = void 0;
var users = [
    {
        email: "pavel@gmail.com",
        password: "12345",
        username: "Pavel",
        level: 10,
        img: ''
    },
    {
        email: "plamen@gmail.com",
        password: "12345",
        username: "Plamen",
        level: 11,
        img: ''
    },
    {
        email: "marto@gmail.com",
        password: "12345",
        username: "Marto",
        level: 12,
        img: ''
    },
];
var login = function (email, password) {
    var user = users.find(function (user) { return user.email == email; });
    if (!user || user.password !== password) {
        throw new Error("Incorrect email or password");
    }
    return { username: user.username, email: user.email };
};
exports.login = login;
module.exports = {
    login: exports.login,
};
var getUserByUsername = function (username) {
    var user = users.find(function (u) { return u.username = username; });
    return { username: user.username, level: user.level, img: user.img };
};
exports.getUserByUsername = getUserByUsername;
