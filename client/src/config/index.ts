const config = {
    defaults: {
        namespace: 'Client'
    },
    firebase: {
        apiKey: `${process.env.REACT_APP_FIREBASE_API_KEY}`,
        authDomain: `${process.env.REACT_APP_FIREBASE_AUTH_DOMAIN}`,
        projectId: `${process.env.REACT_APP_FIREBASE_PROECT_ID}`,
        storageBucket: `${process.env.REACT_APP_FIREBASE_STORAGE_BUCKET}`,
        messagingSenderId: `${process.env.REACT_APP_FIREBASE_MESENGER_SENDER_ID}`,
        appId: `${process.env.REACT_APP_FIREBASE_APP_ID}`
    },
    emailjs: {
        serviceid: `${process.env.REACT_APP_EMAILJS_SERVICE_ID}`,
        templateID: `${process.env.REACT_APP_EMAILJS_TEMPLATE_ID}`,
        privateKey: `${process.env.REACT_APP_EMAILJS_PRIVATE_KEY}`, 
        publicKey: `${process.env.REACT_APP_EMAILJS_PUBLIC_KEY}`
    },
    server: `${process.env.SERVER || 'https://jackblackr.herokuapp.com' || 'http://localhost:8080'}`
}

export default config