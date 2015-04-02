var ObjectID = require('mongodb').ObjectID,
	mongodb = require('./db');

function Message(name, email, message) {
	this.name = name;
	this.email = email;
	this.message = message;
}

module.exports = Message;

//存储一篇文章及其相关信息
Message.prototype.save = function(callback) {
	var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
		date: date,
		year : date.getFullYear(),
		month : date.getFullYear() + "-" + (date.getMonth() + 1),
		day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
		date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
	}
	//要存入数据库的文档
	var Message = {
		time: time,
		name: this.name,
		email: this.email,
		message: this.message
	};
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 jobs 集合
		db.collection('message', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//将文档插入 jobs 集合
			collection.insert(Message, {
				safe: true
			}, function (err) {
				mongodb.close();
				if (err) {
				 	return callback(err);//失败！返回 err
				}
				callback(null);//返回 err 为 null
			});
		});
	});
};

//一次获取十篇文章
Message.getTen = function(page, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 jobs 集合
		db.collection('message', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			//使用 count 返回特定查询的文档数 total
			collection.count(query, function (err, total) {
			//根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
				collection.find(query, {
					skip: (page - 1)*10,
					limit: 10
				}).sort({
					time: -1
				}).toArray(function (err, message) {
					mongodb.close();
					if (err) {
						return callback(err);
					}
					//解析 markdown 为 html
					// docs.forEach(function (doc) {
					// 	doc.Message = markdown.toHTML(doc.Message);
					// });
					callback(null, message, total);
				});
			});
		});
	});
};
//获取一篇文章
Message.getOne = function(id, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 message 集合

		db.collection('message', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//根据用户名、发表日期及文章名进行查询
			collection.findOne(
				{
					'_id': new ObjectID(id)
				},
				function (err, message) {
					mongodb.close();
					if (err) {						
						return callback(err);
					}
					callback(null, message);//返回查询的一篇文章						
				}
			);
		});
	});
};