const request = require("request-promise");

exports.handler = async () => {
  const adminSecret = process.env.ACCESS_KEY;
  const url = process.env.HASURA_URL;

  const poolQuery = `
  query poolQuery {
    pools {
      id
      availability
    }
  }
`;
  const deleteMutation = `mutation($poolId: Int!){
    delete_pools(where: {id: {_eq: $poolId}}) {
      affected_rows
    }
  }`;

  const queryOptions = JSON.stringify({
    query: poolQuery,
  });

  let options = {
    headers: {
      "content-type": "application/json",
      "x-hasura-admin-secret": adminSecret,
    },
    url: url,
  };

  let query = { ...options };
  query.body = queryOptions;

  const rawPools = await request.post(query, (error, response, _body) => {
    if (error) return null;
    return response.body;
  });
  if (!rawPools) return { statusCode: 500 };
  const pools = JSON.parse(rawPools).data.pools;
  let expiredPools = [];
  pools.forEach((pool) => {
    const today = new Date();
    const lastAvailability = new Date(
      pool.availability[pool.availability.length - 1]
        .split(",")[1]
        .split(" ")[0]
        .slice(1)
    );
    if (today > lastAvailability) expiredPools.push(pool.id);
  });

  let mutation = { ...options };
  for (const poolId of expiredPools) {
    const mutationOptions = JSON.stringify({
      query: deleteMutation,
      variables: {
        poolId,
      },
    });
    mutation.body = mutationOptions;
    await request.post(mutation, (error, _response, _body) => {
      if (error) {
        console.log(`Pool with id ${poolId} couldn't be deleted`);
      }
    });
  }
};
