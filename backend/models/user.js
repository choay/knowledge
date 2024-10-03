const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),  // Corrected here
      defaultValue: 'user', // Set default role
    },
    activationToken: {
      type: DataTypes.STRING,
    },
    activationExpires: {
      type: DataTypes.DATE,
    },
  });

  return User;
};
