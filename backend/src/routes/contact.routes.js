const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contact.controller');
const validateContact = require('../validators/contact.validator');

router.post('/', validateContact, contactController.sendContact);

module.exports = router;