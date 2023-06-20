let users = [
    {
        email: 'pavel@gmail.com',
        password: '12345',
        username:'Pavel'
    },
    {
        email: 'plamen@gmail.com',
        password: '12345',
        username:'Plamen'
    },{
        email: 'marto@gmail.com',
        password: '12345',
        username:'Marto'
    },
];

const login = (email, password) => {
    const user = users.find(user => user.email == email);
    
    if(!user || user.password !== password){
        throw new Error("Incorrect email or password");
    }

    return {username:user.username, email: user.email};
}

module.exports = {
    login,
}