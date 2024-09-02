import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import JsBarcode from "jsbarcode";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { v4 as uuidv4 } from "uuid";

const steps = ["Sender", "Receiver", "Shipment", "Tracker ID"];
const drawerWidth = 240;
const rightSidebarWidth = 200;

const RightSidebar = ({ currentStep }) => {
  return (
    <Box
      sx={{
        width: rightSidebarWidth,
        position: "fixed",
        right: 0,
        top: "64px",
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#f5f5f5",
        boxShadow: "-2px 0px 5px rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
    >
      {steps.map((step, index) => (
        <Box
          key={step}
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            position: "relative",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: index <= currentStep ? "#8A2BE2" : "#D8D8D8",
              border: `2px solid ${
                index <= currentStep ? "#8A2BE2" : "#D8D8D8"
              }`,
              zIndex: 1,
            }}
          />
          {index < steps.length - 1 && (
            <Box
              sx={{
                position: "absolute",
                left: "11px",
                top: "24px",
                height: "calc(100% + 12px)",
                width: "2px",
                backgroundColor: index < currentStep ? "#8A2BE2" : "#D8D8D8",
                zIndex: 0,
              }}
            />
          )}
          <Typography
            variant="caption"
            sx={{
              ml: 2,
              color: index <= currentStep ? "#8A2BE2" : "grey",
            }}
          >
            {step}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const App = () => {
  const [sender, setSender] = useState({ name: "", address: "" });
  const [receiver, setReceiver] = useState({ name: "", address: "" });
  const [shipment, setShipment] = useState({ details: "" });
  const [trackerId, setTrackerId] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [openOrdersModal, setOpenOrdersModal] = useState(false);
  const barcodeRef = useRef(null);
  const [shipments, setShipments] = useState([]);

  const fetchShipments = async () => {
    // console.log("click");
    try {
      const response = await axios.get("http://localhost:5000/api/shipments");
      setShipments(response.data);
      setOpenOrdersModal(true);
      console.log(shipment);
    } catch (error) {
      console.error("Error fetching shipments:", error);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      setTrackerId(`TRACK-${uuidv4()}`);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOpenReviewModal = () => {
    setOpenReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setOpenReviewModal(false);
  };
  const handleCloseOrdersModal = () => {
    setOpenOrdersModal(false); // Close the orders dialog
  };

  const generateBarcode = () => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, trackerId, {
        format: "CODE128",
        displayValue: true,
      });
    }
  };

  const downloadBarcodeAsPNG = () => {
    if (barcodeRef.current) {
      toPng(barcodeRef.current)
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = `${trackerId}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((error) => {
          console.error("Could not download barcode as PNG", error);
        });
    }
  };

  const downloadBarcodeAsPDF = () => {
    if (barcodeRef.current) {
      toPng(barcodeRef.current)
        .then((dataUrl) => {
          const pdf = new jsPDF();
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`${trackerId}.pdf`);
        })
        .catch((error) => {
          console.error("Could not download barcode as PDF", error);
        });
    }
  };

  const submitData = async () => {
    const data = {
      sender,
      receiver,
      shipmentDetails: shipment.details,
      trackerId,
    };

    try {
      await axios.post("http://localhost:5000/api/submit", data);
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to submit data");
    }
  };

  return (
    <div>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <img
            src="https://img.freepik.com/premium-vector/illustration-home-shifting-truck-home-shifting-business-vector_1135199-79.jpg?w=740"
            alt="Logo"
            style={{ height: "40px", marginRight: "20px" }}
          />
          <Box
            display="flex"
            alignItems="center"
            style={{ marginRight: "auto", flexGrow: 1 }}
          >
            <Typography variant="h6" style={{ marginRight: "10px" }}>
              Shipment Tracker
            </Typography>
            <TextField
              placeholder="Search..."
              variant="outlined"
              size="small"
              sx={{ marginRight: "20px" }}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            style={{ marginRight: "20px" }}
          >
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <IconButton color="inherit">
              <AccountCircleIcon />
            </IconButton>
            <Box
              sx={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#4CAF50",
                marginLeft: "10px",
              }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
              Active
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <div style={{ display: "flex", marginTop: "64px" }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: "auto" }}>
            <List>
              {[
                { text: "Home", icon: <HomeIcon /> },
                { text: "Products", icon: <ShoppingCartIcon /> },
                { text: "Settings", icon: <SettingsIcon /> },
                { text: "About", icon: <InfoIcon /> },
                { text: "Contact", icon: <ContactMailIcon /> },
              ].map((item, index) => (
                <ListItem button key={index}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
              <ListItem button key={1} onClick={fetchShipments}>
                <ListItemIcon>
                  <ListAltIcon />
                </ListItemIcon>
                <ListItemText primary="Orders" />
              </ListItem>
            </List>

            <Divider />
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 0.5,
            bgcolor: "background.default",
            p: 3,
            paddingLeft: `${drawerWidth}px`,
            paddingRight: `${rightSidebarWidth}px`,
          }}
        >
          <Toolbar />

          {currentStep === 0 && (
            <div>
              <Typography variant="h6" gutterBottom>
                Sender Information
              </Typography>
              <TextField
                label="Sender Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={sender.name}
                onChange={(e) => setSender({ ...sender, name: e.target.value })}
                error={!sender.name.trim()} // Set error if the sender name is empty
                helperText={
                  !sender.name.trim() ? "Sender name is required" : ""
                }
              />
              <TextField
                label="Sender Address"
                variant="outlined"
                fullWidth
                margin="normal"
                value={sender.address}
                onChange={(e) =>
                  setSender({ ...sender, address: e.target.value })
                }
                error={!sender.address.trim()} // Set error if the sender name is empty
                helperText={
                  !sender.address.trim() ? "Sender Address is required" : ""
                }
              />
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <Typography variant="h6" gutterBottom>
                Receiver Information
              </Typography>
              <TextField
                label="Receiver Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={receiver.name}
                onChange={(e) =>
                  setReceiver({ ...receiver, name: e.target.value })
                }
                error={!receiver.name.trim()} // Set error if the sender name is empty
                helperText={
                  !receiver.name.trim() ? "Sender Address is required" : ""
                }
              />
              <TextField
                label="Receiver Address"
                variant="outlined"
                fullWidth
                margin="normal"
                value={receiver.address}
                onChange={(e) =>
                  setReceiver({ ...receiver, address: e.target.value })
                }
                error={!receiver.address.trim()} // Set error if the sender name is empty
                helperText={
                  !receiver.address.trim() ? "Sender Address is required" : ""
                }
              />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <Typography variant="h6" gutterBottom>
                Shipment Details
              </Typography>
              <TextField
                label="Details"
                variant="outlined"
                fullWidth
                margin="normal"
                value={shipment.details}
                onChange={(e) =>
                  setShipment({ ...shipment, details: e.target.value })
                }
                error={!shipment.details.trim()} // Set error if the sender name is empty
                helperText={
                  !shipment.details.trim() ? "Sender Address is required" : ""
                }
              />
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <Typography variant="h6" gutterBottom>
                Tracker ID
              </Typography>
              <TextField
                label="Tracker ID"
                variant="outlined"
                fullWidth
                margin="normal"
                value={trackerId}
                disabled
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenReviewModal}
              >
                Review
              </Button>
            </div>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={currentStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button variant="contained" color="primary" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={submitData}>
                Submit
              </Button>
            )}
          </Box>
        </Box>

        <RightSidebar currentStep={currentStep} />
      </div>

      <Dialog open={openReviewModal} onClose={handleCloseReviewModal}>
        <DialogTitle>
          Review and Generate Barcode
          <IconButton
            aria-label="close"
            onClick={handleCloseReviewModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Sender Name: {sender.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Sender Address: {sender.address}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Receiver Name: {receiver.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Receiver Address: {receiver.address}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Shipment Details: {shipment.details}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Tracker ID: {trackerId}
          </Typography>
          <svg
            ref={barcodeRef}
            style={{ width: "100%", height: "100px", marginTop: "20px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              generateBarcode();
            }}
            variant="contained"
            color="primary"
          >
            Generate Barcode
          </Button>
          <Button
            onClick={downloadBarcodeAsPNG}
            variant="contained"
            color="secondary"
          >
            Download PNG
          </Button>
          <Button
            onClick={downloadBarcodeAsPDF}
            variant="contained"
            color="secondary"
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openOrdersModal} onClose={handleCloseOrdersModal}>
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleCloseOrdersModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* List of all shipments */}
          {shipments.length > 0 && (
            <Box mt={2}>
              <Typography variant="h6" gutterBottom>
                Shipment Orders
              </Typography>
              <List>
                {shipments.map((shipment, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`Sender: ${shipment.sender.name}, Receiver: ${shipment.receiver.name}`}
                      secondary={`Shipment Details: ${shipment.shipmentDetails}, Tracker ID: ${shipment.trackerId}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default App;
