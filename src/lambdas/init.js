var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : process.env.COCORA_DATABASE_HOST,
    user     : 'admin',
    password : process.env.COCORA_DATABASE_PASSWORD
});

connection.connect(null, (result) => console.info('connection', result));

exports.handler = (event, context, callback) => {

    connection.query("CREATE SCHEMA IF NOT EXISTS cocora", function(err) {
        if(err) {
            callback(null, {
                statusCode: 500,
                body: JSON.stringify(err, null, 4)
            })
        }
        const create = 'CREATE TABLE `cocora`.`ratings` (\n' +
            '  `userid` VARCHAR(32) NOT NULL,\n' +
            '  `placeid` VARCHAR(45) NOT NULL,\n' +
            '  `days_since_epoch` INT NOT NULL,\n' +
            '  `rating` TINYINT NOT NULL,\n' +
            '  `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n' +
            '  PRIMARY KEY (`userid`, `placeid`),\n' +
            '  INDEX `userid` (`userid` ASC),\n' +
            '  INDEX `placeid` (`placeid` ASC));\n'
        connection.query(create, (err, rows, fields) => {
                if (err) {
                    callback(null, {
                        statusCode: 500,
                        body: JSON.stringify(err, null, 4)
                    })
                } else {
                    callback(null, {
                        statusCode: 200,
                        body: JSON.stringify(rows, null, 4)
                            + '\n\n'
                            + JSON.stringify(fields, rows, 4)
                    })
                }
            }
        )
    });




};
