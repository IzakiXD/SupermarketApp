require('dotenv').config();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = process.env.PAYPAL_API;

async function getAccessToken() {
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization':
        'Basic ' +
        Buffer.from(
          `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();

  if (!data.access_token) {
    console.error('PAYPAL TOKEN ERROR:', data);
    throw new Error('Failed to get PayPal access token');
  }

  return data.access_token;
}

async function createOrder(amount, paymentID) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'SGD',
            value: Number(amount).toFixed(2)
          }
        }
      ],
      application_context: {
        brand_name: 'The Black Market',
        user_action: 'PAY_NOW',
        return_url: `http://localhost:3000/payment/paypal/success?paymentID=${paymentID}`,
        cancel_url: `http://localhost:3000/payment/paypal/cancel?paymentID=${paymentID}`
      }
    })
  });

  return await response.json();
}


async function captureOrder(orderId) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  return await response.json();
}

module.exports = { createOrder, captureOrder };
