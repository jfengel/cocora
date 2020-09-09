var mysql = require('mysql');

var pool = mysql.createPool({
    host: process.env.COCORA_DATABASE_HOST,
    user: 'admin',
    password: process.env.COCORA_DATABASE_PASSWORD
});

exports.handler = (event, context, callback) => {
    // Magic code from https://stackoverflow.com/questions/60181507/cant-return-mysql-db-query-results-in-netlify-lambda-function
    context.callbackWaitsForEmptyEventLoop = false

    const placeid = event.path.split('/').reverse()[0]
    pool.getConnection((err, connection) => {
        const reject = (err) => {
            console.error(err);
            callback(null, {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(err, null, 4)
            })
        }

        if (err) {
            return reject(err);
        }

        // noinspection SqlResolve
        connection.query("SELECT AVG(rating) AS rating FROM cocora.ratings WHERE placeid = ? ",
            [placeid],
            (err, rows) => {
                connection.release();
                if (err) {
                    return reject(err);
                } else {
                    callback(null, {
                        statusCode: 200,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(rows[0])
                    })
                }
            })
    })
}
