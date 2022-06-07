import { Document, model, Schema } from "mongoose";

export interface Player extends Document {
    name: string
    uid: string
    balance: number
    highscores: {
        week: number
        month: number
        all_time: number
    }
}

const PlayerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    uid: {
        type: String,
        unique: true,
        required: true,
    },
    balance: {
        type: Number,
        required: true
    },
    highscores: {
        week: { type: Number },
        month: { type: Number },
        all_time: { type: Number }
    }
})

export default model<Player>('Player', PlayerSchema)