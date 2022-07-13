const express = require('express')
require('dotenv').config()
const morgan = require('morgan')
const app = express()
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
    
//For swagger documentation
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')
app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerDocument))
    
    
//regular middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//cookies and file middleware
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir:'/tmp/'
}))

//setting ejs
app.set('view engine','ejs')

//morgan middleware
app.use(morgan('tiny'))


//Routes
const home = require('./routes/home')
const user = require('./routes/user')
const product = require('./routes/product')
const payment = require('./routes/payment')
const order = require('./routes/order')


//router middleware
app.use('/api/v1', home)
app.use('/api/v1', user)
app.use('/api/v1', product)
app.use('/api/v1', payment)
app.use('/api/v1', order)



app.get('/signuptest', (req, res) => {
    res.render('signuptest')
})


module.exports = app;