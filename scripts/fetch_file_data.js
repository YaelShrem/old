const fs = require('fs');

module.exports = {
  fetchFileData: function(project_root_dir, file_name) {
    try {
      return fs.readFileSync(project_root_dir + "/user_files/" + file_name).toString().split("\r\n").filter(function(e) {
        return e
      });
    } catch (err) {
      console.log('Error Code: ', err.code);
      console.log('Error: ', err);
    }
  },
  fetchJsonData: function(project_root_dir, file_name) {
    try {
      return fs.readFileSync(project_root_dir + file_name).toString();
    } catch (err) {
      console.log('Error Code: ', err.code);
      console.log('Error: ', err);
    }
  }
};
