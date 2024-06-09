require('dotenv').config();
var db = require('../models/index');
const Reports = db.Reports;

const mycon = require('../DB/mycon')
const { json } = require('sequelize');

const Create_Report = async (req, res) => {
  try {
    const { reportName, reportData, createdBy } = req.body;

    if (!reportName || !reportData || !createdBy) {
      return res.status(400).send('Missing required fields');
    }

    // Create the report using Sequelize
    const report = await Reports.create({
      reportName,
      reportData,
      createdBy
    });

    res.status(201).send(`Report created with ID: ${report.id}`);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).send('Error creating report');
  }
};

const GetReports = async (req, res) => {
  try {
    const { searchQuery = '', page = 1, pageSize = 10, sortBy = 'createdAt', order = 'DESC' } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const whereClause = {};

    if (searchQuery) {
      whereClause.reportName = { [Op.like]: `%${searchQuery}%` };
    }

    const { count, rows: reports } = await Reports.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortBy, order.toUpperCase()]]
    });

    const totalPages = Math.ceil(count / pageSize);

    res.status(200).json({
      reports,
      totalReports: count,
      totalPages,
      currentPage: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).send('Error fetching reports');
  }
};

const GetReportByid = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!id) {
      return res.status(400).send('Report ID is required');
    }

    // Find the report by ID
    const report = await Reports.findByPk(id);

    // Check if the report exists
    if (!report) {
      return res.status(404).send('Report not found');
    }

    // Send the report details
    res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching report by ID:', error);
    res.status(500).send('Error fetching report');
  }
};



const Delete_Report = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!id) {
      return res.status(400).send('Report ID is required');
    }

    // Find the report by ID
    const report = await Reports.findByPk(id);

    // Check if the report exists
    if (!report) {
      return res.status(404).send('Report not found');
    }

    // Delete the report
    await report.destroy();

    // Send a success response
    res.status(200).send(`Report with ID: ${id} has been deleted`);
  } catch (error) {
    console.error('Error deleting report by ID:', error);
    res.status(500).send('Error deleting report');
  }
};



module.exports = {
    Create_Report,
    GetReports,
    GetReportByid,
    Delete_Report
};
