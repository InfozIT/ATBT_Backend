var db = require('../models/index');
const Meet = db.Meeting;
const mycon = require('../DB/mycon');

const ListEntiyGroup = async (req, res) =>  {
    const bmId = req.params.id;
    const ids = [];

    mycon.query('SELECT members, EntityId, TeamId FROM Meetings WHERE id = ?', bmId, (err, result) => {
      if (err) {
        console.error('Error retrieving data: ' + err.stack);
        res.status(500).send('Error retrieving data');
        return;
      }
      if (result.length === 0) {
        res.status(404).send('Entity data not found');
        return;
      }
      var EntID = (result[0].EntityId);
      // Iterate over each member and push their id into ids array
      for (let i = 0; i < result[0].members.length; i++) {
        ids.push(result[0].members[i].id);
      }
      mycon.query('SELECT * FROM UserEntity WHERE EntityId = ?', EntID, (err, result1) => {
        if (err) {
          console.error('Error retrieving data: ' + err.stack);
          res.status(500).send('Error retrieving data');
          return;
        }
        if (result1.length === 0) {
          res.status(404).send('Entity data not found');
          return;
        }
        for (let i = 0; i < result1.length; i++) {
          ids.push(result1[i].UserId);
        }
        const uniq = [...new Set(ids)];
        
        res.status(200).json({ ids: uniq }); // Sending ids array in the response
      });
    });
};

const ListTeamGroup = async (req, res) =>  {
  const bmId = req.params.id;
  const ids = [];
  mycon.query('SELECT members,TeamId FROM Meetings WHERE id = ?', bmId, (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      res.status(500).send('Error retrieving data');
      return;
    }
    if (result.length === 0) {
      res.status(404).send('Entity data not found');
      return;
    }
    var EntID = (result[0].TeamId);
    // Iterate over each member and push their id into ids array
    for (let i = 0; i < result[0].members.length; i++) {
      ids.push(result[0].members[i].id);
    }
    mycon.query('SELECT * FROM UserTeam WHERE TeamId = ?', EntID, (err, result1) => {
      if (err) {
        console.error('Error retrieving data: ' + err.stack);
        res.status(500).send('Error retrieving data');
        return;
      }
      if (result1.length === 0) {
        res.status(404).send('Entity data not found');
        return;
      }
      for (let i = 0; i < result1.length; i++) {
        ids.push(result1[i].UserId);
      }
      const uniq = [...new Set(ids)];
      
      res.status(200).json({ ids: uniq }); // Sending ids array in the response
    });
  });
};


module.exports = { ListEntiyGroup,ListTeamGroup };
