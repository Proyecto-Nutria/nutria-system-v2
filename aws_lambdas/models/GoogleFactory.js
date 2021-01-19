const CALENDAR_API = 'calendar'
const DRIVE_API = 'drive'
const GMAIL_API = 'gmail'
const PDF_TYPE = 'application/pdf'
const DOC_TYPE = 'application/vnd.google-apps.document'
const FOLDER_TYPE = 'application/vnd.google-apps.folder'

const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const googleCredentials = require('../config/google-credentials.json')

const NUTRIA_EMAIL = 'proyecto.nutria.escom@gmail.com'
const HTML_TYPE = 'Content-Type:text/html;charset=utf-8'
const confirmationBody = require('../template/ConfirmationBody')
const cancellationBody = require('../template/CancellationBody')
const emailGeneralTemplate = require('../template/GeneralTemplate')

class Credentials {
  constructor () {
    this._oAuth2Client = new OAuth2(
      googleCredentials.web.client_id,
      googleCredentials.web.client_secret,
      googleCredentials.web.redirect_uris[1]
    )
  }

  _setRefreshToken () {
    this._oAuth2Client
      .setCredentials({
        refresh_token: googleCredentials.docs_drive_refresh_token
      })
  }

  get getAuth () {
    this._setRefreshToken()
    return this._oAuth2Client
  }
}

class CalendarAPI extends Credentials {
  constructor () {
    super()
    this.type = CALENDAR_API
    this.api = google.calendar({ version: 'v3' })
  }

  async createEvent (roomNumber, initialDate, interviewerEmail) {
    const twoHoursInTimestamp = 7200000
    const initialNumberDate = Number(initialDate)
    const eventData = {
      summary: 'Nutria Interview',
      location: `room ${roomNumber}`,
      start: {
        dateTime: new Date(initialNumberDate),
        timeZone: 'EST'
      },
      end: {
        dateTime: new Date(initialNumberDate + twoHoursInTimestamp),
        timeZone: 'EST'
      },
      attendees: [
        { email: interviewerEmail }
      ]
    }

    return await this
      .api
      .events
      .insert({
        auth: super.getAuth,
        calendarId: 'primary',
        resource: eventData
      })
      .catch(e => {
        console.error(e)
      })
  }
}

class DriveAPI extends Credentials {
  constructor () {
    super()
    this.type = DRIVE_API
    this.api = google.drive({ version: 'v3' })
  }

  async createResource (name, type, parentFolderId = null, data = null) {
    if (parentFolderId === null) {
      parentFolderId = googleCredentials.interview_folder_id
    }

    var metadata = {
      name: name,
      parents: [parentFolderId]
    }
    var file = {}

    if (data === null) {
      metadata.mimeType = type
    } else {
      file = {
        mimeType: type,
        body: data
      }
    }

    return await this
      .api
      .files
      .create({
        auth: super.getAuth,
        resource: metadata,
        media: file,
        fields: 'id'
      })
      .then(value => {
        return value.data.id
      })
      .catch(e => {
        console.error(e)
      })
  }

  async getResourceId (resource, name) {
    return await this
      .api
      .files
      .list({
        auth: super.getAuth,
        q: `mimeType='${resource}' and name='${name}'`,
        fields: 'nextPageToken, files(id, name)',
        spaces: 'drive',
        pageToken: null
      })
      .then(value => {
        const folderInformation = value.data.files
        if (folderInformation === undefined || folderInformation.length === 0) {
          return ''
        }
        return folderInformation[0].id
      })
      .catch(e => {
        console.error(e)
      })
  }

  async deleteResource (id) {
    return await this
      .api
      .files
      .delete({
        auth: super.getAuth,
        fileId: id
      })
  }

  changePermissionsOf (resourceId) {
    this
      .api
      .permissions
      .create(
        {
          auth: super.getAuth,
          fields: 'id',
          fileId: resourceId,
          resource: {
            type: 'anyone',
            role: 'writer'
          }
        }
      ).catch(e => {
        console.error(e)
      })
  }
}

class GmailAPI extends Credentials {
  constructor () {
    super()
    this.type = GMAIL_API
    this.api = google.gmail({ version: 'v1' })
  }

  async sendConfirmationEmail (to, room, date, hour, docId) {
    const subject = `Nutria Interview at ${date}`
    const googleDocUrl = `docs.google.com/document/d/${docId}`
    const emailBody = confirmationBody(room, date, hour, googleDocUrl)
    const emailTemplate = emailGeneralTemplate(emailBody)

    await this._sendEmail(to, subject, emailTemplate)
  }

  async sendCancellationEmail (to, date, hour, userType) {
    const subject = `Cancellation of Nutria Interview on ${date}`
    const emailBody = cancellationBody(date, hour, userType)
    const emailTemplate = emailGeneralTemplate(emailBody)

    await this._sendEmail(to, subject, emailTemplate)
  }

  async _sendEmail (to, subject, emailTemplate) {
    const from = `From:<${NUTRIA_EMAIL}>`
    const emailTo = `To:<${to}>`
    const emailSubject = `Subject:${subject}`
    const buff = Buffer.from(`${from}\n${emailTo}\n${emailSubject}\n${HTML_TYPE}\n${emailTemplate}`)
    const base64data = buff.toString('base64')

    await this
      .api
      .users
      .messages
      .send(
        {
          auth: super.getAuth,
          userId: 'me',
          resource: { raw: base64data }
        }
      )
      .catch(e => {
        console.error(e)
      })
  }
}

class GoogleFactory {
  constructor (type) {
    if (type === CALENDAR_API) { return new CalendarAPI() }
    if (type === DRIVE_API) { return new DriveAPI() }
    if (type === GMAIL_API) { return new GmailAPI() }
  }
}

module.exports = {
  GoogleFactory,
  CALENDAR_API,
  GMAIL_API,
  DRIVE_API,
  PDF_TYPE,
  FOLDER_TYPE,
  DOC_TYPE
}
