import FoodOrder from "../models/FoodOrder.js";

const getAllFoodOrders = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { status, category, page = 1, limit = 10 } = req.query;

    let filter = { hotel: hotelId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    const orders = await FoodOrder.find(filter)
      .populate("guest", "name email phone")
      .populate("assignedStaff", "name position")
      .limit(limit * 1)
      .skip(skip)
      .sort({ orderTime: -1 });

    const total = await FoodOrder.countDocuments(filter);

    return res.status(200).json({
      status: "success",
      data: orders,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: page }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const getFoodOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await FoodOrder.findById(id)
      .populate("guest", "name email phone")
      .populate("assignedStaff", "name position");

    if (!order) return res.status(404).json({ status: "failed", message: "Food order not found" });

    return res.status(200).json({ status: "success", data: order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const createFoodOrder = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { roomNumber, guestName, items, totalPrice, category, ...rest } = req.body;

    if (!roomNumber || !guestName || !items || !totalPrice) {
      return res.status(400).json({ status: "failed", message: "Missing required fields" });
    }

    // Auto-categorize if not provided
    let orderCategory = category;
    if (!orderCategory && items.length > 0) {
      const drinkItems = ["juice", "coffee", "tea", "wine", "beer", "cola", "sprite", "water", "lemonade"];
      const drinkCount = items.filter(item => 
        drinkItems.some(drink => item.toLowerCase().includes(drink))
      ).length;

      if (drinkCount === 0) orderCategory = "food";
      else if (drinkCount === items.length) orderCategory = "drink";
      else orderCategory = "mixed";
    }

    const orderId = "FO-" + Date.now().toString().slice(-10);

    const order = new FoodOrder({
      hotel: hotelId,
      orderId,
      roomNumber,
      guestName,
      items,
      totalPrice,
      category: orderCategory || "mixed",
      ...rest
    });

    await order.save();
    await order.populate("guest", "name email phone");

    return res.status(201).json({
      status: "success",
      message: "Food order created successfully",
      data: order
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const updateFoodOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const order = await FoodOrder.findByIdAndUpdate(id, updates, { new: true })
      .populate("guest", "name email phone")
      .populate("assignedStaff", "name position");

    if (!order) return res.status(404).json({ status: "failed", message: "Food order not found" });

    return res.status(200).json({
      status: "success",
      message: "Food order updated successfully",
      data: order
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const updateFoodOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "preparing", "ready", "delivering", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ status: "failed", message: "Invalid status" });
    }

    const updates = { status };
    const now = new Date();

    if (status === "preparing") updates.prepStartTime = now;
    else if (status === "ready") updates.prepEndTime = now;
    else if (status === "delivering") updates.deliveryStartTime = now;
    else if (status === "delivered") updates.deliveryEndTime = now;

    const order = await FoodOrder.findByIdAndUpdate(id, updates, { new: true });
    if (!order) return res.status(404).json({ status: "failed", message: "Food order not found" });

    return res.status(200).json({
      status: "success",
      message: "Food order status updated",
      data: order
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const deleteFoodOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await FoodOrder.findByIdAndDelete(id);
    if (!order) return res.status(404).json({ status: "failed", message: "Food order not found" });

    return res.status(200).json({
      status: "success",
      message: "Food order deleted",
      data: order
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

export {
  getAllFoodOrders,
  getFoodOrderById,
  createFoodOrder,
  updateFoodOrder,
  updateFoodOrderStatus,
  deleteFoodOrder
};
