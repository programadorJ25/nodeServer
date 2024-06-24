// message.model.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig"); // Importa la instancia de Sequelize

const Message = sequelize.define("Message", {
  plcId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Message;
