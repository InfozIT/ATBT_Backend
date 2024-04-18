var db = require('../models/index');
const Meet = db.Meeting;
const mycon = require('../DB/mycon');





const ListEntiyGroup = async (req, res) => { // Changed function name to follow camelCase convention
  const bmId = req.params.id;
  const ids = [];

  try {
    const meetdata = await Meet.findOne({ where: { id: bmId } });
    ids.push(...meetdata.members)
    let EntID = (meetdata.EntityId)
    
    mycon.query('SELECT * FROM Users WHERE EntityId = ?', EntID, async (err, result1) => { // Passed EntID as an array
      if (err) {
        console.error('Error retrieving data: ' + err.stack);
        res.status(500).send('Error retrieving data');
        return;
      }
      // Extracting user IDs from result1 array
      console.log(result1)
      ids.push(...result1); // Spread the user IDs array to push individual elements

      // Removing duplicates from ids array
      const uniqIds = [...new Set(ids)];


      res.status(200).json({ ids: uniqIds }); // Sending unique ids array in the response


    });
  } catch (error) {
    console.error('Error: ' + error);
    res.status(500).send('Error processing request');
  }
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
      // Filter out null values from the ids array
      const filteredIds = ids.filter(id => id !== null);
      const uniq = [...new Set(filteredIds)];
      res.status(200).json({ ids: uniq }); // Sending ids array in the response
    });
  });
};

// CRUD for task module

// const CreateTask = async (req, res) => {
//   try {
//     let file = req.file;
//     let data = req.body;
//     let {decision,members} =req.body
//     const bmId = req.params.id;

//     const existingEntity = await db.Task.findOne({ where: {decision} });
//     if (existingEntity) {
//       console.error("entity already exists.");
//       return res.status(400).send("entity already exists");
//     }

//     const selectedMembers = JSON.stringify(members);
//     if (file) {
//       data = {
//         MeetingId : bmId,
//         file: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
//         members : selectedMembers,
//         ...data,
//       }
//     }
//     console.log(data)
//     mycon.query('INSERT INTO Entities SET ?', data, async (err, result) => {
//       if (err) {
//         console.error('Error inserting data: ' + err.stack);
//         return res.status(500).send('Error inserting data');
//       }
//       const createdEntity = await db.Task.findOne({ where: { id: result.insertId } });
//       if (createdEntity){

//       }
//       res.status(201).send(`${result.insertId}`);

//     });
//   } catch (error) {
//     console.error("Error creating Entity:", error);
//     res.status(500).send("Error creating user");
//   }
// };
const CreateTask = async (req, res) => {
  try {
      var data = req.body;
      let bmId = req.params.id;
      console.log(bmId);
      
      const task = await db.Task.create({ meetingId: bmId },data);
      res.status(201).send(task);
  } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).send("Error creating task");
  }
};




const ListTask = async (req, res) => {    res.status(201).json({ message: "successfully" });};
const List_Task_Pub = async (req, res) => {    res.status(201).json({ message: "successfully" });};

const GetTask = async (req, res) => { 
  const taskId = req.params.id;
  const Task = await db.Task.findByPk(taskId);
  res.status(200).json(Task);};

const UpdateTask = async (req, res) => {
    try {
      const taskId = req.params.id; // Assuming taskId is part of the URL
      const updateData = req.body; 
      let {members } = req.body
      let file = req.file;
      const selectedmember = JSON.stringify(members);

      if (file) {
        updateData = {
          members : selectedmember,
          image: `${process.env.IMAGE_URI}/images/${req.file.filename}`,
          ...data,
        }
      }
      const updatedTask = await db.Task.update(updateData, {
        where: { id: req.params.id }
      });
      res.status(200).json({ message: "successfully updated" })
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).send("Error updating task");
    }
  };
  
const DeleteTask = async (req, res) => { res.status(201).json({ message: "successfully" });};




module.exports = {
  CreateTask,
  ListTask,
  GetTask,
  UpdateTask,
  DeleteTask,
  List_Task_Pub,
  ListEntiyGroup,
  ListTeamGroup
};