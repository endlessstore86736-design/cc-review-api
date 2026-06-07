exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { product_id, customer_id, customer_name, rating, title, body, order_id } = JSON.parse(event.body);

    const mutation = `
      mutation {
        metaobjectCreate(metaobject: {
          type: "cc_review",
          fields: [
            { key: "product_id", value: "${product_id}" },
            { key: "customer_id", value: "${customer_id}" },
            { key: "customer_name", value: "${customer_name}" },
            { key: "rating", value: "${rating}" },
            { key: "title", value: "${title}" },
            { key: "body", value: "${body}" },
            { key: "order_id", value: "${order_id}" },
            { key: "status", value: "pending" },
            { key: "created_at", value: "${new Date().toISOString()}" }
          ]
        }) {
          metaobject { id handle }
          userErrors { field message }
        }
      }
    `;

    const response = await fetch(
      `https://colorcosmetic.myshopify.com/admin/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({ query: mutation }),
      }
    );

    const data = await response.json();
    const errors = data?.data?.metaobjectCreate?.userErrors;

    if (errors?.length > 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: errors[0].message }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
