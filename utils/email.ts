import nodemailer from "nodemailer";

type Props = {
  email: string;
  subject: string;
  message: string;
};

const sendMail = async (options: Props) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 25,
    ignoreTLS: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Ravi Manjhi  <hello@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
export default sendMail;
