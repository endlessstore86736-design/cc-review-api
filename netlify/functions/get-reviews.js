exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const status = event.queryStringParameters?.status || 'pending';
    const filterActive = status === 'approved' ? 'true' : 'false';

    const query = `
      {
        metaobjects(type: "cc_review", first: 50) {
          nodes {
            id
            handle
            fields { key value }
          }
        }
      }
    `;

    const res = await fetch(
      'https://colorcosmetic.myshopify.com/admin/api/2024-01/graphql.json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await res.json();
    const all = data?.data?.metaobjects?.nodes || [];

    const filtered = all.filter(node => {
      const activeField = node.fields.find(f => f.key === 'active');
      return activeField?.value === filterActive;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reviews: filtered }),
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
