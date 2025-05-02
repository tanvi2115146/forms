
require("./config/db");
const express=require('express');
const bodyParser=require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/user.routes');
const authenticateToken = require('./middleware/authMiddleware');
const formRoute =require('./routes/form.route');
const visitorRoute=require('./routes/visitor.route');
const webhookRoutes = require('./routes/webhook.route');

const app=express();

app.use(cors({
    origin: 'http://localhost:4200', 
    credentials: true
  }));

app.use(bodyParser.json());

app.use('/auth',authRoutes);
app.use('/forms',formRoute);
app.use('/visitor',visitorRoute);
app.use('/webhook', webhookRoutes);


const port=3000;

app.listen(port,()=>{
    console.log(`server is running on http://localhost:${port}`);
})
