const path=require('path')//?url management
const express=require('express')//?routing
const dotenv=require('dotenv')//? .env files to store "secrets"
const morgan =require('morgan')//? logger to tell you whats going on
const exphbs = require('express-handlebars')//? ejs replacement
const methodOverride = require('method-override')
const passport=require('passport')//?authentication
const session=require('express-session')//?session initialisation
const MongoStore=require('connect-mongo')//?session storage
const connectDB=require('./config/db')//? connect to database on server start

//load config
dotenv.config({path: './config/config.env'})

//passport config
require('./config/passport')(passport)

connectDB()

const app=express()

//body parse

app.use(express.urlencoded({extended: false}))
app.use(express.json())

//method override
app.use(methodOverride((req,res)=>{
    if(req.body && typeof req.body === 'object' && '_method' in req.body){
        let method = req.body._method
        delete req.body._method
        return method
    } 
}))


//logging
process.env.NODE_ENV==='development'?app.use(morgan('dev')):null;

//handlebars helpers
const {formatDate,stripTags,turnicate,editIcon,select}=require('./helpers/hbs')

//Handlebars
app.engine('.hbs', exphbs.engine({
        helpers:{
            formatDate,
            stripTags,
            turnicate,
            editIcon,
            select
        },
        defaultLayout:'main',
        extname:'.hbs'
    }
    ))
app.set('view engine', '.hbs')

//express session

app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        //store session into database for longer sessions
        store:MongoStore.create({
            mongoUrl: process.env.MONGO_URI
        })
    })
)


//passport middleware
app.use(passport.initialize())
app.use(passport.session())

//global variables
app.use((req,res,next)=>{
    res.locals.user=req.user ||null
    next()
})

// static folder

app.use(express.static(path.join(__dirname,'public')))

//routes

app.use('/',require('./routes/index'))
app.use('/auth',require('./routes/auth'))
app.use('/stories',require('./routes/stories'))

const PORT=process.env.PORT||5001

app.listen(PORT,console.log(`server running on ${process.env.NODE_ENV} mode on port: ${PORT}`)) 