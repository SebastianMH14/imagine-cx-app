// controllers/contactsController.js
const { Contact, ContactData } = require('../models/contact');
const axios = require('axios');


const username = 'ICXCandidate';
const password = 'Welcome2021';

const base64Credentials = Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');

const config = {
  headers: {
    'Authorization': `Basic ${base64Credentials}`,
    'Content-Type': 'application/json',
  },
};

async function processContactData(contacts) {
  for (let contact of contacts) {
    let response = await axios.get(contact.url, config)
    contact.city = response.data.address.city
    let responseEmail = await axios.get(`https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts/${contact.id}/emails/0`, config)
    let responsePhone = await axios.get(`https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts/${contact.id}/phones/1`, config)
    contact.email = responseEmail.data.address
    contact.phone = responsePhone.data.number
    console.log(contact)
  }
  return contacts
}

exports.getContacts = async (req, res) => {
  try {

    const limit = req.query.limit ? parseInt(req.query.limit) : 0;

    const response = await axios.get(
      `https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts?limit=${limit}`, config);

    const data = response.data;


    const contacts = data.items.map(contact => ({
      id: contact.id,
      name: contact.lookupName,
      url: contact.links[0].href,
      createdAt: contact.createdTime
    }));

    filledContacts = processContactData(contacts)

    console.log(filledContacts)

    result = await Contact.bulkCreate(contacts, { ignoreDuplicates: true });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contactId = req.params.id;


    const response = await axios.get(
      `https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts/${contactId}`, config);

    const contactData = response.data;

    delete contactData.id

    const [contact, created] = await ContactData.findOrCreate({
      where: { id: contactId },
      defaults: {
        data: contactData,
      },
    });

    res.json({ contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    await contact.destroy();
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      res.status(404).json({ error: 'Contact not found' });
      return;
    }

    await contact.update(req.body);
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
