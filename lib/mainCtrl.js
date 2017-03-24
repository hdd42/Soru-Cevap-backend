//import { checkMongoId } from '../lib/helpers'

/**
 * TO DO
 * look for exppres.response.append for adding resource url
 * and auto headers
 */
class MainCtrl {
    
    constructor(){

    }
    //handle all error
    errorHandler(controller) {
        return async function (req, res, next) {
            try {
                await controller(req, res, next);
            } catch (err) {
                console.log("err : ", err)
                next(err);
            }
        }
    }

    notAllowed(req, res) {
        res.status(405).json({ error: "Method not allowed" });
    }

    checkReq(requiredCheck={}) {
        return (req, res, next) => {
        
            if(requiredCheck.check){
             let message =  this.checkRequired(req.body, requiredCheck.action)
             if(message.length > 0) return res.status(400).json({success:0 , message})     
            }
            let reservedKeys;
            if (this.reservedKeys) {
                reservedKeys = this.reservedKeys;
            } else {
                reservedKeys = this.defaultReservedKeys()
            }

            for (let reservedKey of reservedKeys) {
                if (req.body[reservedKey]) {
                    return res.status(400).json({
                        error: `Cannot specify '${reservedKey}' as part of request body`
                    });
                }
            }
            next();
        }
    }
    checkId(type = 'mongo', slug=false) {
        return (req, res, next) => {
            const id = req.params.id;
                    
            if (type == 'mongo' && !slug) {
                if (checkMongoId(id)) {
                    next();
                } else {
                    return res.status(400).json({
                        error: `This is not a valid id format, provided id : ${id}`
                    });
                }
            }
            else{
                if(!req.query.slug) return res.status(400).json({
                    error: `This is not a valid id or slug format, provided id : ${id}, slug : ${slug}`
                })
                next();
            }

        }
    }

    checkRequired(body, action){
        
        let missing = [];
        console.log('Body : ', body)
          for (let field of this[action].required) {
                if (!body[field]) {
                    missing.push(`the field '${field}' is required`)
                }
            }
         return missing;   
    }

    defaultReservedKeys() {
        return ["_id", "id", "createdAt", "updatedAt", 'deletedAt']
    }
    OK(){
        console.log("Okay!!!")
    }
}

module.exports =  MainCtrl