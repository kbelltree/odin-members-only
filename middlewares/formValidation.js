require('dotenv').config();
const { body } = require('express-validator');

const validateFirstName = [
  body('first').trim().notEmpty().withMessage('First Name cannot be empty.'),
];

const validateLastName = [
  body('last').trim().notEmpty().withMessage('Last Name cannot be empty.'),
];

const validateUserName = [
  body('username')
    .trim()
    .notEmpty()
    .isLength({ max: 15 })
    .withMessage('Username cannot be empty, and within 15 characters.'),
];

const validatePassword = [
  body('password').trim().notEmpty().withMessage('Password cannot be empty.'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match the password.');
    }
    // Indicate validation success
    return true;
  }),
];

const validateClubPasscode = [
  body('clubPasscode').custom((value, { req }) => {
    if (value !== process.env.CLUB_PASSCODE) {
      throw new Error('Incorrect passcode.');
    }
    return true;
  }),
];

const validateAdminPasscode = [
  body('adminPasscode').custom((value, { req }) => {
    if (value !== process.env.ADMIN_PASSCODE) {
      throw new Error('Incorrect passcode.');
    }
    return true;
  }),
];

const validateMessage = [
  body('message').trim().notEmpty().withMessage('Message can not be empty.'),
];

module.exports = {
  validateFirstName,
  validateLastName,
  validateUserName,
  validatePassword,
  validateClubPasscode,
  validateAdminPasscode,
  validateMessage,
};
