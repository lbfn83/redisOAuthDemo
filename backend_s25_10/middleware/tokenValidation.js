const jwt = require('jsonwebtoken');
const redisClient = require('../config/redisClient');


module.exports = (req, res, next) => {
    return new Promise((resolve, reject) => {
        const cookies = req.headers.cookie;
        let cookieObj = {};
        try {

            if (cookies) {
                const cookieArry = cookies.split(';')
                // https://stackoverflow.com/questions/11508463/javascript-set-object-key-by-variable
                cookieArry.forEach((elem) => {
                    const keyValue = elem.trim().split('=');
                    cookieObj[keyValue[0]] = keyValue[1];
                });

                if (!cookieObj.access_token || !cookieObj.refresh_token) {
                    const error = new Error('Token is missing!');
                    error.statusCode = 411;
                    throw error;
                }
                // jwt verify error handling and how the error is defined
                // it verifies the validity of token, but doesn't authenticate its credentials from DB
                
                // When token is expired, verify() doesn't yield the decoded result, so don't have a way to retrieve userID encoded inside the access token
                // As of now, redis key-value is configured as user id - refresh token.. 
                // but I might have to change this into access token - refresh token. 

                // Oh I found answer for this!!!!
                // extract payload of expired jwt token
                // https://stackoverflow.com/questions/51281270/extract-payload-of-expired-jwt-token#fromHistory
                // ignoreExpiration flag actually doesn't invoke TokenExpiredError
                jwt.verify(cookieObj.access_token, 'somesupersecretsecret', async function (err, decoded) {
                    console.log(err)
                    if (err) {
                        // There are three types of errors, but we actually only care
                        // about this one, because it says that the access token
                        if (err.name === 'TokenExpiredError') {
                            decoded = jwt.verify(cookieObj.access_token, 'somesupersecretsecret', {ignoreExpiration: true});
                            // first look up redis whether refresh token is right
                            const aa = await redisClient.get(decoded.userId);
                            console.log("asdfasdfa" , await aa);
                            resolve({
                                res: res,
                                req: req
                            });
                        } else {
                            // If any error other than "TokenExpiredError" occurs, it means
                            // that either token is invalid, or in wrong format, or ...
                            const error = new Error('Token is invalid!');
                            error.statusCode = 411;
                            throw error;
                        }

                    } else {
                        req.userId = decoded.userId
                        resolve({
                            res: res,
                            req: req
                        });
                    }
                });


            } else {
                const error = new Error('Token is missing!');
                error.statusCode = 411;
                throw error;
            }
        }
        catch (error) {
            // For the express's defualt error handler to be able to kick in, use next() instead of reject()
            next(error);
        }
    });
}

function aaa() {
    return new Promise((resolve, reject) => {
        // const cookies = req.headers.cookie;
        const cookies = 'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxiZm44M0BnbWFpbC5jb20iLCJ1c2VySWQiOiI2M2FiNGY5NjYwZjJhMWI4MmY4MTdiODEiLCJpYXQiOjE2NzI2Nzg0MzgsImV4cCI6MTY3MjY4MjAzOH0.rLW0iVAeYKEIaIJyfo1lkovoCiIA9Z8hJIQqii34j5s; access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxiZm44M0BnbWFpbC5jb20iLCJ1c2VySWQiOiI2M2FiNGY5NjYwZjJhMWI4MmY4MTdiODEiLCJpYXQiOjE2NzI2NzkxNTMsImV4cCI6MTY3MjY4Mjc1M30.Qd1-x0moaD-SeI_V_GrzHm3JN38lV5vTsoAOBVD9uSo; refresh_token=x16yb4tg2k0ail0lon5kf8d5m93kzyz7dzowe8cva39pi17abrk8g37vvyaqj03v'
        const cookieArry = cookies.split(';')
        let answer = {};
        cookieArry.forEach((elem, index) => {
            const keyValue = elem.trim().split('=');
            answer[keyValue[0]] = keyValue[1];
        })
        cookieArry.forEach(element => {
            console.log(element)
        });
    });
}

aaa();