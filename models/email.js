var nodemailer = require("nodemailer");
// create reusable transport method (opens pool of SMTP connections)
function Email () {};

module.exports = Email;

Email.send = function (toEmail, content, callback) {
	var smtpTransport = nodemailer.createTransport("SMTP",{
		service: "Gmail",
		auth: {
			user: "huwenhua2012@gmail.com",
			pass: "huwenhua012"
		}
	});

	// setup e-mail data with unicode symbols
	var mailOptions = {
		from: 'huwenhua2012@gmail.com', // sender address
		to: toEmail, // list of receivers
		subject: '重置密码', // Subject line
		html: content // html body
	}

	// send mail with defined transport object
	smtpTransport.sendMail(mailOptions, function(err, response){
		smtpTransport.close();
		if(err){			
			return callback(err);
		}else{
			return callback(null, response);
		}
	});
}
