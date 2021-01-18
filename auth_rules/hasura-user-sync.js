function (user, context, callback) {
  const userId = user.user_id
  const nickname = user.nickname
  const email = user.email

  const adminSecret = configuration.ACCESS_KEY
  const url = configuration.HASURA_URL

  const mutation = `mutation($userId: String!, $nickname: String, $email:String!) {
      insert_users(objects: [{
          auth0_id: $userId,
          name: $nickname,
          email: $email
        }],
        on_conflict: {
          constraint: users_pkey,
          update_columns: [name]
        }) {
          affected_rows
        }
      }`

  request.post(
    {
      headers: {
        'content-type': 'application/json',
        'x-hasura-admin-secret': adminSecret
      },
      url: url,
      body: JSON.stringify(
        {
          query: mutation,
          variables: {
            userId,
            nickname,
            email
          }
        })
    },
    function (error, _response, body) {
      console.log(body)
      callback(error, user, context)
    })
}
