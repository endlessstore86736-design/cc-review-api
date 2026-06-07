exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const status = (event.queryStringParameters && event.queryStringParameters.status) || 'pending';
    const filterActive = status === 'approved' ? 'true' : 'false';

    const token = process.env.SHOPIFY_ADMIN_TOKEN;
    if (!token) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'No token configured' }) };
    }

    const query = `{
      metaobjects(type: "cc_review", first: 50) {
        nodes {
          id
          handle
          fields { key value }
        }
      }
    }`;

    const res = await fetch(
      'https://colorcosmetic.myshopify.com/admin/api/2024-10/graphql.json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await res.json();

    if (data.errors) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: data.errors }) };
    }

    const all = (data.data && data.data.metaobjects && data.data.metaobjects.nodes) || [];

    const filtered = all.filter(function(node) {
      var activeField = node.fields.find(function(f) { return f.key === 'active'; });
      return activeField && activeField.value === filterActive;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reviews: filtered, total: filtered.length }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
