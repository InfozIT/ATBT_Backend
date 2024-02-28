
var db = require('../models/index');
const User = db.User



const Add_toggle = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk();

    // Toggle the User_status
    const newStatus = !user.userstatus;
    console.log(newStatus)
    const remarks = req.body.user_remarks_history;

    // Update the User_status in the database
    const data = await User.update({ userstatus: newStatus, userremarkshistory: remarks }, { where: { id: userId } });

    // Fetch the updated user
    const updatedUser = await User.findByPk(userId);
        res.status(200).json({
      message: `User status updated successfully for ID: ${userId}`,data
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};






module.exports = { Add_toggle };