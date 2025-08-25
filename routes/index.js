const { Router } = require('express');
const formValidation = require('../middlewares/formValidation');
const userManager = require('../controllers/userManager');
const asyncHandler = require('express-async-handler');
const auth = require('../middlewares/authentication');

const index = Router();

index.get('/sign-up', userManager.getNewUserForm);
index.post(
  '/sign-up',
  formValidation.validateFirstName,
  formValidation.validateLastName,
  formValidation.validateUserName,
  formValidation.validatePassword,
  asyncHandler(userManager.createNewUser)
);

index.get('/join', auth.verifyAuthenticated, userManager.getJoinClubForm);
index.post(
  '/join',
  formValidation.validateClubPasscode,
  asyncHandler(userManager.joinClub)
);

index.get(
  '/member-only',
  auth.verifyAuthenticated,
  auth.verifyMembership,
  asyncHandler(userManager.getMemberOnlyMessages)
);

index.get(
  '/create-message',
  auth.verifyAuthenticated,
  userManager.getMessageForm
);
index.post('/create-message', asyncHandler(userManager.createNewMessage));

index.get(
  '/admin-registration',
  auth.verifyAuthenticated,
  userManager.getAdminForm
);
index.post(
  '/admin-registration',
  formValidation.validateAdminPasscode,
  asyncHandler(userManager.registerAdmin)
);

index.delete(
  '/admin/messages/delete/:messageId/:viaPath',
  auth.verifyAuthenticated,
  auth.verifyAdminGranted,
  asyncHandler(userManager.deleteMessage)
);

index.get(
  '/admin',
  auth.verifyAuthenticated,
  auth.verifyAdminGranted,
  asyncHandler(userManager.getAdminDataByTitle)
);

// Using POST or DELETE endpoint instead of GET for logout() is recommended for security per Passport.js
index.post('/log-out', userManager.logOutUser);

index.get('/log-in', auth.redirectIfAuthenticated, userManager.getLogInForm);
index.post(
  '/log-in',
  asyncHandler(auth.authenticateLocal),
  asyncHandler(userManager.getMemberOnlyMessages)
);

index.get('/', userManager.getMessages);

module.exports = index;
