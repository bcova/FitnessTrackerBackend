const client = require("./client");

async function createRoutine({ isPublic, name, goal }) {
  
  const { rows: [ routine ] } = await client.query(`
  INSERT INTO routines ( "isPublic", name, goal ) 
  VALUES($1, $2, $3) 
  RETURNING *;
`, [ isPublic, name, goal]);

return routine;
  
  }

async function getRoutineById(id) {}

async function getRoutinesWithoutActivities() {}

async function getAllRoutines() {}

async function getAllPublicRoutines() {}

async function getAllRoutinesByUser({ username }) {}

async function getPublicRoutinesByUser({ username }) {}

async function getPublicRoutinesByActivity({ id }) {}

async function updateRoutine({ id, ...fields }) {}

async function destroyRoutine(id) {}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
