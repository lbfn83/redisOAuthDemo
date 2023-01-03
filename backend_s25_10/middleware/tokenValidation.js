
const jwt = require('jsonwebtoken');
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
                 jwt.verify(cookieObj.access_token, 'somesupersecretsecret',function(err, decoded){
                    console.log(err)
                    if(err.name === 'TokenExpiredError')
                 });

                // 이 에러 핸들링은 토큰 익스퍼레이션이라던가 그런 부분을 모두 고려해야 되겠구나
                // if(!decodedToken){
                //     const error = new Error('Not authenticated. ');
                //     error.statusCode = 401;
                //     throw error;
                // }

                resolve({
                    res: res,
                    req: req
                });


            } else {
                const error = new Error('Token is missing!');
                error.statusCode = 411;
                throw error;
            }
        }
        catch (error) {
            reject(error);
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