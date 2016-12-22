'use strict';
module.exports = function(sequelize, DataTypes) {
  var tablename = sequelize.define('tablename', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return tablename;
};