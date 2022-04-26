const handleJsonFile = require('edit-json-file');
let SSH2Promise = require('ssh2-promise');

let sshconfig = {
  host: 'devsamlnx001.unix.gsm1900.org',
  username: 'skaushi13',
  password: 'Temp123!'
}

let ssh = new SSH2Promise(sshconfig);

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

function createSwarm(allInfo) {
  return new Promise((resolve, reject) => {
    let inputs = allInfo.applicationID + ' ' + allInfo.versionID + ' ' + allInfo.topicID + ' ' + allInfo.targetEnvironmentID + ' ' +
      allInfo.tableNameID + ' ' + allInfo.jiraIntakeID + ' "' + allInfo.mainSqlQuery + '" "' + allInfo.validateSqlQuery + '" "' +
      allInfo.rollbackSqlQuery + ' "' + ' "' + allInfo.userNameID.split('(')[0] + '" "' + allInfo.scrumMasterID + '" "'   + allInfo.crNameID +' "';
      console.log('((((((((((((((((((  inputs  ))))))))))))))))))')
      console.log(inputs);
      let query_cmd = "/vstusr1/dev/csm/skaushi13/Dc/SCRIPTS/LB_BPTCR_CHECK/create_swarm_request.sh " + inputs;

    ssh.exec(query_cmd).then((data) => {
      console.log('Data: ' + data);
      let patternMatched = data.match(/change_list: <[0-9]+,.+>/g);
      if (patternMatched) {
        let changeListAndSqlFiles = patternMatched[0].split(/[ :,<>]+/).slice(1, 5);
        console.log(changeListAndSqlFiles);
        resolve(changeListAndSqlFiles);
      } else {
        let error_str = data.match(/Error:.+/g)[0];
        console.log('error_str: ' + error_str);
        reject(error_str);
      }
    }).catch((err) => {
      console.log('Failed to create swarm request: ' + err);
      reject('Failed to create swarm request: ' + err);
    })
  })
}

function saveBptcrInfoAndCreateSwarm(rootDir, baseInfoObj, sqlQuery, updateFile) {
  return new Promise((resolve, reject) => {
    let baseInfo = {
      ...baseInfoObj
    };
    baseInfo['status'] = 'New';
    baseInfo['mainSqlQuery'] = sqlQuery.Main;
    baseInfo['validateSqlQuery'] = sqlQuery.Validation;
    baseInfo['rollbackSqlQuery'] = sqlQuery.Rollback;
    connectToDevsamlnx001().then((results) => {
      createSwarm(baseInfo).then((result) => {
        try {
          baseInfoObj['status'] = 'New';
          baseInfoObj['changeList'] = result[0];
          baseInfoObj['sqlFiles'] = result.slice(1, 4).join();
          baseInfoObj['mainSqlQuery'] = sqlQuery.Main;
          baseInfoObj['validateSqlQuery'] = sqlQuery.Validation;
          baseInfoObj['rollbackSqlQuery'] = sqlQuery.Rollback;
          console.log(baseInfoObj);
          let fileHandle = handleJsonFile(rootDir + '/bptcr_db/bptcrs.json');
          fileHandle.options.stringify_width = 0;

          if (updateFile) {
            let fileContent = fileHandle.toObject().bptcrs;
            let changeList = baseInfo.changeList.split(/[<>]/)[2];
            for (let i = 0; i < fileContent.length; i++) {
              if(fileContent[i].changeList === changeList) {
                fileContent[i].codeDropID = baseInfoObj.codeDropID;
                fileContent[i].topicID = baseInfoObj.topicID;
                fileContent[i].targetEnvironmentID = baseInfoObj.targetEnvironmentID;
                fileContent[i].changeList = baseInfoObj.changeList;
                fileContent[i].sqlFiles = baseInfoObj.sqlFiles;
                fileContent[i].mainSqlQuery = baseInfoObj.mainSqlQuery;
                fileContent[i].validateSqlQuery = baseInfoObj.validateSqlQuery;
                fileContent[i].rollbackSqlQuery = baseInfoObj.rollbackSqlQuery;
                break;
              }
            }
          } else {
            fileHandle.append("bptcrs", baseInfoObj);
            // fs.writeFileSync(rootDir + '/bptcr_db/bptcrs.json', ',' + JSON.stringify(baseInfoObj), {
            //   flag: 'a'
            // })
          }
          fileHandle.save();
          resolve(result[0]);
        } catch (err) {
          console.log('ERROR: ', err);
          reject('Failed to save BPTCR. ERROR: ' + err);
        }
      }).catch((err) => {
        reject(err)
      });
    }).catch((err) => {
      reject(err);
    })
  });
}

function fetchDLServiceCode(baseInfo, allTablesAndColumns) {
  return new Promise((resolve, reject) => {
    let columnList = null;
    for (let record of allTablesAndColumns) {
      if (record.table_name === baseInfo.tableNameID) {
        columnList = record.column_names;
        break;
      }
    }
    if (columnList && columnList.includes('DL_SERVICE_CODE')) {
      connectToDevsamlnx001().then((results) => {
        let inputs = baseInfo.applicationID + ' ' + baseInfo.versionID + ' ' + baseInfo.topicID + ' ' + baseInfo.tableNameID + ' ' + baseInfo.jiraIntakeID;
        let query_cmd = "/vstusr1/dev/csm/skaushi13/DC/SCRIPTS/LB_BPTCR_CHECK/fetch_dl_service_code.sh " + inputs;
/*        let query_cmd = "/vstusr1/dev/csm/mmadhur1/DC/SCRIPTS/LB_BPTCR_CHECK/fetch_dl_service_code.sh " + inputs;  */

        ssh.exec(query_cmd).then((data) => {
          console.log('Data: ' + data);
          let patternMatched = data.match(/change_list: <[0-9]+>/g);
          if (patternMatched) {
            let changeList = patternMatched[0].split(/[ :,<>]+/)[1];
            console.log(changeList);
            resolve(changeList);
          } else {
            let error_str = data.match(/Error:.+/g)[0];
            console.log('error_str: ' + error_str);
            reject(error_str);
          }
        }).catch((err) => {
          console.log('Failed to fetch DL_SERVICE_CODE: ' + err);
          reject('Failed to fetch DL_SERVICE_CODE: ' + err);
        })
      }).catch((err) => {
        reject(err);
      })
    }
    else{
      resolve(false);
    }
  })
}

module.exports = {
  saveBptcrInfoAndCreateSwarm,
  fetchDLServiceCode
}
