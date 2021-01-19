const {
  GoogleFactory,
  GMAIL_API
} = require('./models')

exports.handler = async (event) => {
  const data = JSON.parse(event.body).input
  const emails = [data.interviewerEmail, data.interviewerEmail]
  const interviewDate = data.date

  const gmailAPI = new GoogleFactory(GMAIL_API)
  for (const email of emails) {
    await gmailAPI.sendCancellationEmail(
      email,
      interviewDate,
      '0:00'
    )
  }

  return {
    statusCode: 200
  }
}
