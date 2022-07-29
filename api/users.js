/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
} = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

// POST /api/users/register
router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
    try {
      const _user = await getUserByUsername(username);
      if (_user) {
        console.log('im in here')
        next({
            error: 'Error!',
            name: 'UserExistsError',
            message: `User ${username} is already taken.`
        })
      }
      else if(password.length < 8){
        next({
            error: 'Error!',
            name: 'password error',
            message: 'Password Too Short!'
        })
      }
      const user = await createUser({
        username,
        password
      });
      const token = jwt.sign({ 
        id: user.id, 
        username
      }, JWT_SECRET, {
        expiresIn: '1w'
      });
      
      res.send({ 
        message: "thank you for signing up",
        token,
        user
      });
    } catch ({ name, message }) {
        next({ name, message })
    } 
  });
  
// POST /api/users/login

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
