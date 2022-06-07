import express from 'express'
import http from 'http'
import mongoose from 'mongoose'
import config from './config'
import firebaseAdmin from 'firebase-admin'
import logger from './config/logging'
import userRoutes from './routes'
import { clearWeek, clearMonth } from './controllers'

const
    router = express(),
    httpServer = http.createServer(router) //Server handling

firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(config.firebaseAccountKey) }); //Firebase connection

(async () => { // Mongoose DB connection (IIFE)
    await mongoose.connect(config.mongo.uri, config.mongo.options)
        .then(() => logger.info('Succesfully connected to Mongo DB'))
        .catch(error => logger.error(error.message))
})()

//Cron scheduled jobs
clearWeek.start()
clearMonth.start()

//Logging middleware
router.use((req, res, next) => {
    logger.info(`METHOD: ${req.method}, -URL: ${req.url}, -IP: ${req.socket.remoteAddress}`)

    res.on('finish', () => {
        logger.info(`METHOD: ${req.method}, -URL: ${req.url}, -IP: ${req.socket.remoteAddress}, -STATUS: ${res.statusCode}`)
    })
    next()
})

//Parsing body
router.use(express.urlencoded({ extended: true }))
router.use(express.json())

// API access policies
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }
    next()
})

//Routes
router.use('/player', userRoutes)

//Error handling
router.use((req, res, next) => {
    const error = new Error('Not Found')
    return res.status(404).json({ message: error.message })
})

//Listening for requests
httpServer.listen(config.server.port, () => {
    logger.info(`Server is running at ${config.server.host}:${config.server.port}...`)
})