var db = require('../models/index.js');
const Settings = db.From;
const { DataTypes } = require('sequelize');
const sequelize = require('../DB/dbconncet.js');
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
            const tview = JSON.stringify(tableview);

            let existingData = await Settings.findOne({where: {Name: name}});
            if (existingData) {
                // Update 
                existingData.Data = serializedData;
                await existingData.save();
            } else {
                // Create 
                await Settings.create({ Data: serializedData, Name: name,Tableview :tview});
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
            for (const key in filteredFields) {
                await sequelize.getQueryInterface().addColumn('Users', filteredFields[key], {
                    type: DataTypes.STRING, // You may adjust the data type based on your requirement
                    allowNull: true, // You may adjust this based on your requirement
                });
            }
            res.json({ message: `Array of ${name} saved successfully `});
    } catch (error) {
        console.error('Error saving array of objects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

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

            let existingData = await Settings.findOne({where: {Name: name}});
            console.log(existingData, "ed-null")
            if (existingData) {
                // Update 
                existingData.Data = serializedData;
                await existingData.save();
            } else {
                // Create 
                console.log(name,"name-chk")
                await Settings.create({ Data: serializedData, Name: name,Tableview :tview});
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
            for (const key in filteredFields) {
                await sequelize.getQueryInterface().addColumn('Entities', filteredFields[key], {
                    type: DataTypes.STRING, // You may adjust the data type based on your requirement
                    allowNull: true, // You may adjust this based on your requirement
                });
            }
            res.json({ message: `Array of ${name} saved successfully `});
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

            let existingData = await Settings.findOne({where: {Name: name}});
            if (existingData) {
                // Update 
                existingData.Data = serializedData;
                await existingData.save();
            } else {
                // Create 
                await Settings.create({ Data: serializedData, Name: name,Tableview :tview});
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
            for (const key in filteredFields) {
                await sequelize.getQueryInterface().addColumn('Meetings', filteredFields[key], {
                    type: DataTypes.STRING, // You may adjust the data type based on your requirement
                    allowNull: true, // You may adjust this based on your requirement
                });
            }
            res.json({ message: `Array of ${name} saved successfully `});
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

            let existingData = await Settings.findOne({where: {Name: name}});
            if (existingData) {
                // Update 
                existingData.Data = serializedData;
                await existingData.save();
            } else {
                // Create 
                await Settings.create({ Data: serializedData, Name: name,Tableview :tview});
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
            for (const key in filteredFields) {
                await sequelize.getQueryInterface().addColumn('Teams', filteredFields[key], {
                    type: DataTypes.STRING, // You may adjust the data type based on your requirement
                    allowNull: true, // You may adjust this based on your requirement
                });
            }
            res.json({ message: `Array of ${name} saved successfully `});
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

module.exports = { GetAllLIST, TeamFrom, UserFrom, MeetingFrom,EntityFrom}
