const { users } = require('../app/models');

const firstUser = {
  email: 'jane.doe@wolox.cl',
  password: '$2a$10$Rtxlqx205LNuguX2htEK2./zuVhdtRRGJMgzPFntc3biK3/7C2rUC', // 12345678
  firstName: 'Jane',
  lastName: 'Doe'
};

const secondUser = {
  email: 'jane.doe@wolox.com.ar',
  password: '$2a$10$Rtxlqx205LNuguX2htEK2./zuVhdtRRGJMgzPFntc3biK3/7C2rUC', // 12345678
  firstName: 'Jane',
  lastName: 'Doe'
};

const thirdUser = {
  email: 'noctis.lucis@wolox.com.ar',
  password: '$2a$10$Rtxlqx205LNuguX2htEK2./zuVhdtRRGJMgzPFntc3biK3/7C2rUC', // 12345678
  firstName: 'Noctis',
  lastName: 'Lucis'
};

exports.execute = async () => {
  await users.create(firstUser);
  await users.create(secondUser);
  return users.create(thirdUser);
};
