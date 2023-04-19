var jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;

exports.handler = async (event, context) => {
  try {
    const { password, token } = JSON.parse(event.body);
    console.log(password);
    if (password) {
      if (password === secretKey) {
        const token = jwt.sign({}, secretKey, { expiresIn: "24h" });
        return {
          statusCode: 200,
          body: JSON.stringify({
            token: token,
            uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
          }),
        };
      } else {
        throw new Error("invalid password");
      }
    }

    if (token) {
      jwt.verify(token, secretKey);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "success",
          uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
        }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
