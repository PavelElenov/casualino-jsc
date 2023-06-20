import express from 'express';
import { login } from '../services/userService';

const router = express.Router();

router.post("/", (req, res) => {
    try{
        const user = login(req.body.email, req.body.password);
        res.status(200);
        res.json(user);
    }catch(error: any){
        res.status(400);
        res.json(error.message);
    }
    
});

module.exports = router;