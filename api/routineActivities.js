const express = require("express");
const router = express.Router();
const { requireUser } = require("./utils");
const {
  getRoutineActivityById,
  getRoutineById,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
} = require("../db");

// PATCH /api/routine_activities/:routineActivityId
router.patch("/:routineActivityId", requireUser, async (req, res, next) => {
  const id = req.params.routineActivityId;
  const { duration, count } = req.body;
  // const routineActivity = await getRoutineActivityById(id)
  const routine = await getRoutineById(id);
  try {
    if (req.user.id !== routine.creatorId) {
      next({
        name: "UnauthorizedUpdateError",
        message: `User ${req.user.username} is not allowed to update ${routine.name}`,
      });
    } else {
      const updated = await updateRoutineActivity({ id, duration, count });
      res.send(updated);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});
// DELETE /api/routine_activities/:routineActivityId
router.delete("/:routineActivityId", requireUser, async (req, res, next) => {
  try {
    const { routineActivityId } = req.params;
    const { id: currentUserId } = req.user;
    const canEdit = await canEditRoutineActivity(
      routineActivityId,
      currentUserId
    );
    const oldRoutine = await getRoutineActivityById(routineActivityId);
    if (canEdit) {
      console.log("canEdit is true");
      await destroyRoutineActivity(routineActivityId);
      res.send(oldRoutine);
    } else {
      const error = await getRoutineActivityById(routineActivityId);
      const { name } = await getRoutineById(error.routineId);
      next({
        name: "UnauthorizedUpdateError",
        message: `User ${req.user.username} is not allowed to update ${name}`,
        status: 403,
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = router;
