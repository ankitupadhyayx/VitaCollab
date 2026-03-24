const { User } = require("./user.model");
const { Record } = require("./record.model");
const { RecordShareToken } = require("./recordShareToken.model");
const { Notification } = require("./notification.model");
const { AuditLog } = require("./auditLog.model");
const { Review } = require("./review.model");

module.exports = {
	User,
	Record,
	RecordShareToken,
	Notification,
	AuditLog,
	Review
};
