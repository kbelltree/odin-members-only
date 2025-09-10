const db = require('../db/queries');
const { validationResult } = require('express-validator');

async function getMessages(req, res) {
  const messages = await db.fetchMessagesDesc();
  return res.render('index', {
    pageTitle: 'All Posts',
    messages: messages,
  });
}

async function getMemberOnlyMessages(req, res) {
  const messages = await db.fetchMemberMessagesDesc();
  return res.render('index', {
    pageTitle: 'All Posts',
    messages: messages.map((message) => ({
      ...message,
      // To avoid timezone issues on Render (which runs in UTC), pass the raw ISO timestamp
      // and format it in the browser using client-side JavaScript for accurate local time display
      timestamp: message.timestamp.toISOString(),
    })),
  });
}

async function getAdminDataByTitle(req, res) {
  const { dataTitle } = req.query;
  let fetchedData;
  if (dataTitle === 'users') {
    fetchedData = await db.fetchUsersAdmin();
  } else if (dataTitle === 'messages') {
    fetchedData = await db.fetchMessagesAdmin();
    fetchedData = fetchedData.map((data) => ({
      ...data,
      // To avoid timezone issues on Render (which runs in UTC), pass the raw ISO timestamp
      // and format it in the browser using client-side JavaScript for accurate local time display
      timestamp: data.timestamp.toISOString(),
    }));
  } else {
    return res.status(404).send('Data not found.');
  }
  return res.render('admin', {
    pageTitle: 'Admin Page',
    dtTitle: dataTitle,
    data: fetchedData,
  });
}

function getNewUserForm(req, res) {
  return res.render('formSignUp', {
    pageTitle: 'Sign Up',
    message: 'Please enter all the required information below.',
    validationErrors: null,
    inputValues: null,
  });
}

async function createNewUser(req, res, next) {
  const { first, last, username, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('formSignUp', {
      pageTitle: 'Sign Up',
      message: null,
      validationErrors: errors.array(),
      inputValues: { first, last, username },
    });
  }
  const rows = await db.registerNewUser(first, last, username, password);
  if (rows.length === 0) {
    return res.render('formSignUp', {
      pageTitle: 'Sign Up',
      message: 'The username is already taken.',
      validationErrors: null,
      inputValues: { first, last, username },
    });
  }
  // automatically log in after successful sign up - this will also enable accessing req.users
  req.login(rows[0], (err) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/join');
  });
}

function getJoinClubForm(req, res) {
  return res.render('formJoin', {
    pageTitle: 'Join the Club',
    validationErrors: null,
    message: 'Not ready to join? No problem — log in without joining.',
  });
}

async function joinClub(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('formJoin', {
      pageTitle: 'Join the Club',
      validationErrors: errors.array(),
      message: 'Skip and log in.',
    });
  }
  const updatedUser = await db.updateMemberStatus(true, req.user.id);
  if (!updatedUser) {
    return res.status(404).send('User not found.');
  }
  return res.redirect('/member-only');
}

function getLogInForm(req, res) {
  return res.render('formLogIn', {
    pageTitle: 'Log In',
  });
}

function getMessageForm(req, res) {
  return res.render('formMessage', {
    pageTitle: 'Post Message',
    validationErrors: null,
  });
}

async function createNewMessage(req, res) {
  const { title, message } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('formMessage', {
      pageTitle: 'Post Message',
      validationErrors: errors.array(),
    });
  }
  await db.insertNewMessage(title, message, req.user.id);
  return res.redirect('/member-only');
}

function getAdminForm(req, res) {
  return res.render('formAdmin', {
    pageTitle: 'Admin Registration',
    validationErrors: null,
  });
}

async function registerAdmin(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('formAdmin', {
      pageTitle: 'Admin Registration',
      validationErrors: errors.array(),
    });
  }
  const updatedUser = await db.updateAdminStatus(true, req.user.id);
  if (!updatedUser) {
    return res.status(404).send('User not found.');
  }
  return res.redirect('/member-only');
}

async function deleteMessage(req, res) {
  const { messageId, viaPath } = req.params;
  const rowCount = await db.deleteMessage(messageId);
  if (rowCount === 0) {
    return res.status(404).send(`Message not found.`);
  }
  if (viaPath === 'via-admin') {
    return res.redirect('/admin?dataTitle=messages');
  }
  return res.redirect('/member-only');
}

function logOutUser(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  return res.redirect('/');
}

module.exports = {
  getMessages,
  getMemberOnlyMessages,
  getAdminDataByTitle,
  getNewUserForm,
  createNewUser,
  getJoinClubForm,
  joinClub,
  getLogInForm,
  getMessageForm,
  createNewMessage,
  getAdminForm,
  registerAdmin,
  deleteMessage,
  logOutUser,
};
