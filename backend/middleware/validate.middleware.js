const { StatusCodes } = require("http-status-codes");
const { errorResponse } = require("../utils/apiResponse");

const VALIDATION_FAILED_MESSAGE = "Please check the highlighted fields and try again.";

const normalizeIssueMessage = (issue) => {
  if (issue.message && issue.message !== "Required") {
    return issue.message;
  }

  if (issue.code === "invalid_type") {
    return issue.received === "undefined"
      ? "This field is required."
      : "Please enter a valid value.";
  }

  if (issue.code === "too_small") {
    return issue.minimum === 1
      ? "This field is required."
      : "Please enter a valid value.";
  }

  if (issue.code === "too_big" || issue.code === "invalid_string" || issue.code === "invalid_enum_value") {
    return "Please enter a valid value.";
  }

  return "Please review this field and try again.";
};

const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: normalizeIssueMessage(issue)
    }));

    return res.status(StatusCodes.BAD_REQUEST).json(
      errorResponse({
        message: VALIDATION_FAILED_MESSAGE,
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
