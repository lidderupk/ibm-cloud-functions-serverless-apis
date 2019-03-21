const sgMail = require('@sendgrid/mail');

function main(params) {

  return new Promise(function (resolve, reject) {
    sgMail.setApiKey(params.SENDGRID_TOKEN);

    const today = new Date();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const msg = {
      to: params.TO_EMAIL,
      from: 'ulidder@us.ibm.com',
      subject: 'You got meowed - new CRIMSON CAT - ' + time,
      text: 'A new special crimson cat was just created !',
      html: "<strong>This is a cool!</strong>"
    };

    sgMail.send(msg)
      .then(function (data) {
        console.log(`email sent to : ${params.TO_EMAIL}`)
        resolve({ status: "OK" });
      }).catch(function (e) {
        console.log(e.message);
        reject({ status: e.message });
      });
  });

}

exports.main = main;