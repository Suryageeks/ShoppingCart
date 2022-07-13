const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'], 
        trim: true,
        maxlength:[120,'product name should not exceed 120 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'], 
        maxlength:[5,'product name should not exceed 5 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide product description'], 
        trim: true,
    },
    photos: [
        {
            id: {
                type: String,
                required:true
            },
            secure_url: {
                type: String,
                required:true
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select catgory from - short-sleeves / long-sleeves / sweat-shirts / hoodies'],
        enum: {
            values: [
                'shortsleeves',
                'longsleeves',
                'sweatshirts',
                'hoodies'
            ],
            message:'please only select catregory from above only'
        },
        trim: true,
    },
    stock: {
        type: Number,
        required: [true, 'please add a stock number']
    },
    brand: {
        type: String,
        required:[true,'please add a brand for clothing']
    },
    Avgratings: {
        type: Number,
        default:0
    },
    numberOfReviews:{
        type: Number,
        default:0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref:'User',
                required:true
            },
            name: {
                type: String,
                required:true
            },
            rating: {
                type: Number,
                required:true
            },
            comment: {
                type: String,
                required:true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    },
    createdAt: {
        type: Date,
        default:Date.now
    }
})


module.exports = mongoose.model('Product',productSchema)
