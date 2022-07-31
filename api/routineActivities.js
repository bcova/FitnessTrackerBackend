const express = require('express');
const router = express.Router();
const { requireUser } = require('./utils');
const {getRoutineActivityById, getRoutineById, updateRoutineActivity,destroyRoutineActivity,canEditRoutineActivity} = require ('../db')

// PATCH /api/routine_activities/:routineActivityId
router.patch('/:routineActivityId',requireUser, async (req, res, next) => {
    const id = req.params.routineActivityId
    const {duration, count} = req.body
    // const routineActivity = await getRoutineActivityById(id)
    const routine = await getRoutineById(id)
    try { 
        if (req.user.id !== routine.creatorId) {
            next({
            name: 'UnauthorizedUpdateError',
            message: `User ${req.user.username} is not allowed to update ${routine.name}`})
        } else {
            const updated = await updateRoutineActivity({id,duration, count})
            res.send(updated)
        }
        
    } catch ({ name, message }) {
        next({ name, message });  
    }
})
// DELETE /api/routine_activities/:routineActivityId
router.delete('/:routineActivityId',requireUser, async (req, res, next) => {
    const id = req.params.routineActivityId
    const routine = await getRoutineById(id)
    const editor = canEditRoutineActivity(id, req.user.id)
    try { 
        if (!editor) {
    res.status(403);
            next({
            name: 'UnauthorizedUpdateError',
            message: `User ${req.user.username} is not allowed to update ${routine.name}`})
        } else {
                  const deleted = await destroyRoutineActivity(id)
           res.send(deleted)
        }
        
    } catch ({ name, message }) {
        next({ name, message });  
    }


          
 
})

module.exports = router;
