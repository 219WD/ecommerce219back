const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: null // URL de la imagen de perfil
    },
    qrCode: {
        type: String,
        default: null // URL del código QR
    },
    isMedico: { type: Boolean, default: false },
    isPaciente: { type: Boolean, default: false },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isSecretaria: { type: Boolean, default: false },
    isPartner: {
        type: Boolean,
        default: false,
    },
    isPending: {
        type: Boolean,
        default: false,
    },
    partnerData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner'
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);