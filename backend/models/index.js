const { User } = require("./user.model");
const { Record } = require("./record.model");
const { Notification } = require("./notification.model");
const { AuditLog } = require("./auditLog.model");

module.exports = {
	User,
	Record,
	Notification,
	AuditLog
};
