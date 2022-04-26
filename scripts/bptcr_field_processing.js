const fetchFileData = require('./fetch_file_data.js');

const fetchFieldsData = {
  bptcrFields: [],
  crInfo: [],
  versionTopics: [],
  tablesAndColumns: [],

  BptcrField: function(id, label, list, data) {
    this.id = id;
    this.label = label;
    this.list = list;
    this.data = data;
  },

  splitCrInfo: function(root_dir) {
    let jiraIntakes = new Set();
    let scrumMasters = new Set();
    let versions = new Set();
    let crNames = new Set();
    fetchFieldsData.crInfo = JSON.parse(fetchFileData.fetchJsonData(root_dir + "/user_files/", "cr_info.json"));
    fetchFieldsData.crInfo.forEach(function(record) {
      jiraIntakes.add(record.jiraIntake);
      scrumMasters.add(record.scrumMaster);
      crNames.add(record.crNumber + "-" + record.crDescription);
    });
    fetchFieldsData.bptcrFields.push(new fetchFieldsData.BptcrField("jiraIntakeID", "Jira-Intake", "jiraIntakeList", jiraIntakes));
    fetchFieldsData.bptcrFields.push(new fetchFieldsData.BptcrField("scrumMasterID", "Scrum Master", "scrumMasterList", scrumMasters));

    fetchFieldsData.bptcrFields.push(new fetchFieldsData.BptcrField("crNameID", "Change Request", "crNameList", crNames));
    fetchFieldsData.fetchUserNames(root_dir);

    fetchFieldsData.versionTopics.forEach(function(record) {
      versions.add(record.version);
    });
    fetchFieldsData.bptcrFields.push(new fetchFieldsData.BptcrField("versionID", "Version", "versionList", versions));

    let codeDrop = ["CD#1", "CD#1.5", "CD#2", "CD#2.5", "CD#3", "CD#3.5", "CD#4"];
    fetchFieldsData.bptcrFields.push(new fetchFieldsData.BptcrField("codeDropID", "Code Drop", "codeDropList", codeDrop));
  },

  fetchAllFieldsData: function(root_dir) {
    fetchFieldsData.fetchVersionTopics(root_dir);
    fetchFieldsData.fetchTablesAndColumns(root_dir);
    fetchFieldsData.splitCrInfo(root_dir);
    console.log("\nData 1 \n");

    let topics = fetchFileData.fetchFileData(root_dir, "topics.txt");
    fetchFieldsData.bptcrFields.push(new fetchFieldsData.BptcrField("topicID", "Topic", "topicList", topics));
    let targetEnvironments = ["TestingOnly","STOnly","ProductionOnly","PETOnly","Common"];
    //let targetEnvironments = fetchFileData.fetchFileData(root_dir, "target_environments.txt");
    console.log('Target Env\n',targetEnvironments,topics);
    fetchFieldsData.bptcrFields.push(new fetchFieldsData.BptcrField("targetEnvironmentID", "Target Environment", "targetEnvironmentList", targetEnvironments));
    console.log("\nData 2 \n");

    let tableNames = [];
    fetchFieldsData.tablesAndColumns.forEach(function(record) {
      tableNames.push(record.table_name);
    });
    fetchFieldsData.bptcrFields.push(new fetchFieldsData.BptcrField("tableNameID", "Table", "tableNameList", tableNames));
    console.log("\nData 3 \n");

    let applications = ["AR", "CSM", "BL", "MPS", "SC"];
    //let applications = fetchFileData.fetchFileData(root_dir, "applications.txt");
    fetchFieldsData.bptcrFields.push(new fetchFieldsData.BptcrField("applicationID", "Application", "applicationList", applications));

    let sqlQueryTypes = ["Insert", "Update", "Delete"];
    fetchFieldsData.bptcrFields.push(new fetchFieldsData.BptcrField("queryTypeID", "Sql Query Type", "queryTypeList", sqlQueryTypes));
  },

  fetchUserNames: function(root_dir) {
    let userNames = [];
    let userInfo = JSON.parse(fetchFileData.fetchJsonData(root_dir + "/user_files/" , "users.json"));
    userInfo.forEach(function(record) {
      userNames.push(record.FullName + " " + "(" + record.User + ")");
    });
    fetchFieldsData.bptcrFields.push(new fetchFieldsData.BptcrField("userNameID", "User", "userNameList", userNames));
  },

  fetchVersionTopics: function(root_dir) {
    fetchFieldsData.versionTopics = JSON.parse(fetchFileData.fetchJsonData(root_dir + "/user_files/" , "versions_bptcr_topics.json"));
  },

  fetchTablesAndColumns: function(root_dir) {
    fetchFieldsData.tablesAndColumns = JSON.parse(fetchFileData.fetchJsonData(root_dir + "/user_files/" , "all_table_columns.json"));
  }
};

module.exports = {
  fetchFieldsData
};
