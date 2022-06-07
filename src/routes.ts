import { Router } from "express";
import { create, getAll, getFirebaseData, getOne, authenticate, update, feedback } from "./controllers";

const router = Router()

router.post('/create', getFirebaseData, create)
router.post('/auth', getFirebaseData, authenticate)
router.patch('/update/:id', update)
router.post('/feedback', feedback)
router.get('/one/:id', getOne)
router.get('/all', getAll)

export = router