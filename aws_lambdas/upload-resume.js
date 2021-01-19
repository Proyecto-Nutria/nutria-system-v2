const {
  GoogleFactory,
  DRIVE_API,
  PDF_TYPE,
  FOLDER_TYPE
} = require('./models')
const fs = require('fs')

exports.handler = async (event) => {
  const encoding = 'base64'
  const filename = 'resume.pdf'
  const intervieweeId = '0123'

  const fileBuffer = Buffer.from(event.input, encoding)
  const path = `/tmp/${filename}`

  try {
    fs.writeFileSync(path, fileBuffer, encoding)
  } catch (_error) {
    return { statusCode: 422 }
  }

  const driveAPI = new GoogleFactory(DRIVE_API)
  const folderId = await driveAPI.createResource(intervieweeId, FOLDER_TYPE)

  const readStream = fs.createReadStream(path)
  await driveAPI.createResource(
    filename,
    PDF_TYPE,
    folderId,
    readStream
  )

  return {
    statusCode: 200,
    body: JSON.stringify({ folderId: folderId })
  }
}
