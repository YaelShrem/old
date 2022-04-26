const fetchFileData = require('./fetch_file_data.js');
const onHoldTopics = ['PlaceHolder', 'OnOff', 'SecurityDB'];


function fetchBptcrHeaders() {
  const tableHeaders = ["Jira-Intake", "Scrum Master", "CR Name", "User Name", "Version", "Code Drop", "Topic", "Target Environment", "Table Name", "Application", "Query Type", "Status", "Change List", "Sql Files"];
  return tableHeaders;
}

function fetchAllBptcrData(root_dir) {
  let tableData = JSON.parse(fetchFileData.fetchJsonData(root_dir, 'bptcrs.json'));
  return tableData.bptcrs;
}


function fetchBptcrFooters() {
  const tableFooters = ["Jira-Intake", "Scrum Master", "CR Name", "User Name", "Version", "Code Drop", "Topic", "Target Environment", "Table Name", "Application", "Query Type", "Status", "Change List", "Sql Files"];
  return tableFooters;
}

function fetchOnHoldBptcrHeaders() {
  const tableHeaders = ["Jira-Intake", "Scrum Master", "CR Name", "User Name", "Version", "Code Drop", "Topic", "Target Environment", "Table Name", "Application", "Query Type", "Status", "Change List", "Sql Files"];
  return tableHeaders;
}

function fetchOnHoldBptcrData(root_dir) {
  let onHoldBptcrData = JSON.parse(fetchFileData.fetchJsonData(root_dir, 'bptcrs.json'));
  console.log(onHoldBptcrData.bptcrs);
  let tableData = onHoldBptcrData.bptcrs.filter(function(bptcr) {
    return onHoldTopics.includes(bptcr.topicID);
  });
  console.log(tableData);
  return tableData;
}

function fetchOnHoldBptcrsFooters() {
  const tableFooters = ["Jira-Intake", "Scrum Master", "CR Name", "User Name", "Version", "Code Drop", "Topic", "Target Environment", "Table Name", "Application", "Query Type", "Status", "Change List", "Sql Files"];
  return tableFooters;
}

module.exports = {
  fetchBptcrHeaders,
  fetchAllBptcrData,
  fetchBptcrFooters,
  fetchOnHoldBptcrHeaders,
  fetchOnHoldBptcrData,
  fetchOnHoldBptcrsFooters
}
