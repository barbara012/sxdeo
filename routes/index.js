
/*
 * GET home page.
 */
var crypto = require('crypto'),
	fs = require('fs'),
	User = require('../models/user.js'),
	Post = require('../models/post.js'),
	Pic = require('../models/pic.js'),
	Comment = require('../models/comment.js'),
	Email = require('../models/email.js'),
	markdown = require('markdown').markdown,
	passport = require('passport');
module.exports = function (app) {

	app.get('/', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		//查询并返回第 page 页的 10 篇文章
		Post.getTen(null, page, function (err, posts, total) {
			if (err) {
				posts = [];
			}
			res.render('index', {
				title: '首页',
				posts: posts,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + posts.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//注册
	app.post('/reg', checkNotLogin);
	app.post('/reg', function (req, res) {
		var name = req.body.regUserName,
			password = req.body.regPassword,
			md5 = crypto.createHash('md5'),
			email = req.body.regEmail,
			reg = /`|~|!|@|#|\$|%|\^|\*|\(|\-|\)|\+|_|=|\/|\||\\|。|，|》|《|>|<|！/;
		password = md5.update(req.body.regPassword).digest('hex');
		if (reg.test(name)) {
			return res.send(
				{
					type: 3,
					mes: '包含非法字符。可以包含英文字母，数字，和三个符号 - . _'
				}
			);//返回注册页
		}
		if (name.length > 20) {
			return res.send(
				{
					type: 4,
					mes: '超过20个字符！'
				}
			);//返回注册页
		}
		var newUser = new User({
			name: name,
			password: password,
			email: email
		});
		//检查用户名与邮箱是否已经存在
		User.CheckNameEmail(newUser.name, newUser.email, function (err, type) {
			if (type === 'name') {
				return res.send(
					{
						type: 1,
						mes: '用户名已经存在！'
					}
				);//返回注册页
			} else if (type === 'email'){
				return res.send(
					{
						type: 3,
						mes: '邮箱已经存在！'
					}
				);//返回注册页
			}
			//如果不存在则新增用户
			newUser.save(function (err, user) {
				if (err) {
					req.flash('error', err);
					return res.send(
						{
							type: 2,
							mes: '系统繁忙！'
						}
					);//返回注册页
				}
				req.session.user = user;//用户信息存入 session
				req.flash('success', '注册成功！');
				return res.send(
					{
						type: 0,
						mes: '注册成功！'
					}
				);//返回注册页
			});
		});
	});
	//登录
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
		User.get(req.body.username, function (err, user) {
			if (!user) {
				req.flash('error', '用户不存在!');
				return res.send(
					{
						'type': 1,
						'mes': '用户不存在！'
					}
				);//用户不存在则跳转到登录页
			}
			//检查密码是否一致
			if (user.password != password) {
				req.flash('error', '密码错误!'); 
				return res.send(
					{
						'type': 2,
						'mes': '密码错误！'
					}
				);//密码错误则跳转到登录页
			}
			//用户名密码都匹配后，将用户信息存入 session
			req.session.user = user;
			req.flash('success', '登陆成功!');
			res.send(
					{
						'type': 3,
						'mes': '登录成功'
					}
			)
		});
	});
	//github login
	app.get('/login/github', passport.authenticate('github', {session: false}));
	app.get('/login/github/callback', passport.authenticate('github', {
		session: false,
		failureRedirect: '/login',
		successFlash: '登陆成功！'
	}), function (req, res) {
		var saveAsGithubName = req.user.username + 'huluwa$github';
		User.get(saveAsGithubName, function (err, user) {
			if (user) {
				req.session.user = user;
				return res.redirect('/');

			};

			var newUser = new User({
				'name': saveAsGithubName,
				'password': 'woaichensiyun',
				'email': '5201314@hwh.com'
			})
			newUser.save(function(err, user) {
				if (err) {
					return res.redirect('/');
				}
				req.session.user = user;
				res.redirect('/');
			});
		});
		
	});
	//设置
	app.get('/set', checkLogin);
	app.get('/set', function (req, res) {
		if (req.session.user.name === 'huwenhua012') {
			res.render('set', {
				title: '设置',
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()});
		} else {
			res.render('/', {
			title: '首页',
			user: req.session.user,
			success: req.flash('没有权限').toString(),
			error: req.flash('error').toString()});
		}
	});
	//修改
	app.post('/update/:name', function (req, res) {
		var name = req.params.name;
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('hex');
		User.resetPassword(req.params.name, password, function (err) {
			if (!err) {
				return res.redirect('/');
			}
			console.log(err);
		});
	});
	//讨论
	app.get('/discuss', checkLogin);
	app.get('/discuss', function (req, res) {
		res.render('discuss', {
			title: '前端CSS规范讨论',
			user: req.session.ser,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//发布
	app.get('/post', checkLogin);
	app.get('/post', function (req, res) {
		res.render('post', {
			title: '发布',
			user: req.session.user || {'name': '葫芦娃'},
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/post', checkLogin);
	app.post('/post', function (req, res) {
		console.log(req.session.user.email);
		var currentUser = req.session.user,
			md5 = crypto.createHash('md5'),
			tags = req.body.tag.split(';'),
			email_MD5 = md5.update(currentUser.email.toLowerCase()).digest('hex'),
			head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=60",
			post = new Post(currentUser.name, head, req.body.title, tags, req.body.content);
			post.save(function (err) {
				if (err) {
					req.flash('error', err);
					return res.send(
						{
							'type': 1
						}
					);//发布失败
				}
				req.flash('success', '发布成功!');
				res.send(
					{
						'type': 3,
						'mes': '发布成功！',
						'url': '/'
					}
				);//发表成功跳转到主页
			});
	});
	//
	app.post('/post/:ower', function (req, res) {
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
	//登出
	app.get('/logout', checkLogin);
	app.get('/logout', function (req, res) {
		req.session.user = null;
		req.flash('success', '登出成功!');
		res.redirect('/');//登出成功后跳转到主页
	});

	//相册
	app.get('/album', checkLogin);
	app.get('/album', function (req, res) {
		var page = page = req.query.p ? parseInt(req.query.p) : 1;
		//查询并返回第 page 页的 10 篇文章
		Pic.getTen(null, page, function (err, imgs, total) {
			if (err) {
				imgs = [];
			} 
			res.render('album', {
				title: '首页',
				imgs: imgs,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + imgs.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//上传文件
	app.get('/upload', checkLogin);
	app.get('/upload', function (req, res) {
		res.render('upload', {
			title: '文件上传',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/upload', checkLogin);
	app.post('/upload', function (req, res) {
		var dbpic = [],
			blobArr,
			pic;
		for (var i in req.files) {
			if (req.files[i].size == 0){
			// 使用同步方式删除一个文件
				fs.unlinkSync(req.files[i].path);
				console.log('Successfully removed an empty file!');
			} else {
				var target_path = './public/images/dbimg/' + req.files[i].name;
			// 使用同步方式重命名一个文件
				fs.renameSync(req.files[i].path, target_path);
				var dbImgUrl = '/images/dbimg/' + req.files[i].name;
				var date = new Date();
				var time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
					date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
				blobArr = {};
				blobArr.time = time;
				blobArr.pic = dbImgUrl;
				dbpic.push(blobArr);
			}
		}
		pic = new Pic(dbpic);
		pic.save(function(err){
			if (err) {
				req.flash('error', err)
			}
			req.flash('success', '文件上传成功!');
		});
	});

	//获得用户信息
	app.get('/u/:name', function (req, res) {
		var page = req.query.p ? parseInt(req.query.p) : 1;
		//检查用户是否存在
		User.get(req.params.name, function (err, user) {
			if (!user) {
				req.flash('error', '用户不存在!'); 
				return res.redirect('/');
			}
		//查询并返回该用户第 page 页的 10 篇文章
			Post.getTen(user.name, page, function (err, posts, total) {
				if (err) {
					req.flash('error', err); 
					return res.redirect('/');
				} 
				res.render('user', {
					title: user.name,
					posts: posts,
					page: page,
					isFirstPage: (page - 1) == 0,
					isLastPage: ((page - 1) * 10 + posts.length) == total,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		}); 
	});
	//检索文章
	app.get('/search', function (req, res) {
		Post.search(req.query.keyword, function (err, posts) {
			if (err) {
				req.flash('error', err); 
				return res.redirect('/');
			}
			res.render('search', {
				title: "SEARCH:" + req.query.keyword,
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//获取存档
	app.get('/archive', function (req, res) {
		Post.getArchive(function (err, posts) {
			if (err) {
				req.flash('error', err); 
				return res.redirect('/');
			}
			res.render('archive', {
				title: '存档',
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//获取标签
	app.get('/tags', function (req, res) {
		Post.getTags(function (err, posts) {
			if (err) {
				req.flash('error', err); 
				return res.redirect('/');
			}
			res.render('tags', {
				title: '标签',
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//获取当前标签下的文章
	app.get('/tags/:tag', function (req, res) {
		Post.getTag(req.params.tag, function (err, posts) {
			if (err) {
				req.flash('error',err); 
				return res.redirect('/');
			}
			res.render('tag', {
				title: 'TAG:' + req.params.tag,
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//获得用户文章
	app.get('/p/:name/:id', function (req, res) {
		
		Post.getOne(req.params.id, req.params.name, 1, function (err, post) {
			if (err) {
				req.flash('error', err);
				console.log(err);
				return res.redirect('/');
			};
			res.render('article', {
				title: post.title,
				post: post,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//留言
	app.post('/p/:name/:id', function (req, res) {
		var date = new Date(),
			time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
				 date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
			md5 = crypto.createHash('md5'),
			email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
			head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=60"; 
			comment = {
				name: req.body.name,
				head: head,
				email: req.body.email,
				time: time,
				content: req.body.content
			};
		var newComment = new Comment(req.params.id, comment);
		newComment.save(function (err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			comment.content = markdown.toHTML(comment.content);
			req.flash('success', '留言成功!');
			res.send(comment);
		});
	});
	//火星票
	app.get('/mars', checkLogin);
	app.get('/mars', function (req, res) {
		res.render('mars', {
			title: '火星船票',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//编辑文章
	app.get('/edit/:id', checkLogin);
	app.get('/edit/:id', function (req, res) {
		var currentUser = req.session.user;
		Post.edit(req.params.id, function (err, post) {
			if (err) {
				req.flash('error', err);

				return res.redirect('back');
			}
			res.render('edit', {
				title: '编辑',
				post: post,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//保存文章
	app.post('/edit/:id', checkLogin);
	app.post('/edit/:id', function (req, res) {
		var currentUser = req.session.user,
			tags = req.body.tag.split(';');
		Post.update(req.params.id , tags, req.body.title, req.body.content, function (err) {
			var url = '/p/' + currentUser.name + '/' + req.params.id;
			if (err) {
				console.log('err');
				req.flash('error', err);
				return res.send(
					{
						type: 1,
						url: url
					}
				);//出错！返回文章页
			}
			req.flash('success', '修改成功!');
			res.send(
				{
					type: 3,
					mes: '编辑成功！',
					url: url
				}
			);//成功！返回文章页
		});
	});
	//删除文章
	app.post('/delete/:id', checkLogin);
	app.post('/delete/:id', function (req, res) {
		var currentUser = req.session.user;
		Post.remove(req.params.id, currentUser.name, function (err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', '删除成功!');
			res.send('300');
		});
	});
	//转载
	app.get('/reprint/:id', checkLogin);
	app.get('/reprint/:id', function (req, res) {
		Post.edit(req.params.id, function (err, post) {
			if (err) {
				req.flash('error', err);
				return res.redirect(back);
			}

			var currentUser = req.session.user,
				reprint_from = {name: post.name, minute: post.time.minute, title: post.title, id: req.params.id},
				reprint_to = {name: currentUser.name, head: currentUser.head};

			Post.reprint(reprint_from, reprint_to, function (err, post) {
				if (err) {
					req.flash('error', err);
					return res.redirect('back');
				}
				req.flash('success', '转载成功!');
				var url = '/u/' + post.name + '/' + post.time.minute + '/' + post.title;
				//跳转到转载后的文章页面
				res.redirect('/');
			});
		});
	});
	//登录用户已经发布的文章列表
	app.get('/posted/:name', checkLogin);
	app.get('/posted/:name', function (req, res) {
		if (req.session.user.name !== req.params.name) {
			return res.redirect('/');
		}
		Post.getAll(req.params.name, function (err, arrayId) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			if (arrayId.length === 0) {
				return res.render('posted', {
							title: '文章',
							arrayId: 0,
							user: req.session.user,
							success: req.flash('success').toString(),
							error: req.flash('error').toString()
						});
			}
			Post.getOne(arrayId[0]._id.id, req.params.name, 2,  function (err, post) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('posted', {
					title: '文章',
					arrayId: arrayId,
					post: post,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			})
		})
	});
	app.get('/posted/:name/:id', checkLogin);
	app.get('/posted/:name/:id', function (req, res) {
		Post.getOne(req.params.id, req.params.name, 2, function (err, post) {
			if (err) {
				req.flash('error', err);
				return res.send('12');
			};

			req.flash('success', '获取成功!');
			res.send(post);
		})
	});
	//作者已经发布的文章列表
	app.get('/oposted/:name', checkLogin);
	app.get('/oposted/:name', function (req, res) {
		Post.getAll(req.params.name, function (err, arrayId) {
			if (err) {
				req.flash('error', err);
				return res.redirect(back);
			}
			if (arrayId.length === 0) {
				return res.redirect(back);
			}

			Post.getOne(arrayId[0]._id.id, req.params.name, 2,  function (err, post) {
				if (err) {
					req.flash('error', err);
					return res.redirect(back);
				}
				res.render('oposted', {
					title: '文章',
					arrayId: arrayId,
					post: post,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			})
		})
	});
	//获取登录用户详细信息
	app.get('/info/:name', checkLogin);
	app.get('/info/:name', function (req, res) {
		User.get(req.params.name, function (err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect(back);
			}
			req.session.user = user;
			res.render('user_info',{
				title: '信息',
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			})
		})
	});
	//发送邮箱
	app.post('/reset', function (req, res) {
		var	url = 'http://localhost:3000/reset/',
			content, //'请点击' + '<a href="' + url + '">' + url + '</a>';
			time = new Date().getTime();
		User.getByEmail(req.body.resetEmail, function (err, user) {
			if (err || !user) {
				return res.redirect('/login');
			}
			url = 'http://localhost:3000/reset/' + user._id + '/' + req.body.resetEmail + '/' + time + '/' + 15;
			content = '请点击' + '<a href="' + url + '">' + url + '</a>' + '(1小时后过期)';
			Email.send(req.body.resetEmail, content, function (err) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/login');
				}
				res.redirect('/');
			});
		})
	});
	//重置页
	app.get('/reset/:id/:email/:time/:flag', function (req, res) {
		var time = new Date().getTime();

		if ((time - req.params.time)/(1000 * 60 * 60) > 1) {
			return res.render('reset', {
						title: '首页',
						past: true,
						success: req.flash('success').toString(),
						error: req.flash('error').toString()
					});
		}
		User.getByEmail(req.params.email, function (err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('reset', {
				title: '首页',
				past: false,
				user: user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			})
		})
	})
	//重置
	app.post('/reset/password/:name', checkLogin);
	app.post('/reset/password/:name', function (req, res) {
		var password = req.body.password,
			md5 = crypto.createHash('md5');
		password = md5.update(password).digest('hex');
		User.resetPassword(req.params.name, password, function (err) {
			if (err) {
				req.flash('error', err);
			}
			res.redirect('/login');
		})
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
