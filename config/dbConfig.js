// db.js

// const { Sequelize } = require("sequelize");

// // Conexión a la base de datos MySQL
// const sequelize = new Sequelize("golfclient", "root", "", {
//   host: "localhost",
//   dialect: "mysql",
// });

// module.exports = sequelize;

const { Sequelize } = require("sequelize");

// Conexión a la base de datos MySQL
const sequelize = new Sequelize(
  "u684745967_golfClients",
  "u684745967_golfClients",
  "golfClients1423",
  {
    host: "localhost",
    dialect: "mysql",
  }
);

module.exports = sequelize;
