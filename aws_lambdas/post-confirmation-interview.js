const {
  GoogleFactory,
  CALENDAR_API,
  DRIVE_API,
  GMAIL_API,
  DOC_TYPE,
  FOLDER_TYPE
} = require('./models')

exports.handler = async (event) => {
  const data = JSON.parse(event.body).input
  const interviewerEmail = data.interviewerEmail
  const intervieweeEmail = data.interviewerEmail
  const intervieweeId = data.Id
  const interviewDate = data.date
  const interviewRoom = data.room

  const calendarAPI = new GoogleFactory(CALENDAR_API)
  calendarAPI.createEvent(interviewRoom, interviewDate, interviewerEmail)

  // Step 1: Search interviewee's google folder
  const driveAPI = new GoogleFactory(DRIVE_API)
  const intervieweeFolderId = await driveAPI.getResourceId(FOLDER_TYPE, intervieweeId)

  // Step 2: Create the google docs inside the folder and change its permissions
  const docId = await driveAPI.createResource(
      `Interview ${interviewDate}`,
      DOC_TYPE,
      intervieweeFolderId)
  driveAPI.changePermissionsOf(docId)

  // Step 3: Send the email to the interviewee with all the information
  const gmailAPI = new GoogleFactory(GMAIL_API)
  await gmailAPI.sendConfirmationEmail(intervieweeEmail,
    interviewRoom,
    interviewDate,
    '0:00', // interviewBeginning
    docId)

  const response = {
    statusCode: 200,
    body: JSON.stringify({ sum: 'Email Sent' })
  }
  return response
}
