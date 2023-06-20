const io = require("socket.io-client");
const reader = require('readline-sync');
const rl = require('readline').createInterface(process.stdin, process.stdout);;
const axios = require('axios');
const APIURL = 'http://localhost:3000';

let user;
let conversationName;

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

function loginUser(email, password) {
    axios.post('http://localhost:3000/login', { email, password }).then((res) => res.data).then(data => {
        user = data;
        askForConversation();
    }).catch(error => {
        console.log(error.response.data);
        authenticateUser();
    });
}

function getChat() {
    axios.get(`${APIURL}/conversations/${conversationName}`).then(res => res.data).then(data => {
            const conversationMessages = data.messages;

            if (conversationMessages.length > 0) {
                conversationMessages.map(m => m.writer == user.username ? console.log(`You: ${m.text}`) : console.log(`${m.writer}: ${m.text}`))
            }
            readMessages();
        }).catch(error => {
            console.log(error.response.data);
            askForConversation();
        })
}

function askForConversation() {
    rl.question('In which conversation you want to join? 1, 2, 3, 4: ', (conversation) => {
        conversationName = conversation;
        getChat();
    });
}

function readMessages() {
    rl.on('line', (line) => {
        socket.emit('message', { writer: user.username, text: line, conversation: conversationName });
        console.log(`You: ${line}`);
    });
}

