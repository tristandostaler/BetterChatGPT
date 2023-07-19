const fetch = require('node-fetch');
const axios = require('axios');

module.exports = async (req, res) => {
  console.log('Starting execution...')
  try {
    const payload = JSON.parse(req.payload)

    const type = payload["type"];

    if(type == "cse") {
      const query = payload["query"];
      console.log('query: ', query)

      const google_api_key =
        req.variables.GOOGLE_API_KEY ||
        console.log('GOOGLE_API_KEY variable not found. You can set it in Function settings.');
    
      const google_cse_id =
        req.variables.GOOGLE_CSE_ID ||
        console.log('GOOGLE_CSE_ID variable not found. You can set it in Function settings.');
    
      var fetch_res = await fetch(
          `https://www.googleapis.com/customsearch/v1?key=${google_api_key}&cx=${google_cse_id}&q=${encodeURIComponent(
            query
          )}`
        );
      
      console.log(fetch_res.status)
      
      if(fetch_res.status != 200) {
        res.json({message: "status not 200! "+ (await fetch_res.text())}, fetch_res.status)
      } else {
        var j = await fetch_res.json();
        // console.log(j)
        res.json(j, fetch_res.status)
      }
    } else if (type == "cors") {
      const url = payload["url"];
      const options = payload["options"];
      var axios_res;
      const config = { headers: options.headers }
      if(options.method == "GET") {
        axios_res = axios.get(url, config);
      } else if(options.method == "POST") {
        axios_res = axios.post(url, options.body, config);
      } else if(options.method == "PUT") {
        axios_res = axios.put(url, options.body, config);
      } else if(options.method == "PATCH") {
        axios_res = axios.patch(url, options.body, config);
      } else if(options.method == "DELETE") {
        axios_res = axios.delete(url, options.body);
      }

      axios_res.then(resp  => {
        res.json({message: resp.data}, resp.status);
      }).catch(error => {
        console.error(error.detail);
        res.json({message: "Error: " + error}, 500)
      })
    }else {
      res.json({message: "Invalid type!"}, 500)
    }
  } catch (error) {
    console.error(error.detail);
    res.json({message: "An error occured!"}, 500)
  }
};
