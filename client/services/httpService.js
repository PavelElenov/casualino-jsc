const fetch = require('node-fetch');
const APIURL = 'http://localhost:3000';

function get(url, token) {
    let fetchInit = {
        method: "GET",
        headers: {}
    };

    if (token) {
        fetchInit.headers['Authorization'] = token;
    };

    fetch(`${APIURL}${url}`, fetchInit).then(res => res.json).then(data => {return data});
};

function post(url, data, token) {
    let fetchInit = {
        method: "POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    };

    if (token) {
        fetchInit.headers['Authorization'] = token;
    }
    console.log('Hi');

    fetch(`${APIURL}${url}`, fetchInit);
}

module.exports = {
    get,
    post
}