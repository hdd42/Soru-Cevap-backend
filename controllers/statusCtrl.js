const express = require('express')

const router = express.Router()

module.exports = (app) => {
    app.use('/api/status', (req,res,next) =>{
        res.status(200).json({
            success:0,
            message:'Api Up and runnig'
        })
    })
};


