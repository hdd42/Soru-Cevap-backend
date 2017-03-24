const  express = require("express")
const Db  = require('./lib/dbConnection')
const config= require("./config/config")

const app = express();
 //Mongoose Models Sync!
Db.sync()

//export Routed App;
module.exports = require('./config/express')(app, config)

startServer();
async function startServer() {
    try {        
        //connect to mongo db
        await Db.connect()
        await app.listen(3000)
        console.log(`app started : localhost:${3000}`)
    }
    catch (err) {
        console.log("Starting server failed...: ", err.message || '')
        console.log("Application will be shot down! ")
        process.exit(0);
    }
}
