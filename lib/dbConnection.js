const config = require("../config/config")
const mongoose = require('mongoose')
const glob = require("glob")



module.exports = class {
    static connect() {
        return new Promise((resolve, reject) => {
            mongoose.connect(config.db)
            // If the connection throws an error
            mongoose.connection.on("error", (err) => {
                console.error('Failed to connect to DB ' + config.db + ' on startup ', err);
                reject(err)
            });
            mongoose.connection.on("connected", () => {
                console.log(`Connected to db : ${config.db}`)
                resolve(true)
            })
        })

    }

    static sync() {
        const models = glob.sync(config.root + '/models/*.js');
        models.forEach(function (model) {
            require(model);
        });
        return
    }
}