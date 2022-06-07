import dotenv from 'dotenv'
dotenv.config()

const config = {
    defaults: {
        namespace: 'Server'
    },
    firebaseAccountKey: {
        project_id: `${process.env.FIREBASE_PROJECT_ID}`,
        privateKey: `${process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n")
            : undefined}`,
        clientEmail: `${process.env.FIREBASE_CLIENT_EMAIL}`,
    },
    mongo: {
        options: {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            keepAlive: true,
            autoIndex: false
        },
        uri: `mongodb+srv://${process.env.MONGO_URI_INNER}?retryWrites=true&w=majority`
    },
    sendblue: {
        smtp_server: 'smtp-relay.sendinblue.com',
        port: 587,
        login: `${process.env.SENDINBLUE_LOGIN}`,
        password: `${process.env.SENDINBLUE_PASSWORD}`,
    },
    server: {
        host: `${process.env.HOST}`,
        port: `${process.env.PORT || 8080}`,
    }
}

export default config