const mongoose = require("mongoose");
const { Record } = require("../models/record.model");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const hasHospitalPatientRelationship = async ({ hospitalId, patientId }) => {
  if (!isValidObjectId(hospitalId) || !isValidObjectId(patientId)) {
    return false;
  }

  const relationship = await Record.exists({
    hospitalId,
    patientId,
    status: "approved"
  });

  return Boolean(relationship);
};

const canAccessRecord = async ({ user, record }) => {
  if (!user || !record) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  if (user.role === "patient") {
    return String(record.patientId) === String(user.id);
  }

  if (user.role === "hospital") {
    if (String(record.hospitalId) === String(user.id)) {
      return true;
    }

    return hasHospitalPatientRelationship({
      hospitalId: user.id,
      patientId: record.patientId
    });
  }

  return false;
};

module.exports = {
  canAccessRecord,
  hasHospitalPatientRelationship
};
