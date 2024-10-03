const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Achat = sequelize.define('Achat', {
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
      references: {
        model: 'Users', // Ensure this matches your actual Users table name
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    cursusId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Cursus', // Ensure this matches your actual Cursus table name
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Lessons', // Ensure this matches your actual Lessons table name
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
  });

  return Achat;
};
