const express = require("express");
const ejs = require("ejs");
const app = express();
app.set("view engine", "ejs");
app.get("/", (req, res) => res.render("index"));
const paypal = require("@paypal/checkout-server-sdk");
const { query, json } = require("express");
let clientId =
  "AaU8tQfmz1_MFDTKuf84yYERXvdDt2ZFJVrxhNW_49DazF4A_F0VBuKyV5_nntyEdZqUa5Oq9ZBj65GV";
let clientSecret =
  "EAZ8aFDU4lHHLy1bQqULYWqznf3dBknXZW3AH__zFC0bUs8AGUyR6RNbm-jHvqtikX7PsSqMO5vxuvKm";
// This sample uses SandboxEnvironment. In production, use LiveEnvironment
let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
let client = new paypal.core.PayPalHttpClient(environment);
function buildRequestBody() {
  return {
    intent: "CAPTURE",
    application_context: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      brand_name: "EXAMPLE INC",
      locale: "en-US",
      landing_page: "BILLING",
      shipping_preference: "SET_PROVIDED_ADDRESS",
      user_action: "CONTINUE",
    },
    purchase_units: [
      {
        reference_id: "PUHF",
        description: "Sporting Goods",

        custom_id: "CUST-HighFashions",
        soft_descriptor: "HighFashions",
        amount: {
          currency_code: "USD",
          value: "220.00",
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: "180.00",
            },
            shipping: {
              currency_code: "USD",
              value: "20.00",
            },
            handling: {
              currency_code: "USD",
              value: "10.00",
            },
            tax_total: {
              currency_code: "USD",
              value: "20.00",
            },
            shipping_discount: {
              currency_code: "USD",
              value: "10",
            },
          },
        },
        items: [
          {
            name: "T-Shirt",
            description: "Green XL",
            sku: "sku01",
            unit_amount: {
              currency_code: "USD",
              value: "90.00",
            },
            tax: {
              currency_code: "USD",
              value: "10.00",
            },
            quantity: "1",
            category: "PHYSICAL_GOODS",
          },
          {
            name: "Shoes",
            description: "Running, Size 10.5",
            sku: "sku02",
            unit_amount: {
              currency_code: "USD",
              value: "45.00",
            },
            tax: {
              currency_code: "USD",
              value: "5.00",
            },
            quantity: "2",
            category: "PHYSICAL_GOODS",
          },
        ],
        shipping: {
          method: "United States Postal Service",
          name: {
            full_name: "John Doe",
          },
          address: {
            address_line_1: "123 Townsend St",
            address_line_2: "Floor 6",
            admin_area_2: "San Francisco",
            admin_area_1: "CA",
            postal_code: "94107",
            country_code: "US",
          },
        },
      },
    ],
  };
}

app.post("/pay_with_paypal", (req, res) => {
  let request = new paypal.orders.OrdersCreateRequest();
  request.requestBody(buildRequestBody());

  let createOrder = async function () {
    try {
      let response = await client.execute(request);
      console.log("######Response of Payment Created######");
      console.log(JSON.stringify(response, null, 1));
      // console.log("Status Code: " + response.statusCode);
      // console.log("Status: " + response.result.status);
      // console.log("Order ID: " + response.result.id);
      // console.log("Intent: " + response.result.intent);
      // console.log("Links: ");
      response.result.links.forEach((item, index) => {
        let rel = item.rel;
        let href = item.href;
        let method = item.method;
        // let message = `${rel}: ${href} Call Type: ${method}`;
        // console.log(message);
        if (rel == "approve") {
          res.redirect(href);
        }
      });

      // console.log(
      //   `Gross Amount: ${response.result.purchase_units[0].amount.currency_code} ${response.result.purchase_units[0].amount.value}`
      // );
    } catch (error) {
      console.error(error);
    }
  };
  createOrder();
});

app.get("/success", (req, res) => {
  let orderId = req.query.token;

  let captureOrder = async function (orderId) {
    try {
      request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});
      // Call API with your client and get a response for your call
      let response = await client.execute(request);
      console.log("\n######Response of Payment Completed######");
      console.log(JSON.stringify(response, null, 1));
      // console.log("Status Code: " + response.statusCode);
      // console.log("Status: " + response.result.status);
      // console.log("Order ID: " + response.result.id);
      // console.log("Links: ");
      // response.result.links.forEach((item, index) => {
      //   let rel = item.rel;
      //   let href = item.href;
      //   let method = item.method;
      //   let message = `${rel}: ${href} Call Type: ${method}`;
      //   console.log(message);
      // });
      // console.log("Capture Ids:");

      // response.result.purchase_units.forEach((item, index) => {
      //   item.payments.captures.forEach((item, index) => {
      //     console.log(item.id);

      //   });
      // });
      res.send("Success");
    } catch (error) {
      console.error(error);
    }
  };

  captureOrder(orderId);
});
app.get("/cancel", (req, res) => res.send("Cancelled"));

app.listen(3000, () => console.log("Server Started"));
