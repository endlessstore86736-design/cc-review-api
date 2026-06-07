exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { id, action } = JSON.parse(event.body);

    if (action === 'delete') {
      const mutation = `
        mutation {
          metaobjectDelete(id: "${id}") {
            deletedId
            userErrors { field message }
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
          body: JSON.stringify({ query: mutation }),
        }
      );

      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) };
    }

    // approve
    const mutation = `
      mutation {
        metaobjectUpdate(
          id: "${id}"
          metaobject: {
            fields: [{ key: "active", value: "true" }]
          }
        ) {
          metaobject { id handle }
          userErrors { field message }
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
        body: JSON.stringify({ query: mutation }),
      }
    );

    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
