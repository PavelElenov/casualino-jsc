import express from 'express';
import { login } from '../services/userService';
import { createToken } from '../utils/createJsonToken';

export const router = express.Router();

router.post("/", (req, res) => {
    try{
        const user = login(req.body.email, req.body.password);
        const token = createToken(user);
        res.status(200);
        res.json({ user, token});
    }catch(error: any){
        res.status(400);
        res.json(error.message);
    }
});

module.exports = router;