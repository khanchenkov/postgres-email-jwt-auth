const {body} = require('express-validator');
const Router = require('express').Router;
const authControllers = require('../controllers/auth.controller');
const router = new Router();

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    authControllers.registration);
router.post('/login', authControllers.login);
router.post('/logout', authControllers.logout);
router.get('/activate/:link', authControllers.activate);
router.get('/refresh', authControllers.refresh);

module.exports = router;