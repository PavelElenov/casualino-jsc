import { Router } from "express";
import { getCurrentTimeInMinutes } from "../services/timeService";

export const router = Router();

router.get("/", (req, res) => {
    const time = getCurrentTimeInMinutes();
    res.status(200).json(time);
})
