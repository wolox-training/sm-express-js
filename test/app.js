'use strict';

const fs = require('fs'),
  path = require('path'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  models = require('../app/models'),
  dataCreation = require('../scripts/dataCreation');

chai.use(chaiHttp);

const getTablesQuery = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';`;

// THIS WORKS ONLY WITH POSTGRESQL
beforeEach('Erase data, restart identities and populate sample data', done => {
  models.sequelize.query(getTablesQuery).then(tables => {
    const tableExpression = tables
      .filter(([tableName]) => tableName !== 'SequelizeMeta')
      .map(([tableName]) => `"public"."${tableName}"`)
      .join(', ');
    return models.sequelize
      .query(`TRUNCATE TABLE ${tableExpression} RESTART IDENTITY`)
      .then(() => {
        return dataCreation.execute();
      })
      .then(() => done());
  });
});

// including all test files
const normalizedPath = path.join(__dirname, '.');
fs.readdirSync(normalizedPath).forEach(file => {
  if (fs.lstatSync(`${normalizedPath}/${file}`).isDirectory()) {
    fs.readdirSync(`${normalizedPath}/${file}`).forEach(inFile => {
      require(`./${file}/${inFile}`);
    });
  } else {
    require(`./${file}`);
  }
});
