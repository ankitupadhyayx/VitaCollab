const { StatusCodes } = require("http-status-codes");
const { Notification } = require("../models");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const listMyNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Notifications fetched",
        data: {
          notifications: notifications.map((item) => ({
            id: item._id,
            message: item.message,
            type: item.type,
            isRead: item.isRead,
            createdAt: item.createdAt
          }))
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!notification) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(errorResponse({ message: "Notification not found" }));
    }

    notification.isRead = true;
    await notification.save();

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: "Notification marked as read"
      })
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listMyNotifications,
  markNotificationRead
};
