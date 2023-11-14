// routes/contacts.js
const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');

router.get('/', contactsController.getContacts);
router.get('/getContact/:id', contactsController.getContactById)
router.post('/', contactsController.createContact);
router.delete('/:id', contactsController.deleteContact);
router.put('/:id', contactsController.updateContact);

module.exports = router;
