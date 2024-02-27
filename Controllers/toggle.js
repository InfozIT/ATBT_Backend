
var db = require('../models/index');
const User = db.User



const Add_toggle = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findByPk(userId);

    // Toggle the User_status
    const newStatus = !user.userstatus;
    const user_remarks_history = req.body.user_remarks_history;
    const userJSONSTRINGFY = JSON.stringify(user_remarks_history)

    // Update the User_status in the database
    await User.update({ userstatus: newStatus, userremarkshistory: userJSONSTRINGFY }, { where: { id: userId } });

    // Fetch the updated user
    const updatedUser = await User.findByPk(userId);
    
    const a = updatedUser.userremarkshistory;

    const jsonparsea = JSON.parse(a);
      // const userremarkshistorys = {updatedUser}
      // const userremarkshistory=JSON.parse(userremarkshistorys);

      // const data = { ...updatedUser, userremarkshistory };
    
    res.status(200).json({
      message: `User status updated successfully for ID: ${userId}`,
      remark: jsonparsea,
      user_status: updatedUser.userstatus
    });

  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};






module.exports = { Add_toggle };