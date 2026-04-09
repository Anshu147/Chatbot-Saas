import mongoose from 'mongoose';

const chatbotSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    config: {
        appearance: {
            primaryColor: { type: String, default: '#3B82F6' },
            welcomeMessage: { type: String, default: 'Hi! How can I help you today?' },
            placeholderText: { type: String, default: 'Type your message...' },
            botName: { type: String, default: 'Assistant' },
            position: { type: String, enum: ['bottom-right', 'bottom-left'], default: 'bottom-right' }
        },
        behavior: {
            responseDelay: { type: Number, default: 500 }, // ms
            typingIndicator: { type: Boolean, default: true },
            confidenceThreshold: { type: Number, default: 0.7 }, // For escalation
            maxMessagesPerSession: { type: Number, default: 50 }
        },
        businessHours: {
            enabled: { type: Boolean, default: false },
            timezone: { type: String, default: 'Asia/Kolkata' },
            schedule: {
                monday: { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' }, active: { type: Boolean, default: true } },
                tuesday: { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' }, active: { type: Boolean, default: true } },
                wednesday: { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' }, active: { type: Boolean, default: true } },
                thursday: { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' }, active: { type: Boolean, default: true } },
                friday: { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' }, active: { type: Boolean, default: true } },
                saturday: { start: { type: String, default: '10:00' }, end: { type: String, default: '14:00' }, active: { type: Boolean, default: false } },
                sunday: { start: { type: String, default: '10:00' }, end: { type: String, default: '14:00' }, active: { type: Boolean, default: false } }
            }
        },
        escalation: {
            enabled: { type: Boolean, default: true },
            email: String,
            triggerKeywords: [{ type: String }] // e.g., ["refund", "manager", "complaint"]
        }
    },
    vectorNamespace: {
        type: String,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-generate vector namespace on creation
chatbotSchema.pre('save', function () {
    if (!this.vectorNamespace) {
        this.vectorNamespace = `chatbot_${this._id}`;
    }
    this.updatedAt = Date.now();
});

const Chatbot = mongoose.model('Chatbot', chatbotSchema);

export default Chatbot;