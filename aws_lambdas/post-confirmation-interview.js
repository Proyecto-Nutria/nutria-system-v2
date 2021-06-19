const {
  GoogleFactory,
  CALENDAR_API,
  DRIVE_API,
  GMAIL_API,
  DOC_TYPE,
  FOLDER_TYPE,
} = require("./models");

exports.handler = async (event) => {
  const data = JSON.parse(event.body).event.data.new;
  const interviewerEmail = data.interviewer_email;
  const intervieweeEmail = data.interviewee_email;
  const intervieweeId = data.interviewee_id;
  const interviewDate = data.date;
  const interviewRoom = data.room;

  //TODO: See how to parse between hasura date type and google date type
  // const calendarAPI = new GoogleFactory(CALENDAR_API);
  // calendarAPI.createEvent(interviewRoom, interviewDate, interviewerEmail);

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

  // Step 3: Send the email to the interviewee with all the information
  const gmailAPI = new GoogleFactory(GMAIL_API);
  await gmailAPI.sendConfirmationEmail(
    intervieweeEmail,
    interviewRoom,
    interviewDate,
    "0:00", // interviewBeginning
    docId
  );

  return {
    statusCode: 200,
  };
};
