// db.js

const { Sequelize } = require("sequelize");

// Conexión a la base de datos MySQL
const sequelize = new Sequelize("golfclient", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
