const {
  GoogleFactory,
  GMAIL_API
} = require('./models')

exports.handler = async (event) => {
  /* const body = event["body"]
    const data = JSON.parse( body );
    const inputs = data["input"] */

  const gmailAPI = new GoogleFactory(GMAIL_API)
  await gmailAPI.sendConfirmationEmail('proyecto.nutria.escom@gmail.com',
    '3',
    'random',
    'random',
    'uid')

  const response = {
    statusCode: 200,
    body: JSON.stringify({ sum: 'Email Sent' })
  }
  return response
}
