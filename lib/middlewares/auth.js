const { validateToken } = require('../helpers');

class Auth {
    static  ensureAuth(roles = ['Admin','Member']) {
        return async (req, res, next) => {
            let token = req.headers['x-access-token'] || req['x-access-token']
            if (!token || token == undefined) {
               
                return res.status(401).json({ success: 0, error:'Not autharized! ' })
            }
            else {
                try {
                    let decoded = await validateToken(token)
                    let user =decoded.data;
                    console.log("Token : ", decoded.data);
                    let role =user.role
                    if (roles.indexOf(role) < 0) {
                        return res.status(401).json({ success: 0, error: 'Not autharized! ' })
                    } else {
                        req.user = user
                        return next();
                    }
                } catch (error) {
                    error.status = 401
                    return next(error)
                }
            }
        }
    }
}


module.exports = Auth;

