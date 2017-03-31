const Sequelize = require('sequelize');
const config = require("./config")
var sequelize = new Sequelize(config.database.DATABASE, config.database.USERNAME, config.database.PASSWORD, {
    host: "localhost",
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});
var User = sequelize.define('logins', {
    name: Sequelize.STRING(50),
    password: Sequelize.STRING(50)
}, {
        timestamps: false
    });
module.exports = {User:User}

