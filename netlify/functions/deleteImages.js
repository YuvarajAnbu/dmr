const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event, context) => {
  try {
    const { imgName } = JSON.parse(event.body);
    await cloudinary.uploader.destroy(imgName);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Deleted SuccessFully" }),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
