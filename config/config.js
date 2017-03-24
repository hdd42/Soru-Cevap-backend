const path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

console.log("env => ", env)
const config = {
  development: {
    root: rootPath,
    app: {
      name: 'Ogrenci Yonetim Sistemi - Dev'
    },
    db:'mongodb://localhost/sorucevap-sistemi-dev',
    port: process.env.PORT || 3000,
    tokenSecret: 'dev-token-secret'
  },

  test: {
    root: rootPath,
    app: {
      name: 'test'
    },
    port:5000,
    db: 'mongodb://localhost/blog-test',
    secret:'uuid()'
  },

  production: {
    root: rootPath,
    app: {
      name: 'Ogrenci Yonetim Sistemi Prod'
    },
    port: process.env.PORT || 80,
    db:'mongodb://localhost/sorucevap-sistemi-dev',
    tokenSecret: 'prod-token-secret'
  }
};

module.exports = config[env];

