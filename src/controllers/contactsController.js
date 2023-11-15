// controllers/contactsController.js
const Contact = require("../models/contact");
const { fetch, post, patch, deleteContact } = require("../utils");

async function processContactData(contacts) {
  const promises = contacts.map(async (contact) => {
    try {
      let [response, responseEmail, responsePhone] = await Promise.all([
        fetch(contact.url),
        fetch(
          `https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts/${contact.id}/emails/0`
        ),
        fetch(
          `https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts/${contact.id}/phones/1`
        ),
      ]);

      contact.city = response.address.city;
      contact.email = responseEmail.address ? responseEmail.address : null;
      contact.phone =
        responsePhone && responsePhone.number ? responsePhone.number : null;
      contact.firstname = response.name.first;
      contact.lastname = response.name.last;
    } catch (error) {
      console.error("Error processing contact:", error.message);
    }
  });

  await Promise.all(promises);

  return contacts;
}

exports.getContacts = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;

    const nextPage = req.query.next;

    let url = nextPage
      ? nextPage
      : `https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts?limit=${limit}`;

    const { city, name, email, phone } = req.query;

    if (city) {
      url += `&q=address.city LIKE '${city}'`;
    }

    if (name) {
      url += `&q=lookupName LIKE '${name}'`;
    }

    if (email) {
      url += `&q=emails.address LIKE '${email}'`;
    }

    if (phone) {
      url += `&q=phones.number LIKE '${phone}'`;
    }

    const data = await fetch(url);

    console.log(data)

    const next = data.links[2].href;

    const contacts = data.items.map((contact) => ({
      id: contact.id,
      name: contact.lookupName,
      url: contact.links[0].href,
      createdAt: contact.createdTime,
      updateAt: contact.updatedTime,
    }));

    const filledContacts = await processContactData(contacts);
    await Contact.destroy({ where: {} });

    await Contact.bulkCreate(filledContacts, { ignoreDuplicates: true });

    res.json({ data: filledContacts, next });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contactId = req.params.id;
    let message = "Success";

    const response = await fetch(
      `https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts/${contactId}`
    );

    let filledContact;

    if (response === undefined) {
      message = "There are no contacts with this id";
    } else {
      const result = {
        id: response.id,
        name: response.lookupName,
        url: response.links[0].href,
        createdAt: response.createdTime,
        updatedAt: response.updatedTime,
      };

      filledContact = await processContactData([result]);
    }

    res.json({ data: filledContact, message: message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createContact = async (req, res) => {
  try {
    const { firstname, lastname, address, emails, phones } = req.body;

    if (!firstname || !lastname || !address || !emails || !phones) {
      return res.status(400).json({
        error: "Se requieren datos esenciales para crear un contacto.",
      });
    }

    const body = {
      name: {
        first: firstname,
        last: lastname,
      },
      address: {
        city: address.city,
      },
      emails: {
        address: emails.address,
        addressType: {
          id: 0,
        },
      },
      phones: {
        number: phones.number,
        phoneType: {
          id: 1,
        },
      },
    };

    const response = await post(
      "https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts",
      body
    );

    const result = {
      id: response.id,
      name: response.lookupName,
      url: response.links[0].href,
      createdAt: response.createdTime,
      updatedAt: response.updatedTime,
    };

    const filledContact = await processContactData([result]);

    res.json({
      data: filledContact[0],
      message: "Contact successfully created",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contactId = req.params.id;
    let message = "Contact deleted successfully";

    const response = await deleteContact(contactId);

    if (response === undefined) {
      message = "There are no contacts with this id";
    }

    res.json({ message: message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const contactId = req.params.id;
    const { firstname, lastname, address, emails, phones } = req.body;
    message = "Contact correctly updated";

    if (!firstname || !lastname || !address || !emails || !phones) {
      return res.status(400).json({
        error: "Se requieren datos esenciales para crear un contacto.",
      });
    }

    const body = {
      name: {
        first: firstname,
        last: lastname,
      },
      address: {
        city: address,
      },
      emails: {
        address: emails,
        addressType: {
          id: 0,
        },
      },
      phones: {
        number: phones,
        phoneType: {
          id: 1,
        },
      },
    };

    const response = await patch(
      `https://imaginecx--tst2.custhelp.com/services/rest/connect/v1.3/contacts/${contactId}`,
      body
    );

    if (response === undefined) {
      message = "There are no contacts with this id";
    }

    res.json({ message: message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContactsDb = async (req, res) => {
  try {
    const contacts = await Contact.findAll();

    res.json({ data: contacts });
  } catch (error) {
    console.error("Error al obtener contactos:", error);
    res.status(500).json({ error: "Error al obtener contactos." });
  }
};
