import { Router } from "express";

export const router = Router();

router.get('/', (req, res) => {
    const user = req.body.user;
    res.status(200).json(user);
})