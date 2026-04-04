import Staff from "../models/Staff.js";

const getAllStaff = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { status, position, department, page = 1, limit = 10 } = req.query;

    let filter = { hotel: hotelId };
    if (status) filter.status = status;
    if (position) filter.position = position;
    if (department) filter.department = department;

    const skip = (page - 1) * limit;
    const staff = await Staff.find(filter)
      .select("-password")
      .limit(limit * 1)
      .skip(skip)
      .sort({ name: 1 });

    const total = await Staff.countDocuments(filter);

    return res.status(200).json({
      status: "success",
      data: staff,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: page }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById(id).select("-password");

    if (!staff) return res.status(404).json({ status: "failed", message: "Staff not found" });

    return res.status(200).json({ status: "success", data: staff });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const createStaff = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { name, email, position, department, salary, ...rest } = req.body;

    if (!name || !email || !position || !department) {
      return res.status(400).json({ status: "failed", message: "Missing required fields" });
    }

    const existingStaff = await Staff.findOne({ hotel: hotelId, email });
    if (existingStaff) {
      return res.status(400).json({ status: "failed", message: "Email already exists" });
    }

    const staff = new Staff({
      hotel: hotelId,
      name,
      email,
      position,
      department,
      salary,
      ...rest
    });

    await staff.save();

    return res.status(201).json({
      status: "success",
      message: "Staff member added successfully",
      data: staff
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow password update through this endpoint
    if (updates.password) delete updates.password;

    const staff = await Staff.findByIdAndUpdate(id, updates, { new: true }).select("-password");

    if (!staff) return res.status(404).json({ status: "failed", message: "Staff not found" });

    return res.status(200).json({
      status: "success",
      message: "Staff updated successfully",
      data: staff
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findByIdAndDelete(id);
    if (!staff) return res.status(404).json({ status: "failed", message: "Staff not found" });

    return res.status(200).json({
      status: "success",
      message: "Staff deleted successfully",
      data: staff
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

export {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};
