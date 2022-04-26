const sqlQueryHeaders = ['Main Query', 'Validation Query', 'Rollback Query'];
const sqlQueryOnOffHeaders = ['Main On Mode Query', 'Validation On Mode Query', 'Rollback On Mode Query', 'Main Off Mode Query', 'Validation Off Mode Query', 'Rollback Off Mode Query'];
const sqlQueryIDs = ['mainQueryID', 'validationQueryID', 'rollbackQueryID'];
const sqlQueryOnOffIDs = ['mainOnModeQueryID', 'validationOnModeQueryID', 'rollbackOnModeQueryID', 'mainOffModeQueryID', 'validationOffModeQueryID', 'rollbackOffModeQueryID'];

function sqlQueryStructure(header, queryID, query) {
  this.header = header;
  this.queryID = queryID;
  this.query = query;
}

function createSqlScripts(baseInfo, allTableColumns, allSqlScripts) {
  let loopCounter = 1;
  let sqlScripts = [];
  let sqlScriptsData = [];
  if (!allSqlScripts) {
    for (let record of allTableColumns) {
      if (record.table_name === baseInfo.tableNameID) {
        if (baseInfo.toggleOnOffFound) {
          loopCounter = 2;
        }
        for (let i = 0; i < loopCounter; i++) {
          if (baseInfo.queryTypeID === 'Insert') {
            // sqlScripts.push('INSERT INTO  ' + record.table_name + '\n(' + record.column_names.toLowerCase().replace(/,/g, ',&nbsp;&nbsp;') + ')\n' + '\nVALUES\n' + '( ' + ' );');
            sqlScripts.push('INSERT INTO  ' + record.table_name + ' (\n' + record.column_names.toLowerCase().replace(/,/g, ',\n') + '\n)' + '\nVALUES' + ' (\n\n' + ' );');
            sqlScripts.push('SELECT  *  FROM  ' + record.table_name + '\nWHERE  ;');
            sqlScripts.push('DELETE FROM  ' + record.table_name + '\nWHERE  ;');
          } else if (baseInfo.queryTypeID === 'Update') {
            sqlScripts.push('UPDATE  ' + record.table_name + '\nSET  ' + '\nWHERE  ;');
            sqlScripts.push('SELECT  *  FROM  ' + record.table_name + '\nWHERE  ;');
            sqlScripts.push('UPDATE  ' + record.table_name + '\nSET  ' + '\nWHERE  ;');
          } else if (baseInfo.queryTypeID === 'Delete') {
            sqlScripts.push('DELETE FROM  ' + record.table_name + '\nWHERE  ;');
            sqlScripts.push('SELECT  *  FROM  ' + record.table_name + '\nWHERE  ;');
            // sqlScripts.push('INSERT INTO  ' + record.table_name + '\n(' + record.column_names.toLowerCase().replace(/,/g, ',&nbsp;&nbsp;') + ')\n' + '\nVALUES\n' + '( ' + ' );');
            sqlScripts.push('INSERT INTO  ' + record.table_name + '\n(' + record.column_names.toLowerCase().replace(/,/g, ',\n') + ')\n' + '\nVALUES\n' + '( ' + ' );');
          }
        }
        if (baseInfo.toggleOnOffFound) {
          for (let i = 0; i < sqlScripts.length; i++) {
            sqlScriptsData.push(new sqlQueryStructure(sqlQueryOnOffHeaders[i], sqlQueryOnOffIDs[i], sqlScripts[i]));
          }
        } else {
          for (let i = 0; i < sqlScripts.length; i++) {
            sqlScriptsData.push(new sqlQueryStructure(sqlQueryHeaders[i], sqlQueryIDs[i], sqlScripts[i]));
          }
        }
        break;
      }
    }
  } else {
    sqlScriptsData.push(new sqlQueryStructure(sqlQueryHeaders[0], sqlQueryIDs[0], allSqlScripts.mainQueryID));
    sqlScriptsData.push(new sqlQueryStructure(sqlQueryHeaders[1], sqlQueryIDs[1], allSqlScripts.validationQueryID));
    sqlScriptsData.push(new sqlQueryStructure(sqlQueryHeaders[2], sqlQueryIDs[2], allSqlScripts.rollbackQueryID));
  }

  return sqlScriptsData;
}

module.exports = {
  sqlQueryStructure,
  createSqlScripts
};
