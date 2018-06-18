const { sessions } = require('../models'),
  logger = require('../logger'),
  deleteByUserId = (request, response) =>
    sessions
      .destroy({
        where: {
          userId: response.locals.loggedUser.id
        }
      })
      .then(() => response.json(`All sessions for user ${response.locals.loggedUser.firstName} deleted`))
      .catch(err => {
        logger.error('There was an error accessing the database', err);
        response.status(503).json('There was an error, please try again later');
      });

module.exports = { deleteByUserId };
