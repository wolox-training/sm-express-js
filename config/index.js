const ENVIRONMENT = process.env.NODE_ENV || 'development';

if (ENVIRONMENT !== 'production') {
  require('dotenv').config();
}

const configFile = `./${ENVIRONMENT}`;

const isObject = variable => {
  return variable instanceof Object;
};

/*
 * Deep copy of source object into tarjet object.
 * It does not overwrite properties.
*/
const assignObject = (target, source) => {
  if (target && isObject(target) && source && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(target, key)) {
        target[key] = source[key];
      } else {
        assignObject(target[key], source[key]);
      }
    });
    return target;
  }
};

const config = {
  common: {
    database: {
      url: process.env.NODE_API_DB_URL,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    },
    api: {
      bodySizeLimit: process.env.API_BODY_SIZE_LIMIT,
      parameterLimit: process.env.API_PARAMETER_LIMIT,
      pageLimit: process.env.API_PAGE_LIMIT,
      albumsEndpointHost: process.env.API_ALBUMS_ENDPOINT_HOST,
      albumsEndpointRoute: process.env.API_ALBUMS_ENDPOINT_ROUTE,
      photosEndpointHost: process.env.API_PHOTOS_ENDPOINT_HOST,
      photosEndpointRoute: process.env.API_PHOTOS_ENDPOINT_ROUTE
    },
    session: {
      header_name: 'authorization',
      secret: process.env.NODE_API_SESSION_SECRET,
      expireTime: process.env.NODE_API_SESSION_EXPIRE_TIME
    },
    rollbar: {
      accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
      environment: process.env.ROLLBAR_ENV
    },
    email: {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      sender: {
        email: process.env.EMAIL_SENDER_EMAIL,
        name: process.env.EMAIL_SENDER_NAME
      }
    },
    port: process.env.PORT
  }
};

if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) delete config.common.email.auth;

const customConfig = require(configFile).config;
module.exports = assignObject(customConfig, config);
