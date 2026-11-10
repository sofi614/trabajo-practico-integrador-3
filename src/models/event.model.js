import { model, Schema, Types } from "mongoose";

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: (valor) => Number.isInteger(valor),
        message: "La capacidad debe ser un numero entero",
      },
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "finished"],
      default: "scheduled",
    },

    // documento embebido 1:1 (una propiedad de tipo objeto)
    location: {
      venue: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100,
      },
      address: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 150,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
      },
    },

    // referencia 1:N (un usuario organiza muchos eventos)
    organizer: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    // referencia N:M (array de referencias a Category)
    categories: [
      {
        type: Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const EventModel = model("Event", eventSchema);
