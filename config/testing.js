exports.config = {
  environment: 'testing',
  isTesting: true,
  common: {
    database: {
      name: 'wolox-training'
    },
    session: {
      secret: 'some-super-secret'
    }
  }
};
