class Time {
  static castToDateFromStr(dateString) {
    return new Date(dateString);
  }

  static getReadableDateFrom(date) {
    return date.toDateString();
  }

  static getHoursFrom(date) {
    return date.getHours();
  }

  static getTimestampFrom(date) {
    return date.getTime();
  }
}

module.exports = {
  Time,
};
