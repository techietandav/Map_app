// src/App.js
import React, { useState, useRef, useEffect } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Draw } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import {
  Modal,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Checkbox,
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const App = () => {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [vectorSource] = useState(new VectorSource());
  const [drawInteraction, setDrawInteraction] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const calculateDistance = (coord1, coord2) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371000; // Radius of the Earth in meters
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  useEffect(() => {
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: vectorSource,
        }),
      ],
      view: new View({
        center: fromLonLat([77.5946, 12.9716]),
        zoom: 10,
      }),
    });
    setMap(initialMap);
    return () => initialMap.setTarget(null);
  }, [vectorSource]);

  const addDrawInteraction = (type) => {
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
    }

    const draw = new Draw({
      source: vectorSource,
      type: type,
    });

    draw.on("drawstart", () => {
      setWaypoints([]);
    });

    draw.on("drawend", (event) => {
      const coords = event.feature.getGeometry().getCoordinates();
      const newWaypoints = coords.map((coord, index) => ({
        coordinates: coord,
        distance: index > 0 ? calculateDistance(coords[index - 1], coord) : 0,
      }));
      setWaypoints(newWaypoints);
      setModalOpen(true);
      map.removeInteraction(draw);
    });

    map.addInteraction(draw);
    setDrawInteraction(draw);
  };

  return (
    <div>
      <Button
        variant="contained"
        onClick={() => addDrawInteraction("LineString")}
        style={{ marginRight: "10px" }}
      >
        Draw LineString
      </Button>
      <Button variant="contained" onClick={() => addDrawInteraction("Polygon")}>
        Draw Polygon
      </Button>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "500px", marginTop: "20px" }}
      ></div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={style}>
          <Typography variant="h6" component="h2" gutterBottom>
            Mission Creation
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>WP</TableCell>
                  <TableCell>Coordinates</TableCell>
                  <TableCell>Distance (m)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {waypoints.map((wp, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Checkbox /> WP{String(index).padStart(2, "0")}
                    </TableCell>
                    <TableCell>{wp.coordinates.join(", ")}</TableCell>
                    <TableCell>
                      {index === 0 ? "--" : wp.distance.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="body2" style={{ marginTop: "10px" }}>
            Click on the map to mark points of the route and then press ↩ to
            complete the route.
          </Typography>
          <Button
            variant="contained"
            style={{ marginTop: "20px" }}
            onClick={() => {
              setModalOpen(false);
              console.log("Generated Data:", waypoints);
            }}
          >
            Generate Data
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default App;
