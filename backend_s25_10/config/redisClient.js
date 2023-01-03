const redis = require('redis');

const redisClient = redis.createClient({
  url: 'redis://127.0.0.1'
})

redisClient.connect().catch(err => {
  console.log(err);
});


module.exports = redisClient;