const jwt = require('jsonwebtoken');
const redisClient = require('../config/redisClient');
const generate_refresh_token = require('../helper/refresh_token');


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
                jwt.verify(cookieObj.access_token, 'somesupersecretsecret', { ignoreExpiration: true }, async function (err, decoded) {
                    if (err) {
                        // either token is invalid, or in wrong format, or ...
                        const error = new Error('Token is invalid!');
                        error.statusCode = 411;
                        throw error;
                    }

                    // https://stackoverflow.com/questions/39926104/what-format-is-the-exp-expiration-time-claim-in-a-jwt
                    // A JSON numeric value representing the number of seconds from 1970-01-01T00:00:00Z UTC until the specified UTC date/time, ignoring leap seconds. 
                    // let's replace "if (err.name === 'TokenExpiredError')" with the below
                    const currTS = new Date();
                    const expTS = new Date(decoded.exp * 1000);
                    if (expTS < currTS) {
                        // first look up redis whether refresh token is right
                        const queryResult = await redisClient.get(decoded.userId);
                        const refreshTKinfo = JSON.parse(queryResult);
                        if (!refreshTKinfo || refreshTKinfo.refresh_token !== cookieObj.refresh_token) {
                            const error = new Error('Nice Try ;)!');
                            error.statusCode = 411;
                            throw error;
                        } else {
                            // It can also happen that the refresh token expires; in that case
                            // we need to issue both tokens at the same time
                            if (refreshTKinfo.expiresIn < currTS) {
                                // refresh token expired, we issue refresh token as well
                                let refresh_token = generate_refresh_token(64);

                                // Then we assign this token into httpOnly cookie using response
                                // object. I disabled the secure option - if you're running on
                                // localhost, keep it disabled, otherwise uncomment it if your
                                // web app uses HTTPS protocol
                                res.cookie("refresh_token", refresh_token, {
                                    // secure: true,
                                    httpOnly: true
                                });

                                // Then we refresh the expiration for refresh token. 1 month from now
                                let refresh_token_maxage = new Date() + jwt_refresh_expiration;

                                redisClient.set(
                                    decoded.userId,
                                    JSON.stringify({
                                        refresh_token: refresh_token,
                                        expiresIn: refresh_token_maxage
                                    })
                                );
                            }
                            // Then we issue access token. Notice that we save user ID
                            // inside the JWT payload
                            // {
                            //     email: loadedUser.email,
                            //     userId: loadedUser._id.toString()
                            //   },
                            // 이때도 이메일 주소로 해주는게 좋잖아
                            let accessToken = jwt.sign({
                                email : decoded.email,
                                userId: decoded.userId
                            }, 
                            'somesupersecretsecret', 
                            {  expiresIn: '1m'});

                            // Again, let's assign this token into httpOnly cookie.
                            res.cookie("access_token", accessToken, {
                                // secure: true,
                                httpOnly: true
                            });
                        }
                        resolve({
                            res: res,
                            req: req
                        });
                    }
                    else {
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