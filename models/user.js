var mongodb = require('./db'),
	crypto = require('crypto'),
	async = require('async');

function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
	//要存入数据库的用户文档
	var md5 = crypto.createHash('md5'),
		email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
		head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=220",
		date = new Date(),
		time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
			date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()),
	//要存入数据库的用户信息文档
		user = {
			name: this.name,
			password: this.password,
			email: this.email,
			head: head,
			time: time,
			posts: 0
		};
	//打开数据库
	async.waterfall([
		function  (cb) {
			mongodb.open(function (err, db) {
				cb(err, db);
			});
		},
		function (db, cb) {
			db.collection('users', function (err, collection) {
				cb(err, collection)
			});
		},
		function (collection, cb) {
			collection.insert(user, {
				safe: true
			}, function (err, user) {
				cb(err, user);
			});
		}
	], function (err, user) {
		mongodb.close();
		callback(err, user[0]);
	});
};

//读取用户信息 通过用户名
User.get = function(name, callback) {
	//打开数据库
	//读取 users 集合
	async.waterfall([
		function  (cb) {
			mongodb.open(function (err, db) {
				cb(err, db);
			});
		},
		function (db, cb) {
			db.collection('users', function (err, collection) {
				cb(err, collection)
			});
		},
		function (collection, cb) {
			collection.findOne({
				'name': name
			}, function (err, user) {
				cb(err, user);
			});
		}
	], function (err, user) {
		mongodb.close();
		callback(err, user);
	});
};
//读取用户信息 通过邮箱
User.getByEmail = function (email, callback) {
	async.waterfall([
		function  (cb) {
			mongodb.open(function (err, db) {
				cb(err, db);
			});
		},
		function (db, cb) {
			db.collection('users', function (err, collection) {
				cb(err, collection)
			});
		},
		function (collection, cb) {
			collection.findOne({
				'email': email
			}, function (err, user) {
				cb(err, user);
			});
		}
	], function (err, user) {
		mongodb.close();
		callback(err, user);
	});
}
User.CheckNameEmail = function (name, email, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			mongodb.close();
			return callback(err);
		}
		db.collection('users', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne(
				{
					'name': name
				},
				function (err, user) {
					if (user) {
						mongodb.close();
						return callback(null, 'name');
					}
				}
			);
			collection.findOne(
				{
					'email': email
				},
				function (err, user) {
					mongodb.close();
					if (user) {
						return callback(null, 'email');
					} else {
						callback(err);
					}
				}
			)
		})
	})
}
//重置密码
User.resetPassword = function (name, password, callback) {
	//打开数据库
	//读取 users 集合
	async.waterfall([
		function  (cb) {
			mongodb.open(function (err, db) {
				cb(err, db);
			});
		},
		function (db, cb) {
			db.collection('users', function (err, collection) {
				cb(err, collection)
			});
		},
		function (collection, cb) {
			collection.update({
				'name': name
			},
			{
				$set: {
					'password': password
				}
			}, function (err, user) {
				cb(err, user);
			});
		}
	], function (err, user) {
		mongodb.close();
		callback(err, user);
	});
};
