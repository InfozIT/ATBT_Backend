require('dotenv').config();
var db = require('../models/index');
const Entite = db.Entite;
const { Op } = require('sequelize');




const Add_Entite = async (req, res) => {
  try {
    var data = (req.body)
    const path = `${process.env.IMAGE_URI}/${req.file.filename}`
    const Entites = await Entite.create({
      name: req.body.name,
      description: req.body.description,
      members: req.body.members,
      image: path
    });
    res.status(201).json({ message: " created successfully", Entites });
  } catch (error) {
    // Handle any errors that occur during the Admin creation process
    console.error("Error creating admin:", error);
    res.status(500).json({ error: "Error" });
  }
};

// const Add_Entite = async (req, res) => {
//   try {
//     const data = req.body;
//     const { Entite_Name, Description, Members } = req.body;

//     // Create the entity
//     const entite = await Entite.create({
//       Entite_Name,
//       Description,
//     });

//     // If members are provided in the request body, add them to the entity
//     if (Members && Array.isArray(Members)) {
//       // Find the users by their IDs
//       const users = await User.findAll({
//         where: {
//           email: Members
//         }
//       });

//       console.log(users)

//       // Add the users to the entity
//       await entite.addUser({
//         id: 17,
//         userName: 'bob',
//         password: '$2b$10$a42Ojx/9qxpxSHjodI.NLuwELqiGRqzgd4.hM1lkT8JHt2LLUYo1e',
//         email: 'bob_builder@mail.com',
//         phone: '1234567890',
//         image: null,
//       }, { through: UserEntites });
//     }

//     res.status(201).json({ message: "Entity created successfully", entite });
//   } catch (error) {
//     console.error("Error creating entity:", error);
//     res.status(500).json({ error: "Error" });
//   }
// };



const List_Entite = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const sortBy = req.query.sortBy || 'createdAt'; // Default sorting by createdAt if not provided
    const searchQuery = req.query.search || '';

    const options = {
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: sortBy === 'Entite_Name' ? [['Entite_Name']] : sortBy === 'Description' ? [['Description']] : [[sortBy]],
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${searchQuery}%` } },
          { description: { [Op.like]: `%${searchQuery}%` } },
          // Add more conditions based on your model's attributes
        ],
      },
    };

    // Add search condition dynamically based on your requirements
    if (searchQuery) {
      // Customize the where condition based on your model attributes
      options.where = {
        [Op.or]: [
          { name: { [Op.like]: `%${searchQuery}%` } },
          { description: { [Op.like]: `%${searchQuery}%` } },
          // Add more conditions based on your model's attributes
        ],
      };
    }

    const { count, rows: Entites } = await Entite.findAndCountAll(options);

    // Calculate the range of entities being displayed
    const startEntity = (page - 1) * pageSize + 1;
    const endEntity = Math.min(page * pageSize, count);

    const totalPages = Math.ceil(count / pageSize);

    // console.log({
    //   Entites,
    //   totalEntities: count,
    //   totalPages,
    //   currentPage: page,
    //   pageSize,
    //   startEntity,
    //   endEntity,
    // })

    res.status(200).json({
      Entites,
      totalEntities: count,
      totalPages,
      currentPage: page,
      pageSize,
      startEntity,
      endEntity,
    });
  } catch (error) {
    console.error("Error fetching Entites:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const Get_Entite = async (req, res) => {
  try {
    // Create an Admin with the given data
    const Entites = await Entite.findOne({
      where: {
        id: req.params.id
      }
    });
    // console.log(Entites)
    res.status(200).json({ message: `your id is:${req.params.id}`, Entites });
  } catch (error) {
    // Handle any errors that occur during the Admin creation process
    console.error("Error creating :", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const Update_Entite = async (req, res) => {
  try {
    var data = req.body;
    await Entite.update(data, {
      where: { id: req.params.id }
    });
    res.status(200).json({ message: `updated successfully ${req.params.id}` });
  } catch (error) {
    // Handle any errors that occur during the Admin creation process
    console.error("Error creating admin:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const Delete_Entite = async (req, res) => {
  try {
    await Entite.destroy({
      where: { id: req.params.id },
      // truncate: true
    });

    res.status(200).json({ message: `deleted successfully ${req.params.id}` });
  } catch (error) {
    console.error("Error deleting:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { Add_Entite, List_Entite, Update_Entite, Delete_Entite, Get_Entite }