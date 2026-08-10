class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.message = message;
    if (data !== undefined && data !== null) {
      this.data = data;
    }
  }
}

module.exports = ApiResponse;
