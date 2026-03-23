const { StatusCodes } = require("http-status-codes");
const { Notification } = require("../models");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { withRequestTiming } = require("../utils/requestTiming");
const { API_MESSAGES } = require("../utils/apiMessages");

const listMyNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    return await withRequestTiming(
      {
        req,
        label: "notifications.listMine",
        meta: { limit }
      },
      async () => {
        const notifications = await Notification.find({ userId: req.user.id })
          .sort({ createdAt: -1 })
          .limit(limit);

        return res.status(StatusCodes.OK).json(
          successResponse({
            message: API_MESSAGES.NOTIFICATIONS.LIST_FETCHED,
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
      }
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
        .json(errorResponse({ message: API_MESSAGES.NOTIFICATIONS.NOT_FOUND }));
    }

    notification.isRead = true;
    await notification.save();

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.NOTIFICATIONS.MARKED_READ
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
