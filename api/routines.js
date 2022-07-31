const express = require('express');
const router = express.Router();
const {  getRoutineById,
    getAllRoutines,
    createRoutine,
    updateRoutine,
    destroyRoutine,addActivityToRoutine,getRoutineActivityById} = require ('../db')
    const { requireUser } = require('./utils');

// GET /api/routines
router.get('/', async (req, res, next) => {
    try {
        const routines = await getAllRoutines();
        res.send(routines);
    } catch (error) {
        next(error);
    }
})
// POST /api/routines
router.post('/',requireUser, async (req, res, next) => {
    const { name, goal } = req.body;
    const routine = await createRoutine({ creatorId:req.user.id, isPublic:req.body.isPublic, name, goal })

    try {
        if(routine){
      res.send(routine)
        }
    } catch (error) {
        next(error)
        
    }
})

// PATCH /api/routines/:routineId
router.patch('/:routineId',requireUser, async (req, res, next) => {
    const {name, goal, isPublic} = req.body;
    const id = req.params.routineId;
    const existingRoutine = await getRoutineById(id);
    try {
        if(existingRoutine.creatorId != req.user.id) {
            res.status(403)
            next({
              name: 'ActivityNotFoundError',
              message: `User ${req.user.username} is not allowed to update ${existingRoutine.name}`
            });
          } else {
            const updatedRoutine = await updateRoutine({isPublic, name, goal, id})
            if(updatedRoutine) {
              res.send(updatedRoutine);
            }} 
    } catch ({ name, message }) {
        next({ name, message });  
    }
})
// DELETE /api/routines/:routineId
router.delete('/:routineId', requireUser, async (req, res, next) => {
    const id = req.params.routineId;
    const routine = await getRoutineById(id)

    try {
          if(routine.creatorId != req.user.id){
            res.status(403)
            next({
                name: 'UnauthorizedDeleteError',
                message: `User ${req.user.username} is not allowed to delete ${routine.name}`
              });
          }else{
            destroyRoutine(id)
            res.send(routine)
          }
    }catch ({ name, message }) {
        next({ name, message }); 

    }
  });

// POST /api/routines/:routineId/activities
router.post('/:routineId/activities', requireUser, async (req, res, next) => {
const {routineId} = req.params;
const  {activityId, count, duration} = req.body;

try {
    const ogRoutine = await getRoutineActivityById(activityId)
    if (ogRoutine) {
        next({
            name: 'DuplicateRoutineActivityError',
            message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`
          });
    } else {
        const added = await addActivityToRoutine({routineId,activityId,count,duration,})
        res.send(added)
        
    }
} catch (error){
    next(error)
}

})
module.exports = router;







