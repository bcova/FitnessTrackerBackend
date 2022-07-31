const express = require('express');
const router = express.Router();
const {getAllActivities, createActivity, getActivityByName,getActivityById,updateActivity,getPublicRoutinesByActivity} = require ('../db')
const { requireUser } = require('./utils');



// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async (req, res, next) => {

  const id = req.params.activityId;
  const activity = await getActivityById(id);
  const publicRoutines = await getPublicRoutinesByActivity({ id });
  try {
    if (!activity) {
      next({
        name: "NoExistingActivity",
        message: `Activity ${id} not found`,
      });
    } else {
      res.send(publicRoutines);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// GET /api/activities
router.get('/',  async (req, res, next) => {

    try {
        const activities = await getAllActivities()
        res.send (activities)
    } catch ({ name, message }) {
      next({ name, message });
    }
})
// POST /api/activities
router.post('/', requireUser, async (req, res, next) => {
    const { name, description } = req.body;
  
    const _activity = await getActivityByName(name);


    try {    const activity = await createActivity({
        name,
        description,
    });
        if (_activity) {
            next({
              name: "ActivityExistsError",
              message: `An activity with name ${name} already exists`,
              error: "ActivityExists"
            });
        }
      res.send(activity);
    } catch ({ name, message }) {
      next({ name, message });
    }
  });
    
// PATCH /api/activities/:activityId
router.patch('/:activityId', requireUser, async (req, res, next) => {
    try {  
      const {name, description} = req.body;
      const id = req.params.activityId;
      const existingActivity = await getActivityById(id);
      const duplicateName = await getActivityByName(name)
      
      if(!existingActivity) {
        next({
          name: 'ActivityNotFoundError',
          message: `Activity ${id} not found`
        });
      }if(duplicateName){
        next({
          name: 'ActivityExistsError',
          message: `An activity with name ${name} already exists`
        });
      }
      
      else {
        const updatedActivity = await updateActivity({id, name, description})
        res.send(updatedActivity); 
        }
      } catch ({ name, message }) {
        next({ name, message });
      }
    });
module.exports = router;
