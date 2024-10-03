const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Progress = sequelize.define('Progress', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        lessonId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    });

    return Progress;
};
