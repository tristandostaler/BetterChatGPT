const fetch2 = require('node-fetch');
const axios = require('axios');

module.exports = async ({ req, res }) => {
  console.log("Starting function");

  // console.log("req: ", req);
  // console.log("res", res);

  var payloadString = "";
  if (req.payload) {
    payloadString = req.payload;
  } else if (req.body) {
    payloadString = req.body;
  } else if (req.query) {
    payloadString = req.query;
  } else {
    return res.json({ message: "No payload found!" }, 400)
  }

  // console.log('payloadString: ', payloadString)

  try {
    const payload = JSON.parse(payloadString)

    const type = payload["type"];

    if (type == "cse") {
      const query = payload["query"];
      console.log('query: ', query)

      // console.log(process.env.GOOGLE_API_KEY)

      const google_api_key =
        process.env.GOOGLE_API_KEY ||
        console.log('GOOGLE_API_KEY variable not found. You can set it in Function settings.');

      const google_cse_id =
        process.env.GOOGLE_CSE_ID ||
        console.log('GOOGLE_CSE_ID variable not found. You can set it in Function settings.');

      var fetch_res = await fetch2(
        `https://www.googleapis.com/customsearch/v1?key=${google_api_key}&cx=${google_cse_id}&q=${encodeURIComponent(
          query
        )}`
      );

      // console.log('fetch_res: ', fetch_res)

      if (fetch_res.status != 200) {
        return res.json({ message: "status not 200! " + (await fetch_res.text()) }, fetch_res.status)
      } else {
        var j = await fetch_res.json();
        // console.log(j)
        return res.json(j, fetch_res.status)
      }
    } else if (type == "cors") {
      const url = payload["url"];
      const options = payload["options"];
      var axios_res;
      const config = { headers: options.headers }
      if (options.method == "GET") {
        axios_res = axios.get(url, config).catch(error => {
          return res.json({ message: "Error: " + error }, 400)
        });
      } else if (options.method == "POST") {
        axios_res = axios.post(url, options.body, config).catch(error => {
          return res.json({ message: "Error: " + error }, 400)
        });
      } else if (options.method == "PUT") {
        axios_res = axios.put(url, options.body, config).catch(error => {
          return res.json({ message: "Error: " + error }, 400)
        });
      } else if (options.method == "PATCH") {
        axios_res = axios.patch(url, options.body, config).catch(error => {
          return res.json({ message: "Error: " + error }, 400)
        });
      } else if (options.method == "DELETE") {
        axios_res = axios.delete(url, options.body).catch(error => {
          return res.json({ message: "Error: " + error }, 400)
        });
      }

      axios_res.then(resp => {
        return res.json({ message: resp.data }, resp.status);
      }).catch(error => {
        return res.json({ message: "Error: " + error }, 400)
      })
    } else {
      return res.json({ message: "Invalid type!" }, 400)
    }
  } catch (error) {
    console.log('error: ', error)
    return res.json({ message: "An error occured!" }, 400)
  }
};
