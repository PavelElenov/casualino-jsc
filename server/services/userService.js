"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByUsername = exports.login = void 0;
var users = [
    {
        email: "pavel@gmail.com",
        password: "12345",
        username: "Pavel",
        level: 10,
        img: "https://wallpapers.com/images/hd/cool-profile-picture-87h46gcobjl5e4xu.jpg"
    },
    {
        email: "plamen@gmail.com",
        password: "12345",
        username: "Plamen",
        level: 11,
        img: "https://marketplace.canva.com/EAFEits4-uw/1/0/1600w/canva-boy-cartoon-gamer-animated-twitch-profile-photo-oEqs2yqaL8s.jpg"
    },
    {
        email: "marto@gmail.com",
        password: "12345",
        username: "Marto",
        level: 12,
        img: "https://images.unsplash.com/photo-1628563694622-5a76957fd09c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5zdGFncmFtJTIwcHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80"
    },
];
var login = function (email, password) {
    var user = users.find(function (user) { return user.email == email; });
    if (!user || user.password !== password) {
        throw new Error("Incorrect email or password");
    }
    return { username: user.username, level: user.level, img: user.img };
};
exports.login = login;
function getUserByUsername(username) {
    var user = users.find(function (u) { return u.username == username; });
    return { username: user.username, level: user.level, img: user.img };
}
exports.getUserByUsername = getUserByUsername;
