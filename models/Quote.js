const { Sequelize } = require('sequelize');
const { connection } = require('../index');
const Quote = connection.define('Quote', {

    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }, 
    user: Sequelize.STRING,
    quote: Sequelize.STRING,
    author: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
    },
    approvals: Sequelize.INTEGER,
});
Quote.sync();
module.exports = connection.model('Quote', Quote);