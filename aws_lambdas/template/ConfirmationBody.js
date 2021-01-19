module.exports = (discordRoom, interviewDate, interviewHour, googleDocUrl) =>
`
<p>Hi!</p>
<p>We have scheduled an interview for you.</p>
<p>Remember to be in the room ${discordRoom} on ${interviewDate} at ${interviewHour}:00 CDT, the google docs
where the interview is going to happen is: ${googleDocUrl}.</p>
<p>Best regards.</p>
`
