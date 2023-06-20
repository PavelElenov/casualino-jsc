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


const getAllUsers = () => {
    let arr = [];

    for(let user of users){
        arr.push({username: user.username, img: user.img})
    };

    return arr;
};

const getUserByUsername = (username) => {
    const user = users.find(user => user.username == username);
    return {username: user.username, img: user.img};
} 

const login = (email, password) => {
    const user = users.find(user => user.email == email);
    
    if(!user || user.password !== password){
        throw new Error("Incorrect email or password");
    }

    return {username:user.username, img: user.img};
}

module.exports = {
    getAllUsers,
    login,
    getUserByUsername
}