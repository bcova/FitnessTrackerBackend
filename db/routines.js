/* eslint-disable no-useless-catch */
const client = require("./client");
const { attachActivitiesToRoutines } = require("./activities");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
    INSERT INTO routines ( "creatorId", "isPublic", name, goal ) 
    VALUES($1, $2, $3, $4) 
    RETURNING * ;
  `,
      [creatorId, isPublic, name, goal]
    );

    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutineById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
    SELECT *
    FROM routines
    WHERE id=$1;
  `,
      [id]
    );
    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  const { rows } = await client.query(
    `SELECT name, goal 
    FROM routines;
  `
  );
  return rows;
}

async function getAllRoutines() {
  const { rows } = await client.query(
    `SELECT routines.*, users.username AS "creatorName"
  FROM routines
  JOIN users ON routines."creatorId" = users.id
  ;

    `
  );

  return attachActivitiesToRoutines(rows);
}

async function getAllPublicRoutines() {
  const { rows } = await client.query(
    `SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "isPublic"= true ;
  `
  );
  return attachActivitiesToRoutines(rows);
}

async function getAllRoutinesByUser({ username }) {
  const { rows } = await client.query(
    `SELECT routines.*, users.username AS "creatorName"
  FROM routines
  JOIN users ON routines."creatorId" = users.id
  WHERE username=$1
 `,
    [username]
  );
  return attachActivitiesToRoutines(rows);
}

async function getPublicRoutinesByUser({ username }) {
  const { rows } = await client.query(
    `SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE username=$1 AND "isPublic"= true
   `,
    [username]
  );
  return attachActivitiesToRoutines(rows);
}

async function getPublicRoutinesByActivity({ id }) {
  const { rows } = await client.query(
    `SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN routine_activities ON routine_activities."routineId" = routines.id
    JOIN users ON routines."creatorId" = users.id
    WHERE routine_activities."activityId"=$1 AND "isPublic"= true;
    `,
    [id]
  );

  return attachActivitiesToRoutines(rows);
}

async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [routine],
    } = await client.query(
      `
      UPDATE routines
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    return routine;
  } catch (error) {
    throw error;
  }
}

async function destroyRoutine(id) {
  try {
    await client.query(`
    DELETE FROM routine_activities
    WHERE "routineId" = $1
    `, [id]);


    await client.query(`
    DELETE FROM routines 
    WHERE routines.id = $1
    `, [id]);
 
  } catch (error) {
    throw error;
  }
}

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
