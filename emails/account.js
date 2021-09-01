const sgMail = require("@sendgrid/mail");

const sendgridAPIKey =
  "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";

sgMail.setApiKey(sendgridAPIKey);

const sendReportEmail = (first_name, last_name, email, branch) => {
  sgMail.send({
    to: "kwakuboachiefosu@gmail.com", //Put mis email
    from: email,
    subject: "Faulty Machine",
    text: `I ${first_name} ${last_name} from ${branch} branch will like to inform you about a faulty machine`,
  });
};

const AssignEmail = (first_name, last_name, email, serial_num, user_id) => {
  sgMail.send({
    to: email,
    from: "kwakuboachie18@outlook.com", //put supervisor's email
    subject: " Machine Assignment",
    text: `This email is to notify ${first_name} ${last_name} in MIS that machine with serial ${serial_num} has been assigned to you. The machine is being used by user with id ${user_id}`,
  });
};

const RemarkEmail = (
  engineer_mail,
  supervisor_email,
  serial_num,
  remarks,
  first_name,
  last_name
) => {
  sgMail.send({
    to: supervisor_email,
    from: engineer_mail, //put engineer's email
    subject: " Remarks on assigned machine",
    text: `This email is to notify the supervisors in MIS that machine with serial ${serial_num} has been worked on or looked at. Remarks: ${remarks}. I ${first_name} ${last_name} worked on the machine `,
  });
};

module.exports = {
  sendReportEmail,
  AssignEmail,
  RemarkEmail,
};
