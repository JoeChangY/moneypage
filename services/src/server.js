const http = require('http');
const moneypageAgent = require('./automations/moneypage.js');
const common = require('../../utilities/common.js');


let busy = false;
let requestCount = 1;
const server = http.createServer(async(req, res) => {
  if (busy) {
    common.logToFile(`Server is busy, please try again later.`);
    processErrorResponse(res, { errorMessage: 'Server is busy, please try again later.' });
    return;
  }
  if (req.method != 'POST') {
    processMethodNotAllowed(res); 
    common.logToFile("Return Msg: Method not allowed");
    busy = true; 
    return;
  }
  
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
    common.logToFile(`Received http post data: ${body}`);
  });
  req.on('end', async () => {
    common.logToFile(`Starting to process http post data: ${body}`);
    const item = JSON.parse(body);
    item.questionId = item.resultOid
    common.logToFile(`Processing resultOid: ${item.resultOid}`);
    let resultResponse = { response: '', rawResponse: '', latency: 0 };
    // do selenium automation here.
    try {
      common.logToFile('Executing databricks automation.');
      resultResponse = await moneypageAgent.execute(item);
    } catch(error) {
      common.logToFile(`Response throws error: ${error}`);
      common.log(`check error response:${resultResponse}`)
      common.log(`check error response222:${res}`)

      processErrorResponse(res, resultResponse);
      busy = false;
      return;
    }
    if (resultResponse.isError) {
      processErrorResponse(res, resultResponse);
    }
    else {
      processResponse(res, resultResponse);
    }
    // common.logToFile("Response: " + JSON.stringify(resultResponse));
    requestCount++;
    busy = false;
  });
});

server.listen(3000, () => {
  common.log('Server running on port 3000');
});

processMethodNotAllowed = (res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Method not allowed' }));
}

processErrorResponse = (res, response) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response)); 
}

processResponse = (res, result) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
}
/*
const payload = {
  type: "Databricks" | "Redshift" | "BigQuery" | "Snowflake",
  resultOid: number,
  dbTables: string[],
  dbId: string,
  question: string,
  evidence: string,
  sql: string,
  difficulty: "Simple" | "Moderate" | "Challenging"
}

const response = {
  response: string,
  rawResponse: string,
  latency: number,
  foundTable: boolean
}

const errorResponse = {
  message: string
}

curl -X POST http://localhost:4000 -H 'Content-Type: application/json' -d '{ "type": "Databricks", "resultOid": 0, "dbId": "california_schools", "question": "What is the highest eligible free rate for K-12 students in the schools in Alameda County?", "evidence": "Eligible free rate for K-12 = `Free Meal Count (K-12)` / `Enrollment (K-12)`", "sql": "SELECT `Free Meal Count (K-12)` / `Enrollment (K-12)` FROM frpm WHERE `County Name` = 'Alameda' ORDER BY (CAST(`Free Meal Count (K-12)` AS REAL) / `Enrollment (K-12)`) DESC LIMIT 1", "dbTables": ["frpm"] }'
*/
