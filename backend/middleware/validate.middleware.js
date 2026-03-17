const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/apiResponse");

const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }));

    return res.status(StatusCodes.BAD_REQUEST).json(
      errorResponse({
        message: "Validation failed",
        errors: details
      })
    );
  }

  req[source] = result.data;
  return next();
};

module.exports = {
  validate
};
