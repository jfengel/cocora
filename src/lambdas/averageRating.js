var mysql = require('mysql');

var pool = mysql.createPool({
    host: process.env.COCORA_DATABASE_HOST,
    user: 'admin',
    password: process.env.COCORA_DATABASE_PASSWORD
});

// connection.connect(null, (result) => console.info('connection', result));

exports.handler = async (event, context, callback) => {
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({rating: 7})
    })
    return;

    const p = new Promise((resolve, _) => {
        const placeid = event.path.split('/').reverse()[0]
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error', err);
                callback(null, {
                    statusCode: 500,
                    body: JSON.stringify(JSON.stringify(err))
                })
                resolve();
                return;
            }
            console.info('connecting');
            connection.connect();
            console.info('connected');

            // noinspection SqlResolve
            connection.query("SELECT AVG(rating) AS rating FROM cocora.ratings WHERE placeid = ? ",
                [placeid],
                (err, rows) => {
                    console.info('query', JSON.stringify(rows));
                    console.info('error', JSON.stringify(err));
                    if (err) {
                        callback(null, {
                            statusCode: 500,
                            body: JSON.stringify(err, null, 4)
                        })
                    } else {
                        connection.release();
                        const {rating} = rows[0];
                        callback(null, {
                            statusCode: 200,
                            body: JSON.stringify({rating})
                        })
                        console.info('callback called back')
                    }
                    console.info('Resolving')
                    resolve();
                    console.info('Resolved');

                })
        })
    });
    await p;

    console.info('REturned');


};
