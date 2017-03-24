const express = require('express');
const glob = require('glob');
const logger = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const path = require('path')

module.exports = function (app, config) {
    const env = process.env.NODE_ENV || 'development';
    app.locals.ENV = env;
    app.locals.ENV_DEVELOPMENT = env == 'development';

    app.set('json spaces', 2)
    if (env == 'development') {
        app.use(logger('dev'));
    } else {
        app.use(logger('tiny'));
    }
    app.use(cors())
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    if (env == 'production') {
        app.use(compress());
    }
    app.use(express.static(config.root + '/public'));
    app.use(methodOverride());

    /* if (env != 'development') {
        app.use('/api*', (req, res, next) => {
            const token = req.get('Authorization-Key');
            if (token && token == 'f9d68a73-0d9c-46fc-9e82-255cd695ecbf') return next()
            return res.status(401).send({ success: 0, message: 'not authorized' })
        })
    }
      */

    const controllers = glob.sync(config.root + '/controllers/*.js');

    controllers.forEach(function (controller) {
        require(controller)(app);
    });
    //
    app.use('/api/*', function (req, res, next) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

  /*  app.use('*', (req, res, next) => {
        res.sendFile(path.join(config.root + '/public/index.html'));
    })*/
    if (app.get('env') === 'development') {

        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.json({
                'error': {
                    message: err.message,
                    error: err,
                    title: 'error'
                }
            });
        });
    }

    app.use(function (err, req, res, next) {
        res.status(err.status || 500);

        res.json({
            'error': {
                message: err.message,
                error: {},
                title: 'error'
            }
        });
    });

    return app;
};
