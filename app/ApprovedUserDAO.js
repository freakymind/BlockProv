var approvedUser = require('./models/ApprovedUser')

var ApprovedUserDAO = {}

ApprovedUserDAO.getApprovedUserList = function(cb) {
	approvedUser.findOne(function(err, userListDoc){
		cb(err, userListDoc);
	});
} 

ApprovedUserDAO.addUsers = function(newUserList, cb) {
	approvedUser.findOne(function(err, userListDoc){
		if(err){
			cb(err, "find");
		} else {
			if(userListDoc) {
				userListDoc.userList = userListDoc.userList.concat(newUserList);
				userListDoc.save(function(error){
					cb(error, "save");
				});
			} else {
				var userListDocument = new approvedUser();
				userListDocument.userList = newUserList;
				userListDocument.save(function(error){
					cb(error, "save");
				});
			}
		}
	});
}

var differenceOfArrays = function(arr1, arr2, newUserList, cb) {
	console.log(arr1);
	console.log(arr2);
	var allAuthUsers = {};
	for (userIdx = 0; userIdx < arr1.length; userIdx++) {
		allAuthUsers[arr1[userIdx]] = true;
	}

	for (userIdx = 0; userIdx < arr2.length; userIdx++) {
		allAuthUsers[arr2[userIdx]] = false;
	}

	for (userIdx = 0; userIdx < arr1.length; userIdx++) {
		if(allAuthUsers[arr1[userIdx]]) {
			newUserList.push(arr1[userIdx]);
		}
	}
	console.log(allAuthUsers);
	cb(newUserList);
}

ApprovedUserDAO.removeUsers = function(unAuthUserList, cb) {
	approvedUser.findOne(function(err, userListDoc){
		var newUserList = [];
		if(err) {
			cb(err, "find")
		} else {
			differenceOfArrays(userListDoc.userList, unAuthUserList, newUserList, function(list){
				userListDoc.userList = list;
				userListDoc.save(function(err){
					cb(err, "save");
				});
			});
		}
	});
}

ApprovedUserDAO.checkAuthorised = function(emailid, cb) {
	approvedUser.findOne({userList:emailid},function(err, approvedUserDoc){
		cb(err, approvedUserDoc);
	});
}

module.exports = ApprovedUserDAO;