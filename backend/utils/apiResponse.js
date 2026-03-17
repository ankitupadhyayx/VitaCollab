const successResponse = ({ message = "Success", data = null }) => ({
  success: true,
  message,
  data
});

const errorResponse = ({ message = "Something went wrong", errors = null }) => ({
  success: false,
  message,
  errors
});

module.exports = {
  successResponse,
  errorResponse
};
