var mysql = require('mysql');

var pool = mysql.createPool({
    host: process.env.COCORA_DATABASE_HOST,
    user: 'admin',
    password: process.env.COCORA_DATABASE_PASSWORD
});

// connection.connect(null, (result) => console.info('connection', result));

exports.handler = async (event, context, callback) => {
    try {
        const p = new Promise((resolve, reject) => {
            const placeid = event.path.split('/').reverse()[0]
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }

                // noinspection SqlResolve
                connection.query("SELECT AVG(rating) AS rating FROM cocora.ratings WHERE placeid = ? ",
                    [placeid],
                    (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            const {rating} = rows[0];
                            resolve({rating})
                        }
                    })
                connection.release();
            })
        });

        const result = await p;
        // Magic code from https://stackoverflow.com/questions/60181507/cant-return-mysql-db-query-results-in-netlify-lambda-function
        callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body : JSON.stringify(result)
        })
    } catch (err) {
        console.error('Error', err);
        callback(null, {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(err, null, 4)
        })
    }
};
