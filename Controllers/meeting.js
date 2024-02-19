
const mycon = require('../DB/mydb')

const createBMeetingData = (req, res) => {
    const data = req.body;
    console.log(data)
    // Insert data into the BMeetingdata table
    mycon.query('INSERT INTO BMeetData SET ?', data, (err, result) => {
      if (err) {
      
        console.error('Error inserting data: ' + err.stack);
        res.status(500).send('Error inserting data');
        return;
      }
  
      const id = result.insertId;
      // res.status(200).send(`Data inserted successfully with id : ${id}`);
      res.status(201).send(`${id}`);
    });
  };
  
  const getBMeetingDataById = (req, res) => {
    const BMeetingId = req.params.id;
    console.log(BMeetingId)
    // Retrieve data from the BMeetingdata table based on the id
    mycon.query('SELECT * FROM BMeetData WHERE id = ?', BMeetingId, (err, result) => {
      if (err) {
        console.error('Error retrieving data: ' + err.stack);
        res.status(500).send('Error retrieving data');
        return;
      }
  
      if (result.length === 0) {
        res.status(404).send('BMeeting data not found');
        return;
      }
  
      res.status(200).json(result[0]);
    });
  };
  
  const updateBMeetingDataById = (req, res) => {
    const BMeetingId = req.params.id;
    const newData = req.body;
    // Update data in the BMeetingdata table based on the id
    mycon.query('UPDATE BMeetData SET ? WHERE id = ?', [newData, BMeetingId], (err, result) => {
      if (err) {
        console.error('Error updating data: ' + err.stack);
        res.status(500).send('Error updating data');
        return;
      }
  
      if (result.affectedRows === 0) {
        res.status(404).send('BMeeting data not found');
        return;
      }
  
      console.log('Updated ' + result.affectedRows + ' row(s)');
      res.status(200).send('Data updated successfully');
    });
  };
  
  const deleteBMeetingDataById = (req, res) => {
    const BMeetingId = req.params.id;
    // Delete data from the BMeetingdata table based on the id
    mycon.query('DELETE FROM BMeetData WHERE id = ?', BMeetingId, (err, result) => {
      if (err) {
        console.error('Error deleting data: ' + err.stack);
        res.status(500).send('Error deleting data');
        return;
      }
  
      if (result.affectedRows === 0) {
        res.status(404).send('BMeeting data not found');
        return;
      }
  
      console.log('Deleted ' + result.affectedRows + ' row(s)');
      res.status(200).send('Data deleted successfully');
    });
  };
  
  const BMeetingDataList = (req, res) => {
    mycon.query('SELECT * FROM BMeetData', (err, result) => {
      if (err) {
        console.error('Error retrieving data: ' + err.stack);
        res.status(500).send('Error retrieving data');
        return;
      }
      res.status(200).json(result);
    })
  }
  
  
   
  module.exports = {deleteBMeetingDataById,updateBMeetingDataById,getBMeetingDataById,createBMeetingData,BMeetingDataList}