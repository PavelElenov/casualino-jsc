const io = require("socket.io-client");
const rl = require('readline').createInterface(process.stdin, process.stdout);
const axios = require('axios');
const httpService = require("./services/httpService");

let conversationName;
let token;
let user;

const socket = io('http://localhost:3000', {
    transports: ["websocket"],
});

socket.on('message', data => {
    if (data.conversation == conversationName) {
        console.log(`${data.writer}: ${data.text}`);
    }
});

console.log('Please login!');
authenticateUser();

function authenticateUser() {
    rl.question('Email: ', (email) => {
        rl.question(`Password:`, (password) => {
            loginUser(email, password);
        });
    });

}

async function loginUser(email, password) {
    const res = await httpService.post("/login", { email, password });
    const data = await res.json();

    if (res.status == 200) {
        token = data.token;
        user = data.user;
        askForConversation();
    } else {
        console.log(data);
        authenticateUser();
    }

}

async function getChat() {
    const res = await httpService.get(`/conversations/${conversationName}`, token);
    const data = await res.json();

    if (res.status == 200) {
        const conversationMessages = data.messages;

        if (conversationMessages.length > 0) {
            conversationMessages.map(m => m.writer == user.username ? console.log(`You: ${m.text}`) : console.log(`${m.writer}: ${m.text}`))
        }
        readMessages();
    }else{
        console.log(data);
        askForConversation();
    }
}

function askForConversation() {
    rl.question('In which conversation you want to join? 1, 2, 3, 4: ', (conversation) => {
        conversationName = conversation;
        getChat();
    });
}

function readMessages() {
    rl.on('line', (line) => {
        socket.emit('message', { writer: user.username, text: line, conversation: conversationName, token });
        console.log(`You: ${line}`);
    });
}

