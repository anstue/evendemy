module.exports = {
    sendMail: function(config, sendTo, view, attachment, production_mode){
        var fs = require('fs');
        var nodemailer = require('nodemailer');
        var mustache = require('mustache');

        if(!production_mode){
            console.log('sending mail:'+view.header+'\n', sendTo, view, attachment);
        }
        if (!config.mail.enableMail || config.mail.enableMail === false) {
            console.log('There is no configuration for sending mails. The email will not be sent.');
            return;
        }

        fs.readFile(config.mail.htmlFilePath, 'utf8', function (err, template) {
            if (err) {
                return console.log(err);
            }

            var html = mustache.render(template, view);

            var smtpConfig = {
                host: config.mail.host,
                port: config.mail.port,
                secureConnection: false,
                auth: {
                    user: config.mail.user,
                    pass: config.mail.pass
                },
                tls: {
                    ciphers: 'SSLv3'
                }
            };

            var transporter = nodemailer.createTransport(smtpConfig);

            var mailOptions = {
                from: config.mail.address, // sender address
                bcc: sendTo, // list of receivers
                subject: view.title, // Subject line
                html: html
            };

            if (attachment) {
                mailOptions.attachments = attachment;
            }

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });

        });
    }, 
    renderAllTemplates: function(template, meeting, user, text){
        return {
            header: this.renderTemplate(template.header, meeting, user, text),
            title:  this.renderTemplate(template.title, meeting, user, text),
            body:  this.renderTemplate(template.body, meeting, user, text),
            button_href:  this.renderTemplate(template.button_href, meeting, user, text),
            button_label: this.renderTemplate(template.button_label, meeting, user, text),
            foot: this.renderTemplate(template.foot, meeting, user, text)
        };
    },
    renderTemplate: function(template, meeting, user, text){
        var mustache = require('mustache');
        return mustache.render(template, { meeting, user, text });
    }
}