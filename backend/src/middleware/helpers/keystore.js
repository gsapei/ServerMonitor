"use strict";
var HashMap = require("hashmap");

class Keystore {
  constructor() {
    this.keys = new HashMap();
    this.decaytime = 1000 * 60 * 60 * 24; //in second
  }

  storeKey = function (key, itemObject) {
    this.keys.set(key, itemObject);
    setTimeout(() => this.removeKey(key), this.decaytime);
  };

  removeKey = (key) => {
    if (this.keys.has(key)) {
      this.keys.delete(key);
    }
  };

  retrieveValue = (key) => {
    return this.keys.get(key);
  };

  hasKey = (key) => {
    return this.keys.has(key);
  };
}

module.exports = Keystore;
