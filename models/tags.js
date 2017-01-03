'use strict';
module.exports = function(sequelize, DataTypes) {
  var tags = sequelize.define('tags', {
    tagName: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return tags;
};