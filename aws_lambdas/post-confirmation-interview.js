const {
  GoogleFactory,
  CALENDAR_API,
  DRIVE_API,
  GMAIL_API,
  DOC_TYPE,
  FOLDER_TYPE,
  COUNTRY_TIMEZONE,
  IANA_TIMEZONE,
} = require("./models");

const { Time } = require("./utils");
const request = require("request-promise");

exports.handler = async (event) => {
  const data = JSON.parse(event.body).event.data.new;
  const interviewId = data.id;
  const interviewerEmail = data.interviewer_email;
  const intervieweeEmail = data.interviewee_email;
  const intervieweeId = data.interviewee_id;
  const interviewDate = Time.castToDateFromStr(data.date);
  const ptDate = Time.castDateToTimezone(
    interviewDate,
    COUNTRY_TIMEZONE,
    IANA_TIMEZONE
  );
  const diffWithPT = interviewDate.getTime() - ptDate.getTime();
  const interviewDay = Time.getReadableDateFrom(interviewDate);
  const interviewHour = Time.getHoursFrom(interviewDate);
  const interviewDateAsTimestamp =
    Time.getTimestampFrom(interviewDate) + diffWithPT;
  const interviewRoom = data.room;

  const adminSecret = process.env.ACCESS_KEY;
  const url = process.env.HASURA_URL;

  // Step 1: Search interviewee's google folder
  const driveAPI = new GoogleFactory(DRIVE_API);
  const intervieweeFolderId = await driveAPI.getResourceId(
    FOLDER_TYPE,
    intervieweeId
  );

  // Step 2: Create the google docs inside the folder and change its permissions
  const docId = await driveAPI.createResource(
    `Interview ${interviewDate}`,
    DOC_TYPE,
    intervieweeFolderId
  );
  driveAPI.changePermissionsOf(docId);

  // Step 3: Create the event in the calendar of the interviewer
  const calendarAPI = new GoogleFactory(CALENDAR_API);
  await calendarAPI.createEvent(
    interviewRoom,
    docId,
    interviewDateAsTimestamp,
    interviewerEmail
  );

  // Step 4: Send the email to the interviewee with all the information
  const gmailAPI = new GoogleFactory(GMAIL_API);
  await gmailAPI.sendConfirmationEmail(
    intervieweeEmail,
    interviewRoom,
    interviewDay,
    interviewHour,
    docId
  );

  //Step 5: Update Hasura with the document id
  const mutation = `mutation($interviewId: Int!){
    update_interviews(_set: {document: "${docId}"}, where: {id: {_eq: $interviewId}}) {
      affected_rows
    }
  }`;

  const options = {
    headers: {
      "content-type": "application/json",
      "x-hasura-admin-secret": adminSecret,
    },
    url: url,
    body: JSON.stringify({
      query: mutation,
      variables: {
        interviewId,
      },
    }),
  };

  await request.post(options, (error, _response, _body) => {
    if (error) {
      return { statusCode: 500 };
    }
  });

  return { statusCode: 200 };
};
