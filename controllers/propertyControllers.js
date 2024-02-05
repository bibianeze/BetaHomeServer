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
  const { location, type, bedroom, title } = req.query;
  const queryObject = {};
  if (location) {
    queryObject.location = { $regex: location, $options: "i" };
  }
  if (type) {
    queryObject.propertyType = { $regex: type, $options: "i" };
  }
  if (bedroom) {
    queryObject.bedroom = { $eq: Number(bedroom) };
  }
  try {
    const properties = await Property.find().sort("-createdAt");
    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.log(error);
    res.json(error);
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
  const { propertyId } = req.params;
  const {
    title,
    location,
    price,
    propertyType,
    description,
    tags,
    propertStatus,
    bedroom,
    bathroom,
    garage,
    squareFeet,
    name,
    phoneNumber,
    whatsappNumber,
  } = req.body;

  try {
    // Check if the property exists
    const existingProperty = await Property.findById(propertyId);
    if (!existingProperty) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Update fields
    existingProperty.title = title ?? existingProperty.title;
    existingProperty.location = location ?? existingProperty.location;
    existingProperty.price = price ?? existingProperty.price;
    existingProperty.propertyType =
      propertyType ?? existingProperty.propertyType;
    existingProperty.description = description ?? existingProperty.description;
    existingProperty.tags = tags ?? existingProperty.tags;
    existingProperty.propertStatus =
      propertStatus ?? existingProperty.propertStatus;
    existingProperty.bedroom = bedroom ?? existingProperty.bedroom;
    existingProperty.bathroom = bathroom ?? existingProperty.bathroom;
    existingProperty.garage = garage ?? existingProperty.garage;
    existingProperty.squareFeet = squareFeet ?? existingProperty.squareFeet;

    // Update sales support information
    existingProperty.salesSupport = {
      name: name ?? existingProperty.salesSupport.name,
      phoneNumber: phoneNumber ?? existingProperty.salesSupport.phoneNumber,
      whatsappNumber:
        whatsappNumber ?? existingProperty.salesSupport.whatsappNumber,
    };

    // Check if there is a new avatar
    if (req.files?.avatar) {
      const newAvatarResult = await cloudinary.uploader.upload(
        req.files.avatar.tempFilePath,
        {
          use_filename: true,
          folder: "betaHome",
        }
      );
      fs.unlinkSync(req.files.avatar.tempFilePath);

      // Update existing avatar with new one
      existingProperty.salesSupport.avatar = newAvatarResult.secure_url;
    }

    // Check if there are new images
    if (req.files?.images && req.files.images.length > 0) {
      const newImagesUploadPromises = req.files.images.map(async (image) => {
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          use_filename: true,
          folder: "betaHome",
        });
        fs.unlinkSync(image.tempFilePath);
        return result.secure_url;
      });
      const newImages = await Promise.all(newImagesUploadPromises);

      // Update existing images with new ones
      existingProperty.media.images = [...newImages];
    }

    // Check if there is a new video
    if (req.files?.video) {
      const newVideoResult = await cloudinary.uploader.upload(
        req.files.video.tempFilePath,
        {
          resource_type: "video",
          folder: "betahomevideos",
        }
      );
      fs.unlinkSync(req.files.video.tempFilePath);

      // Update existing video with new one
      existingProperty.media.video = newVideoResult.secure_url;
    }

    // Save changes to the database
    await existingProperty.save();

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: existingProperty,
    });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ success: false, message: "Failed to update property", error });
  }
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
