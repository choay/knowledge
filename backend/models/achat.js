// models/achat.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Achat', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Ensure this matches the actual table name
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    cursusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cursus', // Ensure this matches the actual table name
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Lessons', // Ensure this matches the actual table name
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    lessonIds: {
      type: DataTypes.JSON, // Store lesson IDs as JSON
      allowNull: true,
    },
  });
};
