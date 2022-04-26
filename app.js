const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();

const PORT=process.env.PORT || 5000;
const app = express();

const fetchBptcrData = require('./scripts/bptcr_field_processing.js');
const createSqlQueryScripts = require('./scripts/create_sql_query.js');
const validateSqlQuery = require('./scripts/connect_validate_sql_queries.js');
const swarmRequest = require('./scripts/create_swarm_request.js');
const fetchAllBptcrs = require('./scripts/fetch_bptcr_data.js');
const fetchFileData = require('./scripts/fetch_file_data.js');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));


let dataFetched = false;
let dl_service_counter = 0;
let appTopics = ['APP_ARDB', 'APP_BLDB', 'APP_CustDB', 'APP_SCDB', 'APP_USGDB', 'PostProd_App', 'CleanUpDB'];
let refTopics = ['PostProd_Ref', 'REFDB_PostPP', 'REFDB_PrePP'];
let topicsNotChecked = ['OnOff', 'PlaceHolder', 'SecurityDB'];

app.get('/', function(req, res) {
  if (!dataFetched) {
    fetchBptcrData.fetchFieldsData.fetchAllFieldsData(__dirname);
    // dl_service_counter = fetchFileData.fetchFileData(__dirname, 'dl_service_code_counter.txt');
    dataFetched = true;
  }
  res.render('main_page');
});

app.get('/create_new_bptcr', function(req, res) {

  console.log('ABCD');

  if (!dataFetched) {
    fetchBptcrData.fetchFieldsData.fetchAllFieldsData(__dirname);
    dataFetched = true;
  }
  res.render('create_new_bptcr', {
    ejsData: fetchBptcrData.fetchFieldsData.bptcrFields,
    ejsCrSmInfo: fetchBptcrData.fetchFieldsData.crInfo
  });
});

app.get('/create_sql_scripts', function(req, res) {
  // console.log(req.headers.referer);
  res.redirect('/create_new_bptcr');
});

app.get('/create_sql_scripts_validated', function(req, res) {
  res.redirect('/create_new_bptcr');
});

app.get('/api/all_table_columns', function(req, res) {
  res.sendFile(__dirname + '/user_files/all_table_columns.json');
});

app.get('/api/cr_information', function(req, res) {
  res.sendFile(__dirname + '/user_files/cr_info.json');
});

app.get('/api/bptcr_topics', function(req, res) {
  res.sendFile(__dirname + '/user_files/versions_bptcr_topics.json');
});

app.get('/api/versions', function(req, res) {
  res.sendFile(__dirname + '/user_files/versions.json');
});

app.get('/api/all_bptcrs', function(req, res) {
  res.sendFile(__dirname + '/bptcr_db/bptcrs.json');
});

app.get('/api/bptcr_topics/:version', function(req, res) {
  let output = '<pre style="word-wrap: break-word; white-space: pre-wrap;font-size:16px;"> No topics found for version ' + req.params.version + '</pre>'
  if (!dataFetched) {
    fetchBptcrData.fetchFieldsData.fetchVersionTopics(__dirname);
  }
  for (let i = 0; i < fetchBptcrData.fetchFieldsData.versionTopics.length; i++) {
    if (!fetchBptcrData.fetchFieldsData.versionTopics[i].version.localeCompare(req.params.version)) {
      output = fetchBptcrData.fetchFieldsData.versionTopics[i];
      break;
    }
  }
  res.send(output);
});

app.get('/api/:tableName/columns', function(req, res) {
  let output = '<pre style="word-wrap: break-word; white-space: pre-wrap;font-size:16px;"> No columns found for table "' + req.params.tableName + '"</pre>'
  let tableName = req.params.tableName.toUpperCase();
  if (!dataFetched) {
    fetchBptcrData.fetchFieldsData.fetchTablesAndColumns(__dirname);
  }
  for (let i = 0; i < fetchBptcrData.fetchFieldsData.tablesAndColumns.length; i++) {
    if (!fetchBptcrData.fetchFieldsData.tablesAndColumns[i].table_name.localeCompare(tableName)) {
      output = fetchBptcrData.fetchFieldsData.tablesAndColumns[i];
      break;
    }
  }
  res.send(output);
});

app.get('/update_and_create_existing_bptcr', function(req, res) {
  console.log('Sushant Kaushik \n');
  res.render('update_and_create_existing_bptcr', {
    ejsTableHeaders: fetchAllBptcrs.fetchOnHoldBptcrHeaders(),
    ejsTableData: fetchAllBptcrs.fetchOnHoldBptcrData(__dirname + '/bptcr_db/'),
    ejsTableFooters: fetchAllBptcrs.fetchOnHoldBptcrsFooters()
  });
});

app.get('/update_and_create_sql_scripts_validated', function(req, res) {
  res.redirect('/update_and_create_existing_bptcr');
});

app.get('/fetch_existing_bptcrs', function(req, res) {
  res.render('fetch_existing_bptcrs', {
    ejsTableHeaders: fetchAllBptcrs.fetchBptcrHeaders(),
    ejsTableData: fetchAllBptcrs.fetchAllBptcrData(__dirname + '/bptcr_db/'),
    ejsTableFooters: fetchAllBptcrs.fetchBptcrFooters()
  });
});

// app.get('/session/destroy', function(req, res) {
//   console.log('Session Destroyed.');
//   req.session.destroy();
//   res.status(200).send('ok');
// });

app.post('/create_sql_scripts', function(req, res) {
  req.session.sqlQueryBaseInfo = JSON.parse(JSON.stringify(req.body));

  if (req.session.sqlQueryBaseInfo.tableNameID === 'TOGGLE_ON_OFF' && req.session.sqlQueryBaseInfo.queryTypeID === 'Insert') {
    req.session.sqlQueryBaseInfo['toggleOnOffFound'] = true;
  }
  req.session.sqlQueryBaseInfo['toggleOnOffFound'] = false;
  // console.log('(((((((((((( req.session.sqlQueryBaseInfo )))))))))))) => ', req.session.sqlQueryBaseInfo);
  // swarmRequest.fetchDLServiceCode(req.session.sqlQueryBaseInfo, fetchBptcrData.fetchFieldsData.tablesAndColumns).then((result) => {
  //   if (result) {
  //     req.session.sqlQueryBaseInfo['changeList'] = result;
  //   }
  //   let sqlScriptsData = createSqlQueryScripts.createSqlScripts(req.session.sqlQueryBaseInfo, fetchBptcrData.fetchFieldsData.tablesAndColumns, null);
  //   console.log('(((((((((((( sqlScriptsData )))))))))))) => ', sqlScriptsData);
  //   res.render('create_sql_scripts', {
  //     ejsDLServiceCode: req.session.sqlQueryBaseInfo.changeList,
  //     ejsSqlQueryData: sqlScriptsData
  //   });
  // }).catch((err) => res.render('bptcr_submission_failed', {
  //   ejsError: err
  // }));

  let sqlScriptsData = createSqlQueryScripts.createSqlScripts(req.session.sqlQueryBaseInfo, fetchBptcrData.fetchFieldsData.tablesAndColumns, null);
  console.log('(((((((((((( sqlScriptsData )))))))))))) => ', sqlScriptsData);
  res.render('create_sql_scripts', {
    ejsSqlQueryData: sqlScriptsData
  });
});

app.post('/create_sql_scripts_validated', function(req, res) {
  console.log('(((((((((((( req.body )))))))))))) => ', req.body);
  let allSqlScripts = new validateSqlQuery.singleLineSqlQueries(req.body, req.session.sqlQueryBaseInfo.toggleOnOffFound);
  console.log('(((((((((((( allSqlScripts )))))))))))) => ', allSqlScripts);
  let validatedBasicInfoData = validateSqlQuery.validateBasicInfo(req.session.sqlQueryBaseInfo, fetchBptcrData.fetchFieldsData.tablesAndColumns, allSqlScripts);
  let validatedData = validateSqlQuery.fetchValidatedData(req.body, validatedBasicInfoData, req.session.sqlQueryBaseInfo.toggleOnOffFound);
  for (let i = 0; i < validatedData.length; i++) {
    if (validatedData[i].error) {
      res.render('create_sql_scripts_validated', {
        ejsSqlQueryData: validatedData
      });
      return;
    }
  }

  validateSqlQuery.validateAllQueriesInParallel(allSqlScripts, req.session.sqlQueryBaseInfo.toggleOnOffFound).then((results) => {
    let validatedData = validateSqlQuery.fetchValidatedData(req.body, results, req.session.sqlQueryBaseInfo.toggleOnOffFound);
    for (let i = 0; i < validatedData.length; i++) {
      if (validatedData[i].error) {
        res.render('create_sql_scripts_validated', {
          ejsSqlQueryData: validatedData
        });
        return;
      }
    }
    swarmRequest.saveBptcrInfoAndCreateSwarm(__dirname, req.session.sqlQueryBaseInfo, allSqlScripts, false).then((result) =>
      res.render('bptcr_submission_successful', {
        ejsChangeList: result
      })
    ).catch((err) => res.render('bptcr_submission_failed', {
      ejsError: err
    }))
  }).catch((err) => res.render('bptcr_submission_failed', {
    ejsError: err
  }))
});

app.post('/update_and_create_existing_bptcr', function(req, res) {
  req.session.sqlQueryBaseInfo = JSON.parse(JSON.stringify(req.body));
  let db_area = 'app';
  let codeDrops = ["CD#1", "CD#1.5", "CD#2", "CD#2.5", "CD#3", "CD#3.5", "CD#4"];
  let topics = appTopics;
  if (!dataFetched) {
    fetchBptcrData.fetchFieldsData.fetchTablesAndColumns(__dirname);
  }
console.log(fetchBptcrData.fetchFieldsData.tablesAndColumns.length);

console.log("Sushant Kuashik\n");
  for (let i = 0; i < fetchBptcrData.fetchFieldsData.tablesAndColumns.length; i++) {
    if (!fetchBptcrData.fetchFieldsData.tablesAndColumns[i].table_name.localeCompare(req.body.tableNameID)) {
      db_area = fetchBptcrData.fetchFieldsData.tablesAndColumns[i].db_area.substring(0, 3);
      break;
    }
  }
  if (db_area === 'ref') {
    topics = refTopics;
  }
  let targetEnvironments = ["TestingOnly","STOnly","ProductionOnly","PETOnly","Common"];
  /*let targetEnvironments = fetchFileData.fetchFileData(__dirname, 'target_environments.txt');*/
  //console.log('The Values ',targetEnvironments ,CodeDrops);
  //console.log('The Code Drops ',targetEnvironments);

  let sqlScriptsData = createSqlQueryScripts.createSqlScripts(null, null, req.body);
  res.render('update_and_create_sql_scripts', {
    ejsCodeDrops: codeDrops,
    ejsTopics: topics,
    ejsTargetEnvironment: targetEnvironments,
    ejsSqlQueryData: sqlScriptsData
  });
});

app.post('/update_and_create_sql_scripts_validated', function(req, res) {
  let db_area = 'app';
  let codeDrops = ["CD#1", "CD#1.5", "CD#2", "CD#2.5", "CD#3", "CD#3.5", "CD#4"];
  let topics = appTopics;
  console.log("I am Here\n");
  if (!dataFetched) {
    fetchBptcrData.fetchFieldsData.fetchTablesAndColumns(__dirname);
  }
  for (let i = 0; i < fetchBptcrData.fetchFieldsData.tablesAndColumns.length; i++) {
    if (!fetchBptcrData.fetchFieldsData.tablesAndColumns[i].table_name.localeCompare(req.body.tableNameID)) {
      db_area = fetchBptcrData.fetchFieldsData.tablesAndColumns[i].db_area.substring(0, 3);
      break;
    }
  }
  if (db_area === 'ref') {
    topics = refTopics;
  }

  var targetEnvironments = ["TestingOnly","STOnly","ProductionOnly","PETOnly","Common"];
  /*let targetEnvironments = fetchFileData.fetchFileData(__dirname, 'target_environments.txt');*/
  //console.log('The Values ',targetEnvironments ,CodeDrops);
  let sqlScripts = {};
  sqlScripts['mainQueryID'] = req.body.mainQueryID;
  sqlScripts['validationQueryID'] = req.body.validationQueryID;
  sqlScripts['rollbackQueryID'] = req.body.rollbackQueryID;
  let allSqlScripts = new validateSqlQuery.singleLineSqlQueries(sqlScripts, req.session.sqlQueryBaseInfo.toggleOnOffFound);
  let validatedBasicInfoData = validateSqlQuery.validateBasicInfo(req.session.sqlQueryBaseInfo, fetchBptcrData.fetchFieldsData.tablesAndColumns, allSqlScripts);
  let validatedData = validateSqlQuery.fetchValidatedData(allSqlScripts, validatedBasicInfoData, req.session.sqlQueryBaseInfo.toggleOnOffFound);
  for (let i = 0; i < validatedData.length; i++) {
    if (validatedData[i].error) {
      res.render('update_and_create_sql_scripts_validated', {
        ejsCurrentCodeDrop: req.body.codeDropID,
        ejsCurrentTopic: req.body.topicID,
        ejsCurrentTargetEnvironment: req.body.targetEnvironmentID,
        ejsCodeDrops: codeDrops,
        ejsTopics: topics,
        ejsTargetEnvironment: targetEnvironments,
        ejsSqlQueryData: validatedData
      });
      return;
    }
  }
  validateSqlQuery.validateAllQueriesInParallel(allSqlScripts, req.session.sqlQueryBaseInfo.toggleOnOffFound).then((results) => {
    let validatedData = validateSqlQuery.fetchValidatedData(sqlScripts, results, req.session.sqlQueryBaseInfo.toggleOnOffFound);
    for (let i = 0; i < validatedData.length; i++) {
      if (validatedData[i].error) {
        res.render('update_and_create_sql_scripts_validated', {
          ejsCurrentCodeDrop: req.body.codeDropID,
          ejsCurrentTopic: req.body.topicID,
          ejsCurrentTargetEnvironment: req.body.targetEnvironmentID,
          ejsCodeDrops: codeDrops,
          ejsTopics: topics,
          ejsTargetEnvironment: targetEnvironments,
          ejsSqlQueryData: validatedData
        });
        return;
      }
    }
    req.session.sqlQueryBaseInfo['codeDropID'] = req.body.codeDropID;
    req.session.sqlQueryBaseInfo['topicID'] = req.body.topicID;
    req.session.sqlQueryBaseInfo['targetEnvironmentID'] = req.body.targetEnvironmentID;
    swarmRequest.saveBptcrInfoAndCreateSwarm(__dirname, req.session.sqlQueryBaseInfo, allSqlScripts, true).then((result) =>
      res.render('bptcr_submission_successful', {
        ejsChangeList: result
      })
    ).catch((err) => res.render('bptcr_submission_failed', {
      ejsError: err
    }))
  }).catch((err) => res.render('bptcr_submission_failed', {
    ejsError: err
  }))
});

app.listen(PORT, ()=>
  console.log(`Server listening on port ${PORT}`));
