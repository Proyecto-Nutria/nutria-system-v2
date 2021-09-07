class Time {
  static castToDateFromStr(dateString) {
    return new Date(dateString);
  }

  static castDateToTimezone(date, country, timezone) {
    return new Date(date.toLocaleString(country, { timeZone: timezone }));
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
