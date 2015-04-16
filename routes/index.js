
/*
 * GET home page.
 */
var crypto = require('crypto'),
	fs = require('fs'),
	User = require('../models/user.js'),
	PostNew = require('../models/post.js'),
	PostJob = require('../models/postJob.js'),
	Pic = require('../models/pic.js'),
	Message = require('../models/message.js'),
	Email = require('../models/email.js'),
	markdown = require('markdown').markdown,
	passport = require('passport');
module.exports = function (app) {

	app.get('/', function (req, res) {
		res.render('index', {
			user: req.session.user,
			title: '陕西帝奥电梯-中国一线电梯品牌领跑者',
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	// //注册
	// app.get('/reg', function (req, res) {
	// 	res.render('reg', {
	// 		title: '注册',
	// 		user: req.session.user,
	// 		success: req.flash('success').toString(),
	// 		error: req.flash('error').toString()});
	// });
	// app.post('/reg', checkNotLogin);
	// app.post('/reg', function (req, res) {
	// 	var name = req.body.userName,
	// 		password = req.body.password,
	// 		md5 = crypto.createHash('md5'),
	// 		reg = /`|~|!|#|\$|%|\^|\*|\(|\-|\)|\+|_|=|\/|\||\\|。|，|》|《|>|<|！/;
	// 	password = md5.update(req.body.password).digest('hex');
	// 	if (reg.test(name)) {
	// 		req.flash('error', '用户名不包含非法字符');
	// 		return res.redirect('/reg');
	// 	}
	// 	if (name.length > 20 || name.length === 0) {
	// 		req.flash('error', '用户名过长');
	// 		return res.redirect('/reg');
	// 	}
	// 	var newUser = new User({
	// 		name: name,
	// 		password: password,
	// 		email: '838186163@qq.com'
	// 	});
	// 	//检查用户名与邮箱是否已经存在
	// 	User.get(newUser.name, function (err, user) {
	// 		if (user) {
	// 			req.flash('error', '用户名已存在');
	// 			return res.redirect('/');
	// 		}
	// 		//如果不存在则新增用户
	// 		newUser.save(function (err, user) {
	// 			if (err) {
	// 				req.flash('error', '系统忙');
	// 				return res.redirect('/');
	// 			}
	// 			req.session.user = user;//用户信息存入 session
	// 			req.flash('success', '注册成功！');
	// 			return res.redirect('/user_center');
	// 		});
	// 	});
	// });
	//关于我们
	app.get('/about_us', function (req, res) {
		res.render('about_us', {
			title: '关于我们|陕西帝奥电梯|中国一线电梯品牌领跑者',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//发布新闻
	app.get('/post_new', checkLogin);
	app.get('/post_new', function (req, res) {
		res.render('post_new', {
			title: '发布',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/post_new', checkLogin);
	app.post('/post_new', function (req, res) {
		var post = new PostNew(req.body.newtitle, req.body.newcontent);
		post.save(function (err) {
			if (err) {
				req.flash('error', '发布失败');
				return res.redirect('/post_new');
			}
			req.flash('success', '发布成功!');
			res.redirect('/manager_new');
		});
	});
	//普通用户新闻中心
	app.get('/new_center', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		//查询并返回第 page 页的 10 篇文章
		PostNew.getTen(page, function (err, news, total) {
			if (err) {
				news = [];
			}
			res.render('new_center', {
				title: '新闻中心|陕西帝奥电梯|中国一线电梯品牌领跑者',
				news: news,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + news.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//管理员后台新闻中心
	app.get('/manager_new', checkLogin);
	app.get('/manager_new', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		//查询并返回第 page 页的 10 篇文章
		PostNew.getTen(page, function (err, news, total) {
			if (err) {
				news = [];
			}
			res.render('manager_new', {
				title: '新闻中心|陕西帝奥电梯|中国一线电梯品牌领跑者',
				news: news,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + news.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//新闻1
	app.get('/new/:id', function (req, res) {
		PostNew.getOne(req.params.id, function (err, onenew) {
			if (err) {
				req.flash('error', err);
				console.log(err);
				return res.redirect('/new_center');
			};
			res.render('new', {
				title: onenew.title,
				onenew: onenew,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	////编辑新闻 
	app.get('/editnew/:user/:id', checkLogin);
	app.get('/editnew/:user/:id', function (req, res) {
		if (req.session.user.name === req.params.user) {
			PostNew.edit(req.params.id, function (err, onenew) {
				if (err) {
					req.flash('error', err);
					console.log(err);
					return res.redirect('/manager_new');
				};
				res.render('edit_new', {
					title: onenew.title,
					onenew: onenew,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		} else {
			if (err) {
				req.flash('error', '没有权限');
				console.log(err);
				return res.redirect('/manager_new');
			};
		}

	});
	//编辑新闻 
	app.post('/editnew/:id', checkLogin);
	app.post('/editnew/:id', function (req, res) {
		PostNew.update(
			req.params.id,
			req.body.newtitle,
			req.body.newcontent, function (err) {
			if (err) {
				console.log('err');
				req.flash('error', err);
				return res.redirect('/manager_new');
			}
			req.flash('success', '修改成功!');
			return res.redirect('/manager_new');
		});
	});
	//删除新闻
	app.get('/deletenew/:user/:id', checkLogin);
	app.get('/deletenew/:user/:id', function(req, res) {
		if (req.session.user.name !== req.params.user) {
			req.flash('error', '权限不够');
			return res.redirect('manager_new');
		}
		PostNew.remove(req.params.id, function (err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', '删除成功!');
			res.redirect('manager_new');
		});
	});
	// //新闻2
	// app.get('/newtwo', function (req, res) {
	// 	res.render('newtwo', {
	// 		title: '省市领导对帝奥电梯项目的关心重视',
	// 		user: req.session.user,
	// 		success: req.flash('success').toString(),
	// 		error: req.flash('error').toString()
	// 	});
	// });
	// //新闻3
	// app.get('/newthree', function (req, res) {
	// 	res.render('newthree', {
	// 		title: '陕西帝奥电梯——中国一线电梯品牌领跑者',
	// 		user: req.session.user,
	// 		success: req.flash('success').toString(),
	// 		error: req.flash('error').toString()
	// 	});
	// });
	// //产品展示
	app.get('/product_show', function (req, res) {
		res.render('product_show', {
			title: '产品展示|陕西帝奥电梯|中国一线电梯品牌领跑者',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//案例展示
	app.get('/custom_case', function (req, res) {
		res.render('custom_case', {
			title: '客户案例展示|陕西帝奥电梯|中国一线电梯品牌领跑者',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//人力资源中心，普通用户
	app.get('/recruit', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		// 查询并返回第 page 页的 10 篇文章
		PostJob.getTen(page, function (err, jobs, total) {
			if (err) {
				jobs = [];
			}
			res.render('recruit', {
				title: '人力资源|陕西帝奥电梯|中国一线电梯品牌领跑者',
				jobs: jobs,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + jobs.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//人力资源中心，管理员
	app.get('/manager_job', checkLogin);
	app.get('/manager_job', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		// 查询并返回第 page 页的 10 篇文章
		PostJob.getTen(page, function (err, jobs, total) {
			if (err) {
				jobs = [];
			}
			res.render('manager_job', {
				title: '人力资源|陕西帝奥电梯|中国一线电梯品牌领跑者',
				jobs: jobs,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + jobs.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//发布职位
	app.get('/post_job', checkLogin);
	app.get('/post_job', function (req, res) {
		res.render('post_job', {
			title: '发布',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/post_job', checkLogin);
	app.post('/post_job', function (req, res) {
		var postJob = new PostJob(
			req.body.jobtitle, 
			req.body.jobnumber, 
			req.body.jobsex, 
			req.body.jobage, 
			req.body.jobsalary,
			req.body.jobcontent
		);
		postJob.save(function (err) {
			if (err) {
				req.flash('error', '发布失败');
				return res.redirect('/post_job');
			}
			req.flash('success', '发布成功!');
			res.redirect('/manager_job');
		});
	});
	app.get('/job/:id', function (req, res) {
		PostJob.getOne(req.params.id, function (err, job) {
			if (err) {
				req.flash('error', err);
				console.log(err);
				return res.redirect('/recruit');
			};
			res.render('job', {
				title: job.title,
				job: job,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	app.get('/editjob/:user/:id', checkLogin);
	app.get('/editjob/:user/:id', function (req, res) {
		if (req.session.user.name === req.params.user) {
			PostJob.getOne(req.params.id, function (err, job) {
				if (err) {
					req.flash('error', err);
					console.log(err);
					return res.redirect('/recruit');
				};
				res.render('edit_job', {
					title: job.title,
					job: job,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		} else {
			if (err) {
				req.flash('error', '没有权限');
				console.log(err);
				return res.redirect('/recruit');
			};
		}

	});
	//编辑职位
	app.post('/edit_job/:id', checkLogin);
	app.post('/edit_job/:id', function (req, res) {
		PostJob.update(
			req.params.id,
			req.body.jobtitle,
			req.body.jobnumber,
			req.body.jobsex,
			req.body.jobage,
			req.body.jobsalary,
			req.body.jobcontent, function (err) {
			if (err) {
				console.log('err');
				req.flash('error', err);
				return res.redirect('/manager_job');
			}
			req.flash('success', '修改成功!');
			return res.redirect('/manager_job');
		});
	});
	//删除职位
	app.get('/deletejob/:user/:id', checkLogin);
	app.get('/deletejob/:user/:id', function (req, res) {
		if (req.session.user.name !== req.params.user) {
			req.flash('error', '权限不够');
			return res.redirect('recruit');
		}
		console.log(32);
		PostJob.remove(req.params.id, function (err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', '删除成功!');
			res.redirect('recruit');
		});
	});
	//人力资源1
	app.get('/jobone', function (req, res) {
		res.render('jobone', {
			title: '业务员|陕西帝奥电梯',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//人力资源2
	app.get('/jobtwo', function (req, res) {
		res.render('jobtwo', {
			title: '行政文员|陕西帝奥电梯',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//联系我们
	app.get('/contact_us', function (req, res) {
		res.render('contact_us', {
			title: '联系我们|陕西帝奥电梯|中国一线电梯品牌领跑者',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	// //登录
	app.get('/login', checkNotLogin);
	app.get('/login', function (req, res) {
		res.render('login', {
			title: '登录',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()});
	});
	app.post('/login', checkNotLogin);
	app.post('/login', function (req, res) {
		//生成密码的 md5 值

		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
			//检查用户是否存在
		User.get(req.body.userName, function (err, user) {
			if (!user) {
				req.flash('error', '用户不存在!');
				return res.redirect('/login');
			}
			//检查密码是否一致
			if (user.password != password) {
				req.flash('error', '密码错误!'); 
				console.log('密码不正确');
				return res.redirect('/login');
			}
			//用户名密码都匹配后，将用户信息存入 session
			console.log('密码正确');
			req.session.user = user;
			req.flash('success', '登陆成功!');
			return res.redirect('/user_center');
		});
	});
	//发布新闻
	app.get('/post_new', checkLogin);
	app.get('/post_new', function (req, res) {
		res.render('post_new', {
			title: '发布',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	// app.post('/post', checkLogin);
	app.post('/post_new', function (req, res) {
		var post = new PostNew(req.body.newtitle, req.body.newcontent);
		post.save(function (err) {
			if (err) {
				req.flash('error', '发布失败');
				return res.redirect('/post_new');
			}
			req.flash('success', '发布成功!');
			res.render('new_center', {
				title: '新闻中心|陕西帝奥电梯|中国一线电梯品牌领跑者',
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//消息中心
	app.get('/leave_message', checkLogin);
	app.get('/leave_message', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		// 查询并返回第 page 页的 10 篇文章
		Message.getTen(page, function (err, messs, total) {
			if (err) {
				messs = [];
			}
			res.render('leave_message', {
				title: '人力资源|陕西帝奥电梯|中国一线电梯品牌领跑者',
				messs: messs,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + messs.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//上传一则消息
	app.post('/leave_message', function (req, res) {
		if (req.body.email == '' || req.body.message == '') {
			req.flash('error', '请填写完事留言信息');
			return res.redirect('/');
		}
		var mes = new Message(req.body.username, req.body.useremail, req.body.message);
		mes.save(function (err) {
			if (err) {
				req.flash('error', '留言失败，可能是系统忙=。=');
				return res.redirect('/');
			}
			res.redirect('/');
		});
	});
	//查看消息详情
	app.get('/mess/:id', function (req, res) {
		Message.getOne(req.params.id, function (err, message) {
			if (err) {
				return res.redirect('/leave_message');
			}
			return res.send({
				name: message.name,
				email: message.email,
				message: message.message
			});
		});
	});
	//上传图片
	app.post('/uploadimg', function (req, res) {
		var dbpic = [],
			blobArr,
			pic;
		for (var i in req.files) {
			if (req.files[i].size == 0){
			// 使用同步方式删除一个文件
				fs.unlinkSync(req.files[i].path);
				console.log('Successfully removed an empty file!');
			} else {
				var date = new Date();
				
				var target_path = './public/images/dbimg/' + req.files[i].name;
			// 使用同步方式重命名一个文件
				fs.renameSync(req.files[i].path, target_path);

				var dbImgUrl = '/images/dbimg/' + req.files[i].name;
				
				var time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
					date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
				blobArr = {};
				blobArr.time = time;
				blobArr.pic = dbImgUrl;
				blobArr.ower = req.params.ower;
				dbpic.push(blobArr);
			}
		}
		pic = new Pic(dbpic);
		pic.save(function (err){
			if (err) {
				req.flash('error', err); 
			}
			req.flash('success', '文件上传成功!');
			res.send(blobArr.pic);
		});
	});
	//用户中心
	app.get('/user_center', checkLogin);
	app.get('/user_center', function (req, res) {
		res.render('user_center', {
			title: '后台中心',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//登出
	app.get('/logout', checkLogin);
	app.get('/logout', function (req, res) {
		req.session.user = null;
		req.flash('success', '登出成功!');
		res.redirect('/');//登出成功后跳转到主页
	});
	//	404
	app.use(function (req, res) {
		res.render("404");
	});
	//判断是否登录
	function checkLogin(req, res, next) {
		if (!req.session.user) {
			req.flash('error', '未登录!');
			res.redirect('/login');
			return;
		}
		next();
	}

	function checkNotLogin(req, res, next) {
		if (req.session.user) {
			req.flash('error', '已登录!');
			res.redirect('back');//返回之前的页面
			return;
		}
		next();
	}
};
