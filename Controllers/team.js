var db = require('../models/index');
const Team = db.Team;

// Your controller functions using Sequelize
const createTeamData = async (req, res) => {
  try {
    const data = req.body;
    const team = await Team.create(data);
    res.status(201).json({ id: team.id });
  } catch (error) {
    console.error('Error inserting data: ' + error.message);
    res.status(500).send('Error inserting data');
  }
};

const getTeamDataById = async (req, res) => {
  const TeamId = req.params.id;
  try {
    const team = await Team.findByPk(TeamId);
    if (!team) {
      res.status(404).send('Team data not found');
    } else {
      res.status(200).json(team);
    }
  } catch (error) {
    console.error('Error retrieving data: ' + error.message);
    res.status(500).send('Error retrieving data');
  }
};

const updateTeamDataById = async (req, res) => {
  const TeamId = req.params.id;
  const newData = req.body;
  try {
    const [rowsUpdated] = await Team.update(newData, { where: { id: TeamId } });
    if (rowsUpdated === 0) {
      res.status(404).send('Team data not found');
    } else {
      res.status(200).send('Data updated successfully');
    }
  } catch (error) {
    console.error('Error updating data: ' + error.message);
    res.status(500).send('Error updating data');
  }
};

const deleteTeamDataById = async (req, res) => {
  const TeamId = req.params.id;
  try {
    const rowsDeleted = await Team.destroy({ where: { id: TeamId } });
    if (rowsDeleted === 0) {
      res.status(404).send('Team data not found');
    } else {
      res.status(200).send('Data deleted successfully');
    }
  } catch (error) {
    console.error('Error deleting data: ' + error.message);
    res.status(500).send('Error deleting data');
  }
};

const TeamDataList = async (req, res) => {
  try {
    const teams = await Team.findAll();
    res.status(200).json(teams);
  } catch (error) {
    console.error('Error retrieving data: ' + error.message);
    res.status(500).send('Error retrieving data');
  }
};

module.exports = { deleteTeamDataById, updateTeamDataById, getTeamDataById, createTeamData, TeamDataList };
