const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost/shipmentTracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const shipmentSchema = new mongoose.Schema({
  sender: {
    name: String,
    address: String,
  },
  receiver: {
    name: String,
    address: String,
  },
  shipmentDetails: String,
  trackerId: String,
});

const Shipment = mongoose.model("Shipment", shipmentSchema);

app.get("/api/shipments", async (req, res) => {
  try {
    const shipments = await Shipment.find();
    res.status(200).json(shipments);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving shipments", error });
  }
});

app.post("/api/submit", async (req, res) => {
  const { sender, receiver, shipmentDetails, trackerId } = req.body;

  try {
    const newShipment = new Shipment({
      sender,
      receiver,
      shipmentDetails,
      trackerId,
    });

    await newShipment.save();
    res.status(201).json({ message: "Shipment saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving shipment", error });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
