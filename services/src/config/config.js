const DEFAULT_ENV = {
  SLEEP_TIME: 10000
}

module.exports = {
  DEFAULT_ENV
}


// ** PLEASE MAKE SURE EVERY VM HAVE NODE_ENV, TRY echo $NODE_ENV CAN CHECK VALUE

// 10.240.40.171 Staging Databricks
// 10.240.40.172 Staging Redshift
// 10.240.40.173 Staging Bigquery
// 10.240.40.174 Staging Bigquery-2 (BQ-CLEAN)
// 10.240.40.182 Staging SnowFlake

// 10.240.40.165 Databricks
// 10.240.40.166 Redshift 
// 10.240.40.167 Bigquery
// 10.240.40.170 Bigquery-2 (BQ-CLEAN)
// 10.240.40.181 SnowFlake

// 10.240.40.168 Testing/Dev

// More detail: https://docs.google.com/spreadsheets/d/1ami6PpS-WvXpc-ozMOOosvC53IkdVEWixzpgbSXA2-0/edit#gid=0

// when you patch to vm please make sure if you see account.patch file, apply it for different account.
