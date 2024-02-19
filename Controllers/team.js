
const mycon = require('../DB/mydb')

const createTeamData = (req, res) => {
  const data = req.body;
  console.log(data)
  // Insert data into the Teamdata table
  mycon.query('INSERT INTO TMeetData SET ?', data, (err, result) => {
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

const getTeamDataById = (req, res) => {
  const TeamId = req.params.id;
  console.log(TeamId)
  // Retrieve data from the Teamdata table based on the id
  mycon.query('SELECT * FROM TMeetData WHERE id = ?', TeamId, (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      res.status(500).send('Error retrieving data');
      return;
    }

    if (result.length === 0) {
      res.status(404).send('Team data not found');
      return;
    }

    res.status(200).json(result[0]);
  });
};

const updateTeamDataById = (req, res) => {
  const TeamId = req.params.id;
  const newData = req.body;
  // Update data in the Teamdata table based on the id
  mycon.query('UPDATE TMeetData SET ? WHERE id = ?', [newData, TeamId], (err, result) => {
    if (err) {
      console.error('Error updating data: ' + err.stack);
      res.status(500).send('Error updating data');
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).send('Team data not found');
      return;
    }

    console.log('Updated ' + result.affectedRows + ' row(s)');
    res.status(200).send('Data updated successfully');
  });
};

const deleteTeamDataById = (req, res) => {
  const TeamId = req.params.id;
  // Delete data from the Teamdata table based on the id
  mycon.query('DELETE FROM TMeetData WHERE id = ?', TeamId, (err, result) => {
    if (err) {
      console.error('Error deleting data: ' + err.stack);
      res.status(500).send('Error deleting data');
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).send('Team data not found');
      return;
    }

    console.log('Deleted ' + result.affectedRows + ' row(s)');
    res.status(200).send('Data deleted successfully');
  });
};

const TeamDataList = (req, res) => {
  mycon.query('SELECT * FROM TMeetData', (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      res.status(500).send('Error retrieving data');
      return;
    }
    res.status(200).json(result);
  })
}



module.exports = { deleteTeamDataById, updateTeamDataById, getTeamDataById, createTeamData, TeamDataList }