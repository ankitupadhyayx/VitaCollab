const express = require("express");
const { listHospitalPatients } = require("../controllers/hospital.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

const router = express.Router();

router.use(authenticate);
router.get("/patients", authorize("hospital"), listHospitalPatients);

module.exports = router;
