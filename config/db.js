const mongoose = require('mongoose')
const { MONGODB_URI } = process.env

const connectWithDB = () => {
    mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(console.log('DB CONNECTED'))
    .catch(error => {
        console.log('DB CONNECTION ISSUES')
        console.log(error)
        process.exit(1)
    })
    
}

module.exports = connectWithDB