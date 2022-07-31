/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
  getPublicRoutinesByUser,
  getAllRoutinesByUser
} = require("../db");
const { requireUser } = require('./utils');
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;


// POST /api/users/register
router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
    
    try {
      const _user = await getUserByUsername(username);
      if (_user) {
        
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
        username: user.username
      }, JWT_SECRET, {
        expiresIn: '1w'
      });
      
      res.send({ 
        user,
        message: "thank you for signing up",
        token
      });
    }  catch (error) {
      next(error);
    } 
  });
  
// POST /api/users/login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  // request must have both
  if (!username || !password){
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password"
    });
  }

  try {
    const user = await getUser({ username, password });
    if (!user) {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    } else {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "1w" }
      );
      res.send({ user, message: "you're logged in!", token });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// GET /api/users/me
// router.get('/me', requireUser, async (req, res, next) => {
//   const prefix = 'Bearer ';
//   const auth = req.header('Authorization');

//   if (!auth) { 
//     next();
//   } else if (auth.startsWith(prefix)) {
//     const token = auth.slice(prefix.length);

//     try {
//       const { id } = jwt.verify(token, JWT_SECRET);

//       if (id) {
//         req.user = await getUserById(id);
//         next();
//         res.send( req.user )
//       }
//     } catch ({ name, message }) {
//       next({ name, message });
//     }
//   } else {
//     next({
//       name: 'AuthorizationHeaderError',
//       message: `Authorization token must start with ${ prefix }`
//     });
//   }

// });

router.get("/me", async (req, res, next) => {
  try {
    if(req.user) {
      res.send(req.user)
    }else {
      res.status(401).send ({
        error: "401 - Unauthorized",
        message: "You must be logged in to perform this action",
        name:"UnauthorizedError"
      })
    }
  }  catch (error) {
    next(error);
  }
});


// GET /api/users/:username/routines
router.get('/:username/routines', async (req, res, next) => {

  try {
    if (req.user.username === req.params.username) {
      const UserRoutine = await getAllRoutinesByUser({ username: req.params.username})
       res.send(UserRoutine)
    } else {
      const allRoutines = await getPublicRoutinesByUser({ username: req.params.username});
      res.send(
        allRoutines
      );
    }}
  catch ({ name, message }) {
    next({ name, message });
  }
});



module.exports = router;
