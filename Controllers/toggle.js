
var db = require('../models/index');
const User = db.User



const Add_toggle = async (req, res) => {
  try {
    const userId = req.query.id;

    // Find the user by ID
    const user = await User.findByPk(userId);

    // Toggle the User_status
    const newStatus = !user.User_status;

    // Update the User_status in the database
    await User.update({ User_status: newStatus }, { where: { id: userId } });

    // Fetch the updated user
    const updatedUser = await User.findByPk(userId);

    res.status(200).json({
      message: `User status updated successfully for ID: ${userId}`,
      user: updatedUser
    });

  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};






module.exports = { Add_toggle };