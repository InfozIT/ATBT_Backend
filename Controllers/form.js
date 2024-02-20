var db = require('../models/index.js');
const Settings = db.From;
const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet.js');
const queryInterface = sequelize.getQueryInterface();



// const Add_data = async (req, res) => {
//     try {
//         const arrayOfObjects = req.body.arrayOfObjects;
//         const name = req.body.Name

//         if (!arrayOfObjects || !Array.isArray(arrayOfObjects)) {
//             return res.status(400).json({ error: 'Invalid array of objects' });
//         }
//         const serializedData = JSON.stringify(arrayOfObjects);
//         const data = await Settings.create({ Data: serializedData, Name: req.body.Name });

//         res.json({ message: 'Array of objects saved successfully.', data, name });
//     } catch (error) {
//         console.error('Error saving array of objects:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

const Adddata = async (req, res) => {
    try {
        const arrayOfObjects = req.body.arrayOfObjects;
        const name = req.body.Name;

        if (!arrayOfObjects || !Array.isArray(arrayOfObjects)) {
            return res.status(400).json({ error: 'Invalid array of objects' });
        }
        const serializedData = JSON.stringify(arrayOfObjects);
        const filterableInputsInSearch = arrayOfObjects.map(obj => (
            obj.inputname
        ));
        console.log("filtered", filterableInputsInSearch)
        const table = await queryInterface.describeTable('Users')
        const filteredKeys = Object.keys(table);
        function filterFields(array1, array2) {
            return array1.filter(field => !array2.includes(field));

        }
        const compared = filterFields(filterableInputsInSearch, filteredKeys)
        const excludedFields = ['id', 'createdAt', 'updatedAt'];
        const filteredFields = compared.filter(field => !excludedFields.includes(field));
        console.log(filteredFields)
        for (const key in filteredFields) {
            await sequelize.getQueryInterface().addColumn('Users', filteredFields[key], {
                type: DataTypes.STRING, // You may adjust the data type based on your requirement
                allowNull: true, // You may adjust this based on your requirement
            });
        }

        // console.log(resp, "resp")

        res.json({ message: 'Array of objects saved successfully.' });
    } catch (error) {
        console.error('Error saving array of objects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const GetAllLIST = async (req, res) => {
    try {
        const form = await Settings.findOne({
            where: {
                name: req.query.name
            }
        });
        const data = form.Data
        const array = JSON.parse(data);
        // const trimmedJsonArray = array.map(obj => JSON.stringify(obj)).join(',');
        res.status(200).json({ message: `your name is:${req.query.name}`, array });
    } catch (error) {
        console.error("Error creating :", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

};

// Update/create
// const Update_data = async (req, res) => {
//   try {
//     const arrayOfObjects = req.body.arrayOfObjects;
//     const name = req.body.Name;

//     if (!arrayOfObjects || !Array.isArray(arrayOfObjects)) {
//       return res.status(400).json({ error: 'Invalid array of objects' });
//     }

//     const serializedData = JSON.stringify(arrayOfObjects);

//     // Search for existing record with the provided name
//     let existingRecord = await Settings.findOne({ Name: name });

//     if (existingRecord) {
//       // If record exists, update its data
//       existingRecord.Data = serializedData;
//       await existingRecord.save();
//       res.json({ message: 'Array of objects updated successfully.', name, data: arrayOfObjects });
//     } else {
//       // If record doesn't exist, create a new one
//       const data = await Settings.create({ Data: serializedData, Name: name });
//       res.json({ message: 'New record created successfully.', name, data: arrayOfObjects });
//     }
//   } catch (error) {
//     console.error('Error updating array of objects:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const Update_data = async (req, res) => {
    try {
        const arrayOfObjects = req.body.arrayOfObjects;
        const name = req.body.Name;

        if (!arrayOfObjects || !Array.isArray(arrayOfObjects)) {
            return res.status(400).json({ error: 'Invalid array of objects' });
        }

        const serializedData = JSON.stringify(arrayOfObjects);

        // Search for existing record with the provided name
        let existingRecord = await Settings.findOne({ where: { Name: name } });

        if (existingRecord) {
            // If record exists, update its data
            existingRecord.Data = serializedData;
            await existingRecord.save();
            res.json({ message: 'Array of objects updated successfully.', name, data: arrayOfObjects });
        } else {
            // If record doesn't exist, create a new one
            const data = await Settings.create({ Data: serializedData, Name: name });
            res.json({ message: 'New record created successfully.', name, data: arrayOfObjects });
        }
    } catch (error) {
        console.error('Error updating array of objects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// const FinalForm = async (req, res) => {
//     let formData = req.body.arrayOfObjects;
//     let finalJson = {};
//     for (let i = 0; i < formData.length; i++) {
//         if (formData[i].type === "text" || formData[i].type === "email" || formData[i].type === "password" || formData[i].type === "select" || formData[i].type === "range") {

//             finalJson[formData[i].inputname] = {
//                 type: DataTypes.STRING,
//                 allowNull: true
//             };
//         }
//         if (formData[i].type === "textarea") {

//             finalJson[formData[i].inputname] = {
//                 type: DataTypes.TEXT,
//                 allowNull: true
//             };
//         }
//         if (formData[i].type === "checkbox") {

//             finalJson[formData[i].inputname] = {
//                 type: DataTypes.BOOLEAN,
//                 allowNull: true
//             };
//         }
//         if (formData[i].type === "number") {

//             finalJson[formData[i].inputname] = {
//                 type: DataTypes.INTEGER,
//                 allowNull: true
//             };
//         }
//         if (formData[i].type === "date") {

//             finalJson[formData[i].inputname] = {
//                 type: DataTypes.DATEONLY,
//                 allowNull: true
//             };
//         }
//         if (formData[i].type === "time") {

//             finalJson[formData[i].inputname] = {
//                 type: DataTypes.TIME,
//                 allowNull: true
//             };
//         }
//         if (formData[i].type === "file") {

//             finalJson[formData[i].inputname] = {
//                 type: DataTypes.BLOB,
//                 allowNull: true
//             };
//         }
//         if (Array.isArray(formData[i].value)) {

//             finalJson[formData[i].inputname] = {
//                 type: DataTypes.JSON,
//                 allowNull: true
//             };
//         }

//     }

//     const EntityData = sequelize.define('EntityData', finalJson);
//     EntityData.sync({alter:true})
//     res.status(201).json({ message: "Entity created or modified successfully" });
//   };
const EntityForm = async (req, res) => {
    try {
        let formData = req.body.arrayOfObjects;
        let finalJson = {};

        for (let i = 0; i < formData.length; i++) {
            switch (formData[i].type) {
                case "text":
                case "email":
                case "password":
                case "select":
                case "range":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.STRING,
                        allowNull: true
                    };
                    break;
                case "textarea":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.TEXT,
                        allowNull: true
                    };
                    break;
                case "checkbox":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.BOOLEAN,
                        allowNull: true
                    };
                    break;
                case "number":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.STRING,
                        allowNull: true
                    };
                    break;
                case "date":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.DATEONLY,
                        allowNull: true
                    };
                    break;
                case "time":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.TIME,
                        allowNull: true
                    };
                    break;
                case "file":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.BLOB,
                        allowNull: true
                    };
                    break;
                default:
                    if (Array.isArray(formData[i].value)) {
                        finalJson[formData[i].inputname] = {
                            type: DataTypes.JSON,
                            allowNull: true
                        };
                    }
            }
        }
        finalJson.customFieldsData = {
            type: DataTypes.JSON,
            allowNull: true
        };
        finalJson.loggedInUser = {
            type: DataTypes.INTEGER,
            allowNull: true
        };

        // Define your model with timestamps disabled
        const EntityData = sequelize.define('EntityData', finalJson, {
            timestamps: false // Disable createdAt and updatedAt
        });

        // Sync the model with the database
        await EntityData.sync({ alter: true });

        res.status(201).json({ message: "Entity created or modified successfully" });
    } catch (error) {
        console.error("Error in creating or modifying entity:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const UserForm = async (req, res) => {
    try {
        let formData = req.body.arrayOfObjects;
        let finalJson = {};

        for (let i = 0; i < formData.length; i++) {
            switch (formData[i].type) {
                case "text":
                case "email":
                case "password":
                case "select":
                case "range":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.STRING,
                        allowNull: true
                    };
                    break;
                case "textarea":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.TEXT,
                        allowNull: true
                    };
                    break;
                case "checkbox":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.BOOLEAN,
                        allowNull: true
                    };
                    break;
                case "number":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.STRING,
                        allowNull: true
                    };
                    break;
                case "date":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.DATEONLY,
                        allowNull: true
                    };
                    break;
                case "time":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.TIME,
                        allowNull: true
                    };
                    break;
                case "file":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.BLOB,
                        allowNull: true
                    };
                    break;
                default:
                    if (Array.isArray(formData[i].value)) {
                        finalJson[formData[i].inputname] = {
                            type: DataTypes.JSON,
                            allowNull: true
                        };
                    }
            }
        }
        finalJson.customFieldsData = {
            type: DataTypes.JSON,
            allowNull: true
        };
        finalJson.loggedInUser = {
            type: DataTypes.INTEGER,
            allowNull: true
        };

        // Define your model with timestamps disabled
        const EntityData = sequelize.define('UsersData', finalJson, {
            timestamps: false // Disable createdAt and updatedAt
        });

        // Sync the model with the database
        await EntityData.sync();

        res.status(201).json({ message: "User  created or modified successfully", finalJson });
        return finalJson;

    } catch (error) {
        console.error("Error in creating or modifying entity:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const BoardForm = async (req, res) => {
    try {
        let formData = req.body.arrayOfObjects;
        let finalJson = {};

        for (let i = 0; i < formData.length; i++) {
            switch (formData[i].type) {
                case "text":
                case "email":
                case "password":
                case "select":
                case "range":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.STRING,
                        allowNull: true
                    };
                    break;
                case "textarea":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.TEXT,
                        allowNull: true
                    };
                    break;
                case "checkbox":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.BOOLEAN,
                        allowNull: true
                    };
                    break;
                case "number":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.STRING,
                        allowNull: true
                    };
                    break;
                case "date":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.DATEONLY,
                        allowNull: true
                    };
                    break;
                case "time":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.TIME,
                        allowNull: true
                    };
                    break;
                case "file":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.BLOB,
                        allowNull: true
                    };
                    break;
                default:
                    if (Array.isArray(formData[i].value)) {
                        finalJson[formData[i].inputname] = {
                            type: DataTypes.JSON,
                            allowNull: true
                        };
                    }
            }
        }
        finalJson.customFieldsData = {
            type: DataTypes.JSON,
            allowNull: true
        };
        finalJson.loggedInUser = {
            type: DataTypes.INTEGER,
            allowNull: true
        };
        // Define your model with timestamps disabled
        const EntityData = sequelize.define('BMeetData', finalJson, {
            timestamps: false // Disable createdAt and updatedAt
        });

        // Sync the model with the database
        await EntityData.sync();

        res.status(201).json({ message: "Board Meeting created or modified successfully" });
    } catch (error) {
        console.error("Error in creating or modifying entity:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const TeamsForm = async (req, res) => {
    try {
        let formData = req.body.arrayOfObjects;
        let finalJson = {};

        for (let i = 0; i < formData.length; i++) {
            switch (formData[i].type) {
                case "text":
                case "email":
                case "password":
                case "select":
                case "range":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.STRING,
                        allowNull: true
                    };
                    break;
                case "textarea":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.TEXT,
                        allowNull: true
                    };
                    break;
                case "checkbox":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.BOOLEAN,
                        allowNull: true
                    };
                    break;
                case "number":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.STRING,
                        allowNull: true
                    };
                    break;
                case "date":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.DATEONLY,
                        allowNull: true
                    };
                    break;
                case "time":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.TIME,
                        allowNull: true
                    };
                    break;
                case "file":
                    finalJson[formData[i].inputname] = {
                        type: DataTypes.BLOB,
                        allowNull: true
                    };
                    break;
                default:
                    if (Array.isArray(formData[i].value)) {
                        finalJson[formData[i].inputname] = {
                            type: DataTypes.JSON,
                            allowNull: true
                        };
                    }
            }
        }
        finalJson.customFieldsData = {
            type: DataTypes.JSON,
            allowNull: true
        };
        finalJson.loggedInUser = {
            type: DataTypes.INTEGER,
            allowNull: true
        };
        // Define your model with timestamps disabled
        const EntityData = sequelize.define('TMeetData', finalJson, {
            timestamps: false // Disable createdAt and updatedAt
        });

        // Sync the model with the database
        await EntityData.sync();
        res.status(201).json({ message: "Teem Meeting created or modified successfully" });
    } catch (error) {
        console.error("Error in creating or modifying entity:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = { Adddata, GetAllLIST, Update_data, EntityForm, UserForm, BoardForm, TeamsForm }
