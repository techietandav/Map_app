import React from "react";
import { Modal, Box, Typography } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const CoordinateModal = ({ open, onClose, waypoints }) => (
  <Modal open={open} onClose={onClose}>
    <Box sx={style}>
      <Typography variant="h6" component="h2">
        Waypoints
      </Typography>
      <ul>
        {waypoints.map((wp, index) => (
          <li key={index}>
            WP{String(index).padStart(2, "0")}: {wp.coordinates.join(", ")} |
            Distance: {wp.distance} m
          </li>
        ))}
      </ul>
    </Box>
  </Modal>
);

export default CoordinateModal;
