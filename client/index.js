const io = require("socket.io-client");
const reader = require('readline-sync');
const rl = require('readline').createInterface(process.stdin, process.stdout);;
const axios = require('axios');

let username;
let conversationName;
let userEmail;

const socket = io('http://localhost:3000', {
    transports: ["websocket"],
});

socket.on('message', data => {
    if (data.conversation == conversationName) {
        console.log(`${data.creator}: ${data.text}`);
    }
});
console.log('Please login!');
authorizeUser();


function authorizeUser() {
    rl.question('Email: ', (email) => {
        userEmail = email;

        rl.question(`Password:`, (password) => {
            loginUser(userEmail, password);
        });
    });
    
}
function loginUser(email, password) {
    axios.post('http://localhost:3000/login', { email, password }).then(() => readMessages()).catch(error => {
        console.log(error.response.data);
        authorizeUser();
    });
}

function getChat() {
    axios({
        method: 'GET',
        url: "http://localhost:3000/conversations"
    }).then(res => res.data)
        .then(data => {
            const conversationMessages = data.filter(c => c.name == conversationName)[0].messages;

            if (conversationMessages.length > 0) {
                conversationMessages.map(m => m.creator == username ? console.log(`You: ${m.text}`) : console.log(`${m.creator}: ${m.text}`))
            }
        })
}

function readMessages(){
    rl.question('In which conversation you want to join? 1, 2, 3, 4: ', (conversation) => {
        conversationName = conversation;
        getChat();

        rl.on('line', (line) => {
            socket.emit('message', { creator: username, text: line, conversation: conversationName });
            console.log(`You: ${line}`);
        });
    });
    
}

