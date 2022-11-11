const { Sequelize } = require("sequelize");
const { connection } = require('../index');
const Infraction = connection.define('Infraction', {

    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user: Sequelize.STRING,
    infraction_type: Sequelize.STRING,
    reason: Sequelize.STRING,
});
Infraction.sync();
module.exports = connection.model('Infraction', Infraction);

