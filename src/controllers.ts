import { NextFunction, Request, Response } from "express"
import firebaseAdmin from "firebase-admin"
import nodemailer from 'nodemailer'
import { Types } from "mongoose"
import cron from 'node-cron'
import logger from "./config/logging"
import Player from './model'
import config from "./config"
import { EmailTemp } from "./emailtemp"

export const
    getFirebaseData = async (req: Request, res: Response, next: NextFunction) => {
        logger.info('Verifiying user token with Firebase...')
        const token = req.headers.authorization

        if (!token) {
            logger.error('Token not found!')
            return res.status(401).json({ message: 'Unauthorized!' })
        }

        await firebaseAdmin.auth()
            .verifyIdToken(token)
            .then(result => {
                if (!result) {
                    logger.warn('Token is invalid or has expired!')
                    return res.status(401).json({ message: 'Token invalid or expired, Unauthorized!' })
                }

                res.locals.user = result
                res.locals.token = token
                logger.info(`User with NAME -${result.name} & UID - ${result.uid} verified`)
                next()
            })
            .catch(error => {
                logger.error(error.message)
                return res.status(401).json({ error, message: 'Unauthorized!' })
            })
    },

    create = async (req: Request, res: Response, next: NextFunction) => {
        logger.info('Initialising a new user...')

        const { uid, name, balance, week, month, all_time } = req.body,
            token = res.locals.token

        return await Player.create({
            _id: new Types.ObjectId(),
            uid, name, balance,
            highscores: { week, month, all_time }
        }).then(newUser => {
            logger.info(`New user with NAME - ${name} & UID - ${uid} has been created.`)
            return res.status(201).json({ user: newUser, token })
        }).catch(error => {
            logger.error(error.message)
            return res.status(500).json({ error })
        })
    },

    authenticate = async (req: Request, res: Response, next: NextFunction) => {
        logger.info('Authenticating user with Mongo DB...')

        const { uid } = req.body,
            token = res.locals.fire_token

        return Player.findOne({ uid }).then(user => {
            if (!user) {
                logger.info(`User with ID - ${uid} not found in DB.`)
                return create(req, res, next)
            }

            logger.info(`User with NAME - ${user.name} & UID - ${uid} validated.`)
            return res.status(200).json({ user, token })
        }).catch(error => {
            logger.error(error.message)
            return res.status(500).json({ error })
        })
    },

    getOne = async (req: Request, res: Response, next: NextFunction) => {
        const uid = req.params.id
        logger.info(`Retriving user @ ${uid} from DB...`)

        return Player.findOne({ uid }).then(user => {
            if (!user) {
                logger.error(`User @ ${uid} not found in DB`)
                return res.status(404).json({ message: `User @ ${uid} not found in DB` })
            }
            logger.info(`User @ ${uid} retrived from DB`)
            return res.status(200).json({ user })
        }).catch(error => {
            logger.error(error.message)
            return res.status(500).json({ error })
        })
    },

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        logger.info(`Retriving all users from DB...`)

        return Player.find().exec().then(users => {
            if (!users) {
                logger.error('Users not found')
                return res.status(404).json({ message: 'Users not found' })
            }
            logger.info('Users retrived from DB')
            return res.status(200).json({ count: users.length, users })
        }).catch(error => {
            logger.error(error.message)
            return res.status(500).json({ error })
        })
    },

    update = async (req: Request, res: Response, next: NextFunction) => {
        const uid = req.params.id,
            { balance } = req.body
        logger.info(`Updating user @ ${uid}...`)

        return Player.findOne({ uid }).then(async user => {
            if (!user) return res.status(404).json({ message: 'User not found' })

            if (balance !== user.balance) user.balance = balance
            if (balance > user.highscores.week) user.highscores.week = balance
            if (balance > user.highscores.month) user.highscores.month = balance
            if (balance > user.highscores.all_time) user.highscores.all_time = balance

            await user.save()
                .then(savedUser => {
                    logger.info(`New user with NAME - ${savedUser.name} & UID - ${uid} has been updated.`)
                    return res.status(201).json({ user: savedUser })
                }).catch(error => {
                    logger.error(error.message)
                    return res.status(500).json({ error })
                })
        }).catch(error => {
            logger.error(error.message)
            return res.status(500).json({ error })
        })
    },

    feedback = async (req: Request, res: Response, next: NextFunction) => {
        logger.info('Sending feedback...')
        const { feedback, sender_name, sender_email } = req.body

        let transporter = nodemailer.createTransport({
            host: config.sendblue.smtp_server,
            port: config.sendblue.port,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.sendblue.login, // generated sendinblue user
                pass: config.sendblue.password, // generated sendinblue password
            },
        })

        return await transporter.sendMail({

            from: `${sender_name}, <${sender_email}>`, // sender address
            to: "thierryntoh24@gmail.com", // mine <receiver>
            subject: `Jackblakr :: Feedback from ${sender_name}`, // Subject line
            text: `${feedback}`, // plain text body
            html: EmailTemp(sender_name, sender_email, feedback), // html body using emai template from Github

        }).then(response => {
            logger.info(`Feedback from - ${sender_name}, <${sender_email}. has been sent.`)
            return res.status(201).json({ message: response })
        }).catch(error => {
            logger.error(error.message)
            return res.status(500).json({ error })
        })
    },

    clearWeek = cron.schedule('0 0 * * Mon', () => async (req: Request, res: Response, next: NextFunction) => {
        Player.find().exec().then(users => {
            if (!users || users.length < 1) return res.status(404).json({ message: 'User not found' })

            users.forEach(async user => {
                user.highscores.week = 0

                await user.save().then(savedUser => {
                    logger.info(`Weekly scores for - ${savedUser.name} & UID - ${savedUser.uid} cleared.`)
                    return res.status(201).json({ message: 'Success' })
                }).catch(error => { logger.error(error.message); return res.status(500).json({ error }) })
            })
        })
        next()
    }, { timezone: 'Europe/London' }),

    clearMonth = cron.schedule('0 0 1 * *', () => async (req: Request, res: Response, next: NextFunction) => {
        Player.find().exec().then(users => {
            if (!users || users.length < 1) return res.status(404).json({ message: 'User not found' })

            users.forEach(async user => {
                user.highscores.month = 0

                await user.save().then(savedUser => {
                    logger.info(`Weekly scores for - ${savedUser.name} & UID - ${savedUser.uid} cleared.`)
                    return res.status(201).json({ message: 'Success' })
                }).catch(error => { logger.error(error.message); return res.status(500).json({ error }) })
            })
        })
        next()
    }, { timezone: 'Europe/London' })