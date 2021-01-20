function (user, context, callback) {
  const namespace = 'https://hasura.io/jwt/claims'

  const email = user.email
  const adminSecret = configuration.ACCESS_KEY
  const url = configuration.HASURA_URL

  const invitationQuery = `query getInvitation {
      invitations(where: {email: {_eq: "${email}"}}) {
          email,
          role,
          used
        }
      }`

  const options = {
    headers: {
      'content-type': 'application/json',
      'x-hasura-admin-secret': adminSecret
    },
    url: url,
    body: JSON.stringify(
      {
        query: invitationQuery
      })
  }

  request.post(
    options,
    (_error, _response, body) => {
      const graphqlResponse = JSON.parse(body)
      const invitation = graphqlResponse.data.invitations
      if (invitation.length === 0) callback(new UnauthorizedError('No Invitation'), user, context)
      const role = invitation[0].role
      const used = !invitation[0].used;
      context.accessToken[namespace] = {
        'x-hasura-role': role,
        'x-hasura-allowed-roles': ['interviewee', 'interviewer'],
        'x-hasura-user-id': user.user_id
      }
      context.idToken[namespace] = {role: role, firstTime: used}
      callback(null, user, context)
    })
}
