
var db = require('../models/index');
const User = db.User



const Add_toggle = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findByPk(userId);

    // Toggle the User_status
    const newStatus = !user.userstatus;
    const remarks = req.body.user_remarks_history;


    // Update the User_status in the database
    await User.update({ userstatus: newStatus, userremarkshistory: remarks }, { where: { id: userId } });


    
    res.status(200).json({
      message: `User status updated successfully for ID: ${userId}`,
 
    });

  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};






module.exports = { Add_toggle };