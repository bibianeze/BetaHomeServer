const property = require("../models/property");
const Property = require("../models/property");
const cloudinary = require("cloudinary").v2
const fs = require("fs");
const handleAddProperty = async (req, res) => {
  const {
    title,
    location,
    price,
    propertyType,
    description,
    tags,
    propertyStatus,
    bathrooms,
    bedroom,
    garage,
    squareFeet,
    name,
    phoneNumber,
    whatsappNumber,
  } = req.body;

  const video = req.files.video.tempFilePath;
  const images = req.files.images;
  const avatar = req.files.avatar.tempFilePath;

  try {
    // avatar
    const avatarResult = await cloudinary.uploader.upload(avatar, {
      use_filename: true,
      folder: "betaHome",
    });
    fs.unlinkSync(req.files.avatar.tempFilePath);

    // upload image
    const imageUploadPromises = images.map(async (image) => {
      const imageResult = await cloudinary.uploader.upload(image.tempFilePath, {
        use_filename: true,
        resource_type: "image",
        folder: "betaHome",
      });

      fs.unlinkSync(image.tempFilePath);
      return imageResult.secure_url;
    });

    const uploadedImage = await Promise.all(imageUploadPromises);

    // video upload

    const videoResult = await cloudinary.uploader.upload(video, {
      resource_type: "video",
      folder: "betahomevideos",
    });
    fs.unlinkSync(req.files.video.tempFilePath);

    // set up media
    const media = {
      images: [...uploadedImage],
      video: videoResult.secure_url,
    };
    // set up salesSupport
    const salesSupport = {
      name,
      phoneNumber,
      whatsappNumber,
      avatar: avatarResult.secure_url,
    };

    // set up property
    const property = await Property.create({
      title,
      location,
      price,
      propertyType,
      description,
      tags,
      propertyStatus,
      bathrooms,
      bedroom,
      garage,
      squareFeet,
      salesSupport,
      media,
    });
    res.status(201).json({ success: true, property });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
const handleGetAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().sort("-createdAt")
    res.status(200).json({success: true, properties})
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
    
  }
};
const handleGetRecentProperties = async (req, res) => {
  try {
    const recentProperties = await property.findOne().sort("-createdAt").limit(3)
    res.status(200).json({success: true, properties: recentProperties})
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
    
  }
};
const handleGetASingleProperty = async (req, res) => {
  const {propertyId} = req.params
  try {
    const property = await Property.findById({_id: propertyId})
    const propertyType = property.propertyType
    const similarProperties = await Property.find({propertyType}).limit(3)
    res.status(200).json({success: true, property, similarProperties})
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
    
  }
};
const handleEditProperties = async (req, res) => {
  res.send("Update a property");
};

const handleDeleteProperties = async (req, res) => {
  const {propertyId} = req.params
  try {
    await Property.findByIdAndDelete({_id: propertyId})
    res.status(200).json({ message: "Property Deleted", success: true})
  } catch (error) {
    console.log(error);
    res.status(404).json(error);
    
  }
};
module.exports = {
  handleAddProperty,
  handleGetAllProperties,
  handleGetASingleProperty,
  handleEditProperties,
  handleDeleteProperties,
  handleGetRecentProperties,
};
