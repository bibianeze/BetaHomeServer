const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const managerSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    phoneNumber:{
        type: String,
        required: true
    },
    whatsappNumber:{
        type: String,
        required: true
    },
    avatar:{
        type: String,
        required: true,
        default:
      "https://static-00.iconduck.com/assets.00/avatar-default-symbolic-icon-479x512-n8sg74wg.png",
    }
})
const propertySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
      enum: ["house", "Land"],
    },
    price: {
      type: Number,
      required: true,
    },
    tags: {
      type: String,
      enum: ["luxury", "affordable", "comfortable", "spacious"],
    },
    propertStatus: {
      type: String,
      required: true,
      default: "available",
      enum: ["available", "sold"],
    },
    bedroom: {
      type: Number,
      min: 0,
    },
    bathroom: {
      type: Number,
      min: 0,
    },
    garage: {
      type: Boolean,
      default: false,
    },
    squareFeet:{
        type: Number,
        min: 0,
    },
    media:{
        images:{
            type: [String]
        },
        video:{
            type: String,
        },
    },
    salesSupport: managerSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
