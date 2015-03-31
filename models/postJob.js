var ObjectID = require('mongodb').ObjectID,
	mongodb = require('./db'),
	markdown = require('markdown').markdown;

function PostJob(title,number, sex, age, salary,job) {
	this.title = title;
	this.number = number;
	this.sex = sex;
	this.age = age;
	this.salary = salary;
	this.job = job;
}

module.exports = PostJob;

//存储一篇文章及其相关信息
PostJob.prototype.save = function(callback) {
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
	var PostJob = {
		time: time,
		title: this.title,
		number: this.number,
		sex: this.sex,
		age: this.age,
		salary: this.salary,
		job: this.job,
		pv: 0
	};
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 jobs 集合
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//将文档插入 jobs 集合
			collection.insert(PostJob, {
				safe: true
			}, function (err) {
				mongodb.close();
				if (err) {
				 	return callback(err);//失败！返回 err
				}
				// db.collection('users', function(err, collect) {
				// 	if (err) {
				// 		mongodb.close();
				// 		return callback(err);
				// 	}
				// 	collect.update(
				// 		{
				// 			'name': PostJob.name
				// 		},
				// 		{
				// 			$inc: {'jobs': 1}
				// 		},
				// 		function (err) {
				// 			mongodb.close();
				// 			if (err) {
				// 				return callback(err);
				// 			}
				// 		}
				// 	);
				// })
				callback(null);//返回 err 为 null
			});
		});
	});
};

//一次获取十篇文章
PostJob.getTen = function(page, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 jobs 集合
		db.collection('jobs', function (err, collection) {
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
				}).toArray(function (err, docs) {
					mongodb.close();
					if (err) {
						return callback(err);
					}
					//解析 markdown 为 html
					// docs.forEach(function (doc) {
					// 	doc.PostJob = markdown.toHTML(doc.PostJob);
					// });
					callback(null, docs, total);
				});
			});
		});
	});
};
//获取一篇文章
PostJob.getOne = function(id, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 jobs 集合

		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//根据用户名、发表日期及文章名进行查询
			collection.findOne(
				{
					'_id': new ObjectID(id)
				},
				function (err, doc) {					
					if (err) {
						mongodb.close();
						return callback(err);
					}
					if (doc) {
					//每访问 1 次，pv 值增加 1
					collection.update(
						{
							'_id': new ObjectID(id)
						},
						{
							$inc: {"pv": 1}
						},
						function (err) {
							mongodb.close();
							if (err) {
								return callback(err);
							}
						}
					);
						
			//解析 markdown 为 html
						//doc.PostJob = markdown.toHTML(doc.PostJob);
						callback(null, doc);//返回查询的一篇文章						
					}
				}
			);
		});
	});
};
//返回原始发表的内容（markdown 格式）
PostJob.edit = function(id, callback) {  	
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 jobs 集合
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//根据用户名、发表日期及文章名进行查询
			collection.findOne({
				'_id': new ObjectID(id)
			}, function (err, doc) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, doc);//返回查询的一篇文章（markdown 格式）
			});
		});
	});
};
//更新一篇文章及其相关信息
PostJob.update = function(id, title, number, sex, age, salary, job, callback) {
	// var date = new Date(),
		// time = {
		// 	date: date,
		// 	year : date.getFullYear(),
		// 	month : date.getFullYear() + "-" + (date.getMonth() + 1),
		// 	day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		// 	minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
		// 	date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
		// };
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 jobs 集合
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//更新文章内容
			collection.update({
				"_id": new ObjectID(id)
			}, {
				$set: {
					title: title,
					number: number,
					sex: sex,
					age: age,
					salary: salary,
					job: job
				}
			}, function (err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};
//删除一篇文章
PostJob.remove = function(id, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
	//读取 jobs 集合
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
		//查询要删除的文档
			collection.findOne({
				"_id": new ObjectID(id)
			}, function (err, doc) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
			//删除转载来的文章所在的文档
				collection.remove(
					{
						"_id": new ObjectID(id)
					},
					{
						w: 1
					},
					function (err) {	
						mongodb.close();
						if (err) {
							return callback(err);
						}
						callback(null);
					}
				);
			});
		});
	});
};
//返回所有文章存档信息
PostJob.getArchive = function(callback) {
  //打开数据库
  mongodb.open(function (err, db) {
	if (err) {
	  return callback(err);
	}
	//读取 jobs 集合
	db.collection('jobs', function (err, collection) {
	  if (err) {
		mongodb.close();
		return callback(err);
	  }
	  //返回只包含 name、time、title 属性的文档组成的存档数组
	  collection.find({}, {
		"name": 1,
		"time": 1,
		"title": 1
	  }).sort({
		time: -1
	  }).toArray(function (err, docs) {
		mongodb.close();
		if (err) {
		  return callback(err);
		}
		callback(null, docs);
	  });
	});
  });
};
//返回所有标签
PostJob.getTags = function(callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
	  //distinct 用来找出给定键的所有不同值
			collection.distinct("tags", function (err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};
//返回含有特定标签的所有文章
PostJob.getTag = function(tag, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
	  //查询所有 tags 数组内包含 tag 的文档
	  //并返回只含有 name、time、title 组成的数组
			collection.find({
				"tags": tag
			}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function (err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};
//返回通过标题关键字查询的所有文章信息
PostJob.search = function(keyword, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var pattern = new RegExp("^.*" + keyword + ".*$", "i");
			collection.find({
				"title": pattern
			}, {
				"name": 1,
				"time": 1,
				"title": 1
			}).sort({
				time: -1
			}).toArray(function (err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
};
//转载一篇文章
PostJob.reprint = function(reprint_from, reprint_to, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
		//找到被转载的文章的原文档
			collection.findOne({
				'_id': new ObjectID(reprint_from.id)
			}, function (err, doc) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				var date = new Date();
				var time = {
					date: date,
					year : date.getFullYear(),
					month : date.getFullYear() + "-" + (date.getMonth() + 1),
					day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
					minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
					date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
				}

				delete doc._id;//注意要删掉原来的 _id

				doc.name = reprint_to.name;
				doc.head = reprint_to.head;
				doc.time = time;
				doc.title = (doc.title.search(/[转载]/) > -1) ? doc.title : doc.title + "<span>[转载]</span>";
				doc.comments = [];
				doc.reprint_info = {"reprint_from": reprint_from};
				doc.pv = 0;

				//将转载生成的副本修改后存入数据库，并返回存储后的文档
					collection.insert(doc, {
						safe: true
					}, function (err, PostJob) {						
						if (err) {
							mongodb.close();
							return callback(err);
						}
						//更新被转载的原文档的 reprint_info 内的 reprint_to
						collection.update({
							"name": reprint_from.name,
							"time.minute": reprint_from.minute,
							"title": reprint_from.title
						}, {
								$push: {
									"reprint_info.reprint_to": {
										"name": doc.name,
										"minute": time.minute,
										"title": doc.title,
										"id": PostJob[0]._id
									}
								}
							}, function (err) {
								mongodb.close();
								if (err) {									
									return callback(err);
								}
							}
						);						
						callback(err, PostJob[0]);
					});
			});
		});
	});
};
PostJob.getAll = function (name, callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			//根据用户名查出所以文章id
			collection.find(
				{
					'name': name
				},
				{
					'_id': 1,
					'title': 1,
					'time': 1
				}
			).sort(
				{
					time: -1
				}
			).toArray(function (err, arrayId) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, arrayId);
			});
		});
	});
};
