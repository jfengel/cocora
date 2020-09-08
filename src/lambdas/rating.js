var mysql = require('mysql');
const HttpStatus = require('http-status-codes')

var pool = mysql.createPool({
    host: process.env.COCORA_DATABASE_HOST,
    user: 'admin',
    password: process.env.COCORA_DATABASE_PASSWORD
});

const MSEC_PER_DAY = 1000 * 60 * 60 * 24;

exports.handler = (event, context, callback) => {
    console.info('context', context);
    console.info('event', event);
    const {user} = context.clientContext;
    const userid = user && user.sub;
    if(!userid) {
        return callback(null, {
            statusCode: HttpStatus.UNAUTHORIZED,
            body: JSON.stringify("You must log in to rate places.")

        })
    }
    context.callbackWaitsForEmptyEventLoop = false
    pool.getConnection((err, connection) => {

        const placeid = event.path.split('/').reverse()[0]
        const rating = parseInt(event.queryStringParameters.value);
        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            callback(null, {
                statusCode: HttpStatus.BAD_REQUEST,
                body: JSON.stringify("Invalid rating")
            })
            return;
        }
        const days_since_epoch = Math.floor(Date.now() / MSEC_PER_DAY)
        connection.query("REPLACE INTO cocora.ratings SET ?",
            {
                userid, placeid, days_since_epoch, rating,
            }
            , function (err) {
                connection.release();
                if (err) {
                    callback(null, {
                        statusCode: 500,
                        body: JSON.stringify(err, null, 4)
                    })
                } else {
                    callback(null, {
                        statusCode: 200,
                        body: JSON.stringify("Success")
                    })
                }
            });

    })


};
