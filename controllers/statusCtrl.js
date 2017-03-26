const express = require('express')
const mongoose = require('mongoose')
const Question = mongoose.model('Question');
const Category = mongoose.model('Category');
const User = mongoose.model('User');
const router = express.Router()

module.exports = (app) => {
    app.use('/api/status', (req,res,next) =>{  
        res.status(200).json({
            success:0,
            message:'Api Up and runnig'
        })
    })

    app.use('/feed', async (req,res,nex) =>{

        await Category.remove({}).then(_R => console.log("deleted category"))
        await User.remove({}).then(_R => console.log("deleted Users"))
   await  User.create({
         name:'Admin',
         email:'admin@admin.com',
         password:'123456'
     })
console.log('created user')
     await createCategory()
console.log('created category')
      Question.remove({}).then( async(_R)  => {        
        let cat = await Category.find({})
        let user = await User.findOne({})
        for(let i =0 ; i < 150 ; i++){
            
            await Question.create({
                title :`Question  ${i}`,
                questionRawText:` Question Raw Text ${i}`,
                question:`ornek soru ${i}`,
                user:user._id,
                categories:getCategories(cat)
            })
        }
        console.log('created quesions')
      })
        res.status(200).send('feeded!')
    })
};

function createCategory(){
    return new Promise((resolve, reject) =>{
        Promise.all([
            Category.create({name:'C#' , description:'.NET in altin cocugu' , imgUrl:'/assets/img/categories/CSharp-Logo.png'}),
            Category.create({name:'Java' , description:'Guclue, stabil, herseye yeter' , imgUrl:'/assets/img/categories/java_logo.png'}),
            Category.create({name:'PHP' , description:'Internetin en cok kullanilan dili' , imgUrl:'/assets/img/categories/php-icon.png'}),
            Category.create({name:'Ruby' , description:'Yakisikli, sempatik, tembel' , imgUrl:'/assets/img/categories/ruby-logo.png'}),
            Category.create({name:'MYSQL' , description:'Zor isler bunlar' , imgUrl:'/assets/img/categories/coding.png'}),
            Category.create({name:'Oracle' , description:'Pahali, Hantal, Kibirli' , imgUrl:'/assets/img/categories/coding.png'}),
            Category.create({name:'MongoDB' , description:'Her sey her sey olabilir!' , imgUrl:'/assets/img/categories/coding.png'}),
            Category.create({name:'ASP.NET' , description:'.NET Web bye bye' , imgUrl:'/assets/img/categories/coding.png'}),
        ])
        .then(() => resolve())
        .catch((err) => reject(err))
    })
}

function getCategories(cat){
    let orders = [1,2,3,4]
    let rand = getRandomInt(0,3)
    let til = orders[rand]
    let out =[]
    for(let i =0 ; i<til ; i++)
    {
        let _cat =cat[getRandomInt(0,cat.length-1)]
        if(out.indexOf(_cat._id) < 0)
        out.push(_cat._id)
    }
    return out
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}