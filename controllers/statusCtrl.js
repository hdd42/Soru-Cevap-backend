const express = require('express')
const mongoose = require('mongoose')
const Question = mongoose.model('Question');
const Category = mongoose.model('Category');
const User = mongoose.model('User');
const router = express.Router()

module.exports = (app) => {
    app.use('/api/status', (req,res,next) =>{

        Category.remove({}).then(_R => console.log(_R))
        User.remove({}).then(_R => console.log(_R))
        Question.remove({}).then(_R => console.log(_R))
        res.status(200).json({
            success:0,
            message:'Api Up and runnig'
        })
    })
};


