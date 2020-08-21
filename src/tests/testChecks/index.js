const _ = require("lodash");

const isObject = (obj) => {
  if (_.isArray(obj) || !obj) return false;
  return _.isObject(obj);
};

const containsProperty = (obj, ...args) => {
  if (!isObject(obj)) return false;
  for (const arg of args) {
    if (!_.has(obj, [arg])) return false;
  }
  return true;
};

const areAllPropertyFunc = (obj, ...args) => {
  if (!isObject(obj)) return false;
  for (const arg of args) {
    if (!_.isFunction(obj[arg])) return false;
  }
  return true;
};

module.exports = {
  isObject,
  containsProperty,
  areAllPropertyFunc,
};
