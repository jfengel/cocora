var mysql = require('mysql');

var pool = mysql.createPool({
    host: process.env.COCORA_DATABASE_HOST,
    user: 'admin',
    password: process.env.COCORA_DATABASE_PASSWORD
});

// connection.connect(null, (result) => console.info('connection', result));

exports.handler = (event, context, callback) => {
    const placeid = event.path.split('/').reverse()[0]
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error', err);
            callback(null, {
                statusCode: 500,
                body: JSON.stringify(JSON.stringify(err))
            })
            return;
        }
        console.info('Pool yielded connection', JSON.stringify(connection));
        connection.connect();
        console.info('connected');

        connection.query("SELECT AVG(rating) AS rating FROM cocora.ratings WHERE placeid = ? ",
            [placeid],
            (err, rows) => {
                console.info('query', JSON.stringify(err), JSON.stringify(rows));
                if (err) {
                    callback(null, {
                        statusCode: 500,
                        body: JSON.stringify(err, null, 4)
                    })
                } else {
                    const {rating} = rows[0];
                    callback(null, {
                        statusCode: 200,
                        body: JSON.stringify({rating})
                    })
                }
            })
    })


};
