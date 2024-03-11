var db = require('../models/index');
const Meet = db.Meet;


const createBMeetingData = async (req, res) => {
  try {
    const data = req.body;
    const createdData = await Meet.create(data);
    res.status(201).send(`${createdData.id}`);
  } catch (err) {
    console.error('Error inserting data: ' + err.stack);
    res.status(500).send('Error inserting data');
  }
};

const getBMeetingDataById = async (req, res) => {
  try {
    const BMeetingId = req.params.id;
    const data = await Meet.findByPk(BMeetingId);
    if (!data) {
      res.status(404).send('BMeeting data not found');
      return;
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Error retrieving data: ' + err.stack);
    res.status(500).send('Error retrieving data');
  }
};

const updateBMeetingDataById = async (req, res) => {
  try {
    const BMeetingId = req.params.id;
    const newData = req.body;
    const [updatedRowsCount] = await Meet.update(newData, {
      where: { id: BMeetingId }
    });
    if (updatedRowsCount === 0) {
      res.status(404).send('BMeeting data not found');
      return;
    }
    console.log('Updated ' + updatedRowsCount + ' row(s)');
    res.status(200).send('Data updated successfully');
  } catch (err) {
    console.error('Error updating data: ' + err.stack);
    res.status(500).send('Error updating data');
  }
};

const deleteBMeetingDataById = async (req, res) => {
  try {
    const BMeetingId = req.params.id;
    const deletedRowsCount = await Meet.destroy({
      where: { id: BMeetingId }
    });
    if (deletedRowsCount === 0) {
      res.status(404).send('BMeeting data not found');
      return;
    }
    console.log('Deleted ' + deletedRowsCount + ' row(s)');
    res.status(200).send('Data deleted successfully');
  } catch (err) {
    console.error('Error deleting data: ' + err.stack);
    res.status(500).send('Error deleting data');
  }
};

const BMeetingDataList = async (req, res) => {
  try {
    const dataList = await Meet.findAll();
    res.status(200).json(dataList);
  } catch (err) {
    console.error('Error retrieving data: ' + err.stack);
    res.status(500).send('Error retrieving data');
  }
};

module.exports = {
  deleteBMeetingDataById,
  updateBMeetingDataById,
  getBMeetingDataById,
  createBMeetingData,
  BMeetingDataList
};
