const path=require('path')
const express=require('express')
const dotenv=require('dotenv')
const morgan =require('morgan')
const exphbs = require('express-handlebars')
const connectDB=require('./config/db')

//load config
dotenv.config({path: './config/config.env'})

connectDB()

const app=express()

//logging
process.env.NODE_ENV==='development'?app.use(morgan('dev')):null;

//Handlebars
app.engine('.hbs', exphbs.engine({
        defaultLayout:'main',
        extname:'.hbs'
    }
    ))
app.set('view engine', '.hbs')

// static folder

app.use(express.static(path.join(__dirname,'public')))

//routes

app.use('/',require('./routes/index'))
app.use('/dashboard', require('./routes/index'))

const PORT=process.env.PORT||5001

app.listen(PORT,console.log(`server running on ${process.env.NODE_ENV} mode on port: ${PORT}`)) 