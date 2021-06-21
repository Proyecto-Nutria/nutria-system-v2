const { GoogleFactory, GMAIL_API } = require("./models");
const { Time } = require("./utils");

exports.handler = async (event) => {
  const data = JSON.parse(event.body).event.data.old;
  const emails = [data.interviewee_email, data.interviewer_email];
  const interviewDate = Time.castToDateFromStr(data.date);
  const interviewDay = Time.getReadableDateFrom(interviewDate);
  const interviewHour = Time.getHoursFrom(interviewDate);

  const gmailAPI = new GoogleFactory(GMAIL_API);
  for (const email of emails) {
    await gmailAPI.sendCancellationEmail(email, interviewDay, interviewHour);
  }

  return {
    statusCode: 200,
  };
};
