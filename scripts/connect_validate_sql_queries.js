let SSH2Promise = require('ssh2-promise');

const sqlQueryHeaders = ['Main Query', 'Validation Query', 'Rollback Query'];
const sqlQueryOnOffHeaders = ['Main On Mode Query', 'Validation On Mode Query', 'Rollback On Mode Query', 'Main Off Mode Query', 'Validation Off Mode Query', 'Rollback Off Mode Query'];

let sshconfig = {
  host: process.env.SSH_HOST,
  username: process.env.SSH_USERNAMES,
  password: process.env.SSH_PASSWORD
}

function singleLineSqlQueries(sqlQueries, toggleOnOffFound) {
  if (toggleOnOffFound) {
    this.MainOn = sqlQueries.mainOnModeQueryID.replace(/^[ \t]+/gm, " ").replace(/\r\n/g, ' ').replace(/'"'/g, '\"').replace(/"'"/g, "\'");
    this.ValidationOn = sqlQueries.validationOnModeQueryID.replace(/^[ \t]+/gm, " ").replace(/\r\n/g, ' ').replace(/'"'/g, '\"').replace(/"'"/g, "\'");
    this.RollbackOn = sqlQueries.rollbackOnModeQueryID.replace(/^[ \t]+/gm, " ").replace(/\r\n/g, ' ').replace(/'"'/g, '\"').replace(/"'"/g, "\'");
    this.MainOff = sqlQueries.mainOffModeQueryID.replace(/^[ \t]+/gm, " ").replace(/\r\n/g, ' ').replace(/'"'/g, '\"').replace(/"'"/g, "\'");
    this.ValidationOff = sqlQueries.validationOffModeQueryID.replace(/^[ \t]+/gm, " ").replace(/\r\n/g, ' ').replace(/'"'/g, '\"').replace(/"'"/g, "\'");
    this.RollbackOff = sqlQueries.rollbackOffModeQueryID.replace(/^[ \t]+/gm, " ").replace(/\r\n/g, ' ').replace(/'"'/g, '\"').replace(/"'"/g, "\'");
  } else {
    this.Main = sqlQueries.mainQueryID.replace(/^[ \t]+/gm, " ").replace(/\r\n/g, ' ').replace(/'"'/g, '\"').replace(/"'"/g, "\'");
    this.Validation = sqlQueries.validationQueryID.replace(/^[ \t]+/gm, " ").replace(/\r\n/g, ' ').replace(/'"'/g, '\"').replace(/"'"/g, "\'");
    this.Rollback = sqlQueries.rollbackQueryID.replace(/^[ \t]+/gm, " ").replace(/\r\n/g, ' ').replace(/'"'/g, '\"').replace(/"'"/g, "\'");
  }

}

function sqlQueryValidated(header, invalid, queryID, query, hidden, error) {
  this.header = header;
  this.invalid = invalid;
  this.queryID = queryID;
  this.query = query;
  this.hidden = hidden;
  this.error = error;
}

let ssh = new SSH2Promise(sshconfig);

function validateTableName(baseInfo, allSqlScripts) {
  let validatedData = [];
  const tableName = baseInfo.tableNameID;
  for (const sqlScript in allSqlScripts) {
    let dataObj = {};
    dataObj['status'] = 'fulfilled';
    if (!allSqlScripts[sqlScript].includes(tableName)) {
      dataObj['value'] = 'ERROR: Table name in SQL query do not match with the table name provided in basic information form.';
    } else {
      dataObj['value'] = '';
    }
    validatedData.push(dataObj);
  }
  return validatedData;
}

function validateDlServiceCodeAndSysUpdateDate(baseInfo, allTablesAndColumns, allSqlScripts) {
  let columnList = null;
  let validatedData = [];
  for (let record of allTablesAndColumns) {
    if (record.table_name === baseInfo.tableNameID) {
      columnList = record.column_names;
      break;
    }
  }
  console.log('columnList: ' + columnList);
  if (columnList) {
    for (const key in allSqlScripts) {
      let record = allSqlScripts[key].toUpperCase();
      let dataObj = {};
      dataObj['status'] = 'fulfilled';
      if (((!key.localeCompare('Main') || !key.localeCompare('MainOn') || !key.localeCompare('MainOff')) && !baseInfo.queryTypeID.localeCompare('Insert')) ||
        ((!key.localeCompare('Rollback') || !key.localeCompare('RollbackOn') || !key.localeCompare('RollbackOff')) && !baseInfo.queryTypeID.localeCompare('Delete'))) {
        if (columnList.includes('DL_SERVICE_CODE') && columnList.includes('SYS_UPDATE_DATE')) {
          if (!record.includes('DL_SERVICE_CODE') && !record.includes('SYS_UPDATE_DATE')) {
            dataObj['value'] = 'ERROR: DL_SERVICE_CODE and SYS_UPDATE_DATE fields are missing in SQL query.';
          } else if (!record.includes('DL_SERVICE_CODE')) {
            dataObj['value'] = 'ERROR: DL_SERVICE_CODE field is missing in SQL query.';
          } else if (!record.includes('SYS_UPDATE_DATE')) {
            dataObj['value'] = 'ERROR: SYS_UPDATE_DATE field is missing in SQL query.';
          } else {
            dataObj['value'] = '';
          }
        } else if (columnList.includes('DL_SERVICE_CODE') && !record.includes('DL_SERVICE_CODE')) {
          dataObj['value'] = 'ERROR: DL_SERVICE_CODE field is missing in SQL query.';
        } else if (columnList.includes('SYS_UPDATE_DATE') && !record.includes('SYS_UPDATE_DATE')) {
          dataObj['value'] = 'ERROR: SYS_UPDATE_DATE field is missing in SQL query.';
        } else {
          dataObj['value'] = '';
        }
      } else {
        dataObj['value'] = '';
      }
      validatedData.push(dataObj);
    }
  }
  console.log('In  ***************************');
  console.log(validatedData);
  console.log('***************************');
  return validatedData;
}

function validateBasicInfo(baseInfo, allTablesAndColumns, allSqlScripts) {
  let validatedData = null;
  validatedData = validateTableName(baseInfo, allSqlScripts);
  for (let i = 0; i < validatedData.length; i++) {
    if (validatedData[i].value.match(/^ERROR: /g)) {
      return validatedData;
    }
  }
  validatedData = validateDlServiceCodeAndSysUpdateDate(baseInfo, allTablesAndColumns, allSqlScripts);
  for (let i = 0; i < validatedData.length; i++) {
    if (validatedData[i].value.match(/^ERROR: /g)) {
      return validatedData;
    }
  }
  return validatedData;
}

function connectToDevsamlnx001() {
  return new Promise((resolve, reject) => {
    ssh.connect().then((results) => {
      console.log("Connection established");
      resolve('Connection established');
    }).catch((err) => {
      console.log('Connection failed: ' + err);
      reject('Connection failed: ' + err);
    })
  })
}

function validateQuery(sqlQuery) {
  let singleLineQuery = '"' + sqlQuery + '"';
  return new Promise((resolve, reject) => {
    console.log('sqlQuery: ' + singleLineQuery);
    let query_cmd = "/vstusr1/dev/csm/skaushi13/Dc/SCRIPTS/LB_BPTCR_CHECK/bptcr_sql_query_validation.sh " + singleLineQuery;
/*    let query_cmd = "/vstusr1/dev/csm/mmadhur1/DC/SCRIPTS/LB_BPTCR_CHECK/bptcr_sql_query_validation.sh " + singleLineQuery; */

    ssh.exec(query_cmd).then((data) => {
      console.log('validateQuery: ' + data);
      resolve(data);
    }).catch((err) => {
      console.log('Exec command failed: ' + err);
      reject('Exec command failed: ' + err);
    })
  })
}

function validateAllQueriesInParallel(allSqlScripts, toggleOnOffFound) {
  console.log('(((((((((((((((((( validateAllQueriesInParallel->allSqlScripts )))))))))))))))))) => ', allSqlScripts);
  return new Promise((resolve, reject) => {
    connectToDevsamlnx001().then((results) => {
      let promises = null;
      // const fileID = Math.floor((Math.random() * Math.pow(10,10)) + 1).toString();
      if (toggleOnOffFound) {
        const mainOnPromise = validateQuery(allSqlScripts.MainOn);
        const validationOnPromise = validateQuery(allSqlScripts.ValidationOn);
        const rollbackOnPromise = validateQuery(allSqlScripts.RollbackOn);
        const mainOffPromise = validateQuery(allSqlScripts.MainOff);
        const validationOffPromise = validateQuery(allSqlScripts.ValidationOff);
        const rollbackOffPromise = validateQuery(allSqlScripts.RollbackOff);
        promises = [mainOnPromise, validationOnPromise, rollbackOnPromise, mainOffPromise, validationOffPromise, rollbackOffPromise];
      } else {
        const mainPromise = validateQuery(allSqlScripts.Main);
        const validationPromise = validateQuery(allSqlScripts.Validation);
        const rollbackPromise = validateQuery(allSqlScripts.Rollback);
        promises = [mainPromise, validationPromise, rollbackPromise];
      }

      Promise.allSettled(promises).then((results) => {
        let allRejectReasons = '';
        console.log('((((((((((((((((((( results ))))))))))))))))))) => ', results);
        results.forEach((response) => {
          if (response.status === 'rejected') {
            allRejectReasons += response.reason;
          }
        });
        if (allRejectReasons) {
          reject(allRejectReasons);
        } else {
          resolve(results);
        }
      }).catch((err) => {
        reject(err)
      });
    }).catch((err) => {
      reject(err);
    })
  })
}

function fetchValidatedData(allSqlScripts, validatedData, toggleOnOffFound) {
  let index = 0;
  let sqlScriptValidatedData = [];
  console.log('************  allSqlScripts  ************');
  console.log(allSqlScripts);
  console.log('************  validatedData  ************');
  console.log(validatedData);
  for (let key in allSqlScripts) {
    let hidden = '';
    let invalid = '';
    let oraError = '';
    if (validatedData[index].status === 'fulfilled') {
      if (validatedData[index].value.match(/SP2-[0-9]+|ORA-[0-9]+/g) || validatedData[index].value.match(/^ERROR: /g)) {
        invalid = 'is-invalid';
        oraError = validatedData[index].value;
      } else {
        hidden = 'hidden';
      }
    } else {
      invalid = 'is-invalid';
      oraError = validatedData[index].reason;
    }
    if (toggleOnOffFound) {
      sqlScriptValidatedData.push(new sqlQueryValidated(sqlQueryOnOffHeaders[index], invalid, key, allSqlScripts[key], hidden, oraError));
    } else {
      sqlScriptValidatedData.push(new sqlQueryValidated(sqlQueryHeaders[index], invalid, key, allSqlScripts[key], hidden, oraError));
    }
    index++;
  }
  console.log('************  sqlScriptValidatedData  ************');
  console.log(sqlScriptValidatedData);
  return sqlScriptValidatedData;
}

module.exports = {
  singleLineSqlQueries,
  validateBasicInfo,
  connectToDevsamlnx001,
  validateQuery,
  validateAllQueriesInParallel,
  fetchValidatedData
}
