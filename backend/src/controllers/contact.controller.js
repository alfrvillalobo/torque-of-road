const contactService = require('../services/contact.service');

const sendContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    const newContact = await contactService.createContact({
      name,
      email,
      message,
    });

    res.status(201).json({
      message: 'Contacto guardado correctamente',
      data: newContact,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendContact,
};