var mongodb = require('./db');

function Pic (pic) {
	this.pic = pic;
};

module.exports = Pic;

//保存上传的图片
Pic.prototype.save = function (callback) {
	var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
	    date: date,
	    year : date.getFullYear(),
	    month : date.getFullYear() + "-" + (date.getMonth() + 1),
	    day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
	    minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
	    date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
	};
	var arrPic = this.pic;
	//要存入数据库的文档
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		};
		//读取 pics 集合
		db.collection('pics', function (err, collection) {
		  	if (err) {
		    	mongodb.close();
		    	return callback(err);
		  	};
		  //将文档插入 pics 集合
		  	for (var i = 0; i < arrPic.length; i++) {
		  		console.log(arrPic[i].pic+ ',' + i);
		  		collection.insert(arrPic[i], {safe: true}, function (err) {
		  			//mongodb.close();
			  	  	if (err) {
			  	    		return callback(err);//失败！返回 err
			  	  	};
			  	  	callback(null);//返回 err 为 null
		  		});
		  		
		  	};
		  	
		});
		mongodb.close()
	});
};
Pic.getTen = function (name, page, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		};
		//连接pics集合
		db.collection('pics', function (err, collection) {
			if (err) {
				return callback(err);
			};
			var query = {};
			if (name) {
				query.name = name;
			}
			//使用 count 返回特定查询的文档数 total
			collection.count(query, function (err, total) {
			  //根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
			    collection.find(query, {
			        skip: (page - 1)*10,
			        limit: 10
			    }).sort({
			        time: -1
			    }).toArray(function (err, imgs) {
			        mongodb.close();
			        if (err) {
			            return callback(err);
			        }  
			        callback(null, imgs, total);
			    });
			});
		});

	});
};
