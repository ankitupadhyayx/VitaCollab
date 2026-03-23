const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const { Record } = require("../models");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { withRequestTiming } = require("../utils/requestTiming");
const { API_MESSAGES } = require("../utils/apiMessages");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const listHospitalPatients = async (req, res, next) => {
  try {
    const rawSearch = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const sort = typeof req.query.sort === "string" ? req.query.sort.trim().toLowerCase() : "latest_activity";
    const skip = (page - 1) * limit;

    const hospitalId = req.user?.id;
    if (!hospitalId || !mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(errorResponse({ message: API_MESSAGES.COMMON.INVALID_HOSPITAL_CONTEXT }));
    }

    const searchRegex = rawSearch ? new RegExp(escapeRegex(rawSearch), "i") : null;

    const sortStage =
      sort === "name_asc"
        ? { name: 1, latestRecordDate: -1 }
        : sort === "pending_first"
          ? { statusPriority: -1, latestRecordDate: -1, name: 1 }
          : { latestRecordDate: -1, name: 1 };

    const [directory] = await withRequestTiming(
      {
        req,
        label: "hospital.patientsDirectory",
        meta: {
          page,
          limit,
          sort,
          hasSearch: Boolean(rawSearch)
        }
      },
      async () =>
        Record.aggregate([
          {
            $match: {
              hospitalId: new mongoose.Types.ObjectId(hospitalId)
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $group: {
              _id: "$patientId",
              latestRecordStatus: { $first: "$status" },
              latestRecordDate: { $first: "$createdAt" },
              recordCount: { $sum: 1 },
              pendingCount: {
                $sum: {
                  $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
                }
              },
              rejectedCount: {
                $sum: {
                  $cond: [{ $eq: ["$status", "rejected"] }, 1, 0]
                }
              },
              approvedCount: {
                $sum: {
                  $cond: [{ $eq: ["$status", "approved"] }, 1, 0]
                }
              }
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "patient"
            }
          },
          {
            $unwind: "$patient"
          },
          {
            $match: {
              "patient.role": "patient",
              ...(searchRegex
                ? {
                    $or: [
                      { "patient.name": searchRegex },
                      { "patient.email": searchRegex }
                    ]
                  }
                : {})
            }
          },
          {
            $project: {
              _id: 0,
              id: "$patient._id",
              name: "$patient.name",
              email: "$patient.email",
              profileImageUrl: "$patient.profileImageUrl",
              pendingCount: 1,
              recordCount: 1,
              latestRecordStatus: 1,
              latestRecordDate: 1,
              status: {
                $switch: {
                  branches: [
                    { case: { $gt: ["$pendingCount", 0] }, then: "pending" },
                    { case: { $gt: ["$rejectedCount", 0] }, then: "rejected" },
                    { case: { $gt: ["$approvedCount", 0] }, then: "approved" }
                  ],
                  default: "$latestRecordStatus"
                }
              }
            }
          },
          {
            $addFields: {
              statusPriority: {
                $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
              }
            }
          },
          {
            $sort: sortStage
          },
          {
            $facet: {
              data: [
                { $skip: skip },
                { $limit: limit },
                {
                  $project: {
                    pendingCount: 0,
                    statusPriority: 0
                  }
                }
              ],
              totalCount: [{ $count: "count" }]
            }
          }
        ])
    );

    const patients = directory?.data || [];
    const total = directory?.totalCount?.[0]?.count || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.status(StatusCodes.OK).json(
      successResponse({
        message: API_MESSAGES.HOSPITAL.PATIENTS_FETCHED,
        data: {
          patients,
          total,
          search: rawSearch,
          sort,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listHospitalPatients
};
