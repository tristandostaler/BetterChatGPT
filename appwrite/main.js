const fetch = require('node-fetch');
const axios = require('axios');

module.exports = async (req, res) => {
    const payload = JSON.parse(req.payload)

    const type = payload["type"];

    if(type == "cse") {
      const query = payload["query"];
      console.log("query: " + query)

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
      axios.get(url).then(resp  => {
        res.json({message: resp.data}, resp.status);
      }).catch(error => {
        res.json({message: "Error: " + error}, 500)
      })
    }else {
      res.json({message: "Invalid type!"}, 500)
    }
  };
