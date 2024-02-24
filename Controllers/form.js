var db = require('../models/index.js');
const Settings = db.From;
const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet.js');
const User = db.User;
const queryInterface = sequelize.getQueryInterface();


const UserFrom = async (req, res) => {
    try {
        const arrayOfObjects = req.body.arrayOfObjects;
        var name = req.body.Name
        var tableview = req.body.Tableview
        if (!arrayOfObjects || !Array.isArray(arrayOfObjects)) {
            return res.status(400).json({ error: 'Invalid array of objects' });
        }
        const serializedData = JSON.stringify(arrayOfObjects);
        // console.log(arrayOfObjects, "aoo")
        const tview = JSON.stringify(tableview);
        let existingData = await Settings.findOne({ where: { Name: name } });
        if (existingData) {
            // Update 
            existingData.Data = serializedData;
            existingData.Tableview = tview;
            await existingData.save();
        } else {
            // Create 
            await Settings.create({ Data: serializedData, Name: name, Tableview: tview });
        }
        const filterableInputsInSearch = arrayOfObjects.map(obj => (
            obj.inputname
        ));
        const table = await queryInterface.describeTable('Users')
        const filteredKeys = Object.keys(table);
        function filterFields(array1, array2) {
            return array1.filter(field => !array2.includes(field));
        }
        const compared = filterFields(filterableInputsInSearch, filteredKeys)
        const excludedFields = ['id', 'createdAt', 'updatedAt'];
        const filteredFields = compared.filter(field => !excludedFields.includes(field));
        console.log(filteredFields, "ff")
        for (const key of filteredFields) {
            const obj = arrayOfObjects.find(item => item.inputname === key);
            let columnType;
            // Determine column type based on object type
            switch (obj.type) {
                case 'text':
                case 'email':
                case 'password':
                case 'select':
                case 'range':
                    columnType = DataTypes.STRING;
                    break;
                case 'textarea':
                    columnType = DataTypes.TEXT;
                    break;
                case 'checkbox':
                    columnType = DataTypes.BOOLEAN;
                    break;
                case 'number':
                    columnType = DataTypes.INTEGER;
                    break;
                case 'date':
                    columnType = DataTypes.DATEONLY;
                    break;
                case 'time':
                    columnType = DataTypes.TIME;
                    break;
                case 'file':
                    columnType = DataTypes.BLOB;
                    break;
                default:
                    columnType = DataTypes.JSON;
                    break;
            }
            console.log(obj.type, "fin")
            await sequelize.getQueryInterface().addColumn('Users', key, {
                type: columnType,
                allowNull: true,
            });
        }
        res.json({ message: `Array of ${name} saved successfully ` });
    } catch (error) {
        console.error('Error saving array of objects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// const UserFrom = async (req, res) => {
//     try {
//         const arrayOfObjects = req.body.arrayOfObjects;
//         var name = req.body.Name
//         var tableview = req.body.Tableview
//         if (!arrayOfObjects || !Array.isArray(arrayOfObjects)) {
//             return res.status(400).json({ error: 'Invalid array of objects' });
//         }
//         const serializedData = JSON.stringify(arrayOfObjects);
//         // console.log(arrayOfObjects, "aoo")
//         const tview = JSON.stringify(tableview);
//         let existingData = await Settings.findOne({ where: { Name: name } });
//         if (existingData) {
//             // Update 
//             existingData.Data = serializedData;
//             existingData.Tableview = tview;
//             await existingData.save();
//         } else {
//             // Create 
//             await Settings.create({ Data: serializedData, Name: name, Tableview: tview });
//         }
//         const filterableInputsInSearch = arrayOfObjects.map(obj => (
//             obj.inputname
//         ));
//         const table = await queryInterface.describeTable('Users')
//         const filteredKeys = Object.keys(table);
//         function filterFields(array1, array2) {
//             return array1.filter(field => !array2.includes(field));
//         }
//         const compared = filterFields(filterableInputsInSearch, filteredKeys)
//         const excludedFields = ['id', 'createdAt', 'updatedAt'];
//         const filteredFields = compared.filter(field => !excludedFields.includes(field));
//         console.log(filteredFields, "ff")
//         for (const key of filteredFields) {
//             const obj = arrayOfObjects.find(item => item.inputname === key);
//             let columnType;
//             // Determine column type based on object type
//             switch (obj.type) {
//                 case 'text':
//                 case 'email':
//                 case 'password':
//                 case 'select':
//                 case 'range':
//                     columnType = DataTypes.STRING;
//                     break;
//                 case 'textarea':
//                     columnType = DataTypes.TEXT;
//                     break;
//                 case 'checkbox':
//                     columnType = DataTypes.BOOLEAN;
//                     break;
//                 case 'number':
//                     columnType = DataTypes.INTEGER;
//                     break;
//                 case 'date':
//                     columnType = DataTypes.DATEONLY;
//                     break;
//                 case 'time':
//                     columnType = DataTypes.TIME;
//                     break;
//                 case 'file':
//                     columnType = DataTypes.BLOB;
//                     break;
//                 default:
//                     columnType = DataTypes.JSON;
//                     break;
//             }
//             console.log(obj.type, "fin")
//             await sequelize.getQueryInterface().addColumn('Users', key, {
//                 type: columnType,
//                 allowNull: true,
//             });
//         }
//         res.json({ message: `Array of ${name} saved successfully ` });
//     } catch (error) {
//         console.error('Error saving array of objects:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

const EntityFrom = async (req, res) => {
    try {
        const arrayOfObjects = req.body.arrayOfObjects;
        var name = req.body.Name
        console.log(name, "entity Name")
        var tableview = req.body.Tableview
        if (!arrayOfObjects || !Array.isArray(arrayOfObjects)) {
            return res.status(400).json({ error: 'Invalid array of objects' });
        }
        const serializedData = JSON.stringify(arrayOfObjects);
        const tview = JSON.stringify(tableview);

        let existingData = await Settings.findOne({ where: { Name: name } });
        console.log(existingData)
        if (existingData) {
            // Update 
            existingData.Data = serializedData;
            existingData.Tableview = tview;
            await existingData.save();
        } else {
            // Create 
            await Settings.create({ Data: serializedData, Name: name, Tableview: tview });
        }
        const filterableInputsInSearch = arrayOfObjects.map(obj => (
            obj.inputname
        ));
        const table = await queryInterface.describeTable('Entities')
        const filteredKeys = Object.keys(table);
        function filterFields(array1, array2) {
            return array1.filter(field => !array2.includes(field));
        }
        const compared = filterFields(filterableInputsInSearch, filteredKeys)
        const excludedFields = ['id', 'createdAt', 'updatedAt'];
        const filteredFields = compared.filter(field => !excludedFields.includes(field));
        for (const key of filteredFields) {
            const obj = arrayOfObjects.find(item => item.inputname === key);
            let columnType;
            console.log(obj.type)
            // Determine column type based on object type
            switch (obj.type) {
                case 'text':
                case 'email':
                case 'password':
                case 'select':
                case 'range':
                    columnType = DataTypes.STRING;
                    break;
                case 'textarea':
                    columnType = DataTypes.TEXT;
                    break;
                case 'checkbox':
                    columnType = DataTypes.BOOLEAN;
                    break;
                case 'number':
                    columnType = DataTypes.INTEGER;
                    break;
                case 'date':
                    columnType = DataTypes.DATEONLY;
                    break;
                case 'time':
                    columnType = DataTypes.TIME;
                    break;
                case 'file':
                    columnType = DataTypes.BLOB;
                    break;
                default:
                    columnType = DataTypes.JSON;
                    break;
            }
            console.log(obj.type, "fin")
            await sequelize.getQueryInterface().addColumn('Entities', key, {
                type: columnType,
                allowNull: true,
            });

        }
        res.json({ message: `Array of ${name} saved successfully ` });
    } catch (error) {
        console.error('Error saving array of objects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const MeetingFrom = async (req, res) => {
    try {
        const arrayOfObjects = req.body.arrayOfObjects;
        var name = req.body.Name
        var tableview = req.body.Tableview
        if (!arrayOfObjects || !Array.isArray(arrayOfObjects)) {
            return res.status(400).json({ error: 'Invalid array of objects' });
        }
        const serializedData = JSON.stringify(arrayOfObjects);
        const tview = JSON.stringify(tableview);

        let existingData = await Settings.findOne({ where: { Name: name } });
        console.log(existingData)
        if (existingData) {
            // Update 
            existingData.Data = serializedData;
            existingData.Tableview = tview;
            await existingData.save();
        } else {
            // Create 
            await Settings.create({ Data: serializedData, Name: name, Tableview: tview });
        }
        const filterableInputsInSearch = arrayOfObjects.map(obj => (
            obj.inputname
        ));
        const table = await queryInterface.describeTable('Meetings')
        const filteredKeys = Object.keys(table);
        function filterFields(array1, array2) {
            return array1.filter(field => !array2.includes(field));
        }
        const compared = filterFields(filterableInputsInSearch, filteredKeys)
        const excludedFields = ['id', 'createdAt', 'updatedAt'];
        const filteredFields = compared.filter(field => !excludedFields.includes(field));
        // for (const key in filteredFields) {
        //     await sequelize.getQueryInterface().addColumn('Users', filteredFields[key], {
        //         type: DataTypes.STRING, // You may adjust the data type based on your requirement
        //         allowNull: true, // You may adjust this based on your requirement
        //     });
        // }
        for (const key of filteredFields) {
            const obj = arrayOfObjects.find(item => item.inputname === key);
            let columnType;
            console.log(obj.type)
            // Determine column type based on object type
            switch (obj.type) {
                case 'text':
                case 'email':
                case 'password':
                case 'select':
                case 'range':
                    columnType = DataTypes.STRING;
                    break;
                case 'textarea':
                    columnType = DataTypes.TEXT;
                    break;
                case 'checkbox':
                    columnType = DataTypes.BOOLEAN;
                    break;
                case 'number':
                    columnType = DataTypes.INTEGER;
                    break;
                case 'date':
                    columnType = DataTypes.DATEONLY;
                    break;
                case 'time':
                    columnType = DataTypes.TIME;
                    break;
                case 'file':
                    columnType = DataTypes.BLOB;
                    break;
                default:
                    columnType = DataTypes.JSON;
                    break;
            }
            console.log(obj.type, "fin")
            await sequelize.getQueryInterface().addColumn('Meetings', key, {
                type: columnType,
                allowNull: true,
            });
        }
        res.json({ message: `Array of ${name} saved successfully ` });
    } catch (error) {
        console.error('Error saving array of objects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const TeamFrom = async (req, res) => {
    try {
        const arrayOfObjects = req.body.arrayOfObjects;
        var name = req.body.Name
        var tableview = req.body.Tableview
        if (!arrayOfObjects || !Array.isArray(arrayOfObjects)) {
            return res.status(400).json({ error: 'Invalid array of objects' });
        }
        const serializedData = JSON.stringify(arrayOfObjects);
        const tview = JSON.stringify(tableview);

        let existingData = await Settings.findOne({ where: { Name: name } });
        console.log(existingData)
        if (existingData) {
            // Update 
            existingData.Data = serializedData;
            existingData.Tableview = tview;
            await existingData.save();
        } else {
            // Create 
            await Settings.create({ Data: serializedData, Name: name, Tableview: tview });
        }
        const filterableInputsInSearch = arrayOfObjects.map(obj => (
            obj.inputname
        ));
        const table = await queryInterface.describeTable('Teams')
        const filteredKeys = Object.keys(table);
        function filterFields(array1, array2) {
            return array1.filter(field => !array2.includes(field));
        }
        const compared = filterFields(filterableInputsInSearch, filteredKeys)
        const excludedFields = ['id', 'createdAt', 'updatedAt'];
        const filteredFields = compared.filter(field => !excludedFields.includes(field));
        // for (const key in filteredFields) {
        //     await sequelize.getQueryInterface().addColumn('Users', filteredFields[key], {
        //         type: DataTypes.STRING, // You may adjust the data type based on your requirement
        //         allowNull: true, // You may adjust this based on your requirement
        //     });
        // }
        for (const key of filteredFields) {
            const obj = arrayOfObjects.find(item => item.inputname === key);
            let columnType;
            console.log(obj.type)
            // Determine column type based on object type
            switch (obj.type) {
                case 'text':
                case 'email':
                case 'password':
                case 'select':
                case 'range':
                    columnType = DataTypes.STRING;
                    break;
                case 'textarea':
                    columnType = DataTypes.TEXT;
                    break;
                case 'checkbox':
                    columnType = DataTypes.BOOLEAN;
                    break;
                case 'number':
                    columnType = DataTypes.INTEGER;
                    break;
                case 'date':
                    columnType = DataTypes.DATEONLY;
                    break;
                case 'time':
                    columnType = DataTypes.TIME;
                    break;
                case 'file':
                    columnType = DataTypes.BLOB;
                    break;
                default:
                    columnType = DataTypes.JSON;
                    break;
            }
            console.log(obj.type, "fin")
            await sequelize.getQueryInterface().addColumn('Teams', key, {
                type: columnType,
                allowNull: true,
            });
        }
        res.json({ message: `Array of ${name} saved successfully ` });
    } catch (error) {
        console.error('Error saving array of objects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// const GetAllLIST = async (req, res) => {
//     try {
//         if (!req.query.name) {
//             res.status(404).json({ error: "no name specified, Please check" });
//         }
//         const form = await Settings.findOne({
//             where: {
//                 name: req.query.name
//             }
//         });
//         const data = JSON.parse(form.Data);
//         const tview = JSON.parse(form.Tableview);
//         // const trimmedJsonArray = array.map(obj => JSON.stringify(obj)).join(',');
//         res.status(200).json({ id: form.id, Name: form.Name, Data: data, Tableview: tview });
//     } catch (error) {
//         console.error("Error creating :", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }

// };

const GetAllLIST = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ error: "No name specified. Please provide a name." });
        }

        const form = await Settings.findOne({
            where: { name }
        });

        if (!form) {
            return res.status(404).json({ error: "Form not found." });
        }

        const data = JSON.parse(form.Data);
        const tview = JSON.parse(form.Tableview);

        res.status(200).json({
            id: form.id,
            Name: form.Name,
            Data: data,
            Tableview: tview
        });
    } catch (error) {
        console.error("Error fetching form:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



module.exports = { GetAllLIST, TeamFrom, UserFrom, MeetingFrom, EntityFrom }
