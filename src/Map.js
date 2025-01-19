import React, { useRef, useEffect, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Draw, Modify, Snap } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";

import CoordinateModal from "./CoordinateModal";

const MapComponent = () => {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [vectorSource] = useState(new VectorSource());
  const [drawInteraction, setDrawInteraction] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

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
        center: fromLonLat([77.5946, 12.9716]), // Bangalore coordinates
        zoom: 10,
      }),
    });

    setMap(initialMap);

    return () => initialMap.setTarget(null); // Clean up
  }, [vectorSource]);
  const calculateDistance = (coord1, coord2) => {
    // Simple Pythagorean distance calculation for demo purposes
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    return Math.sqrt((lon2 - lon1) ** 2 + (lat2 - lat1) ** 2) * 111000; // Approx in meters
  };
  const addDrawInteraction = (type) => {
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
    }

    const draw = new Draw({
      source: vectorSource,
      type: type, // "LineString" or "Polygon"
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
    });

    draw.on("drawend", () => {
      map.removeInteraction(draw); // Stop drawing after completion
    });

    map.addInteraction(draw);
    setDrawInteraction(draw);
  };

  return (
    <div>
      <CoordinateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        waypoints={waypoints}
      />
      <button onClick={() => addDrawInteraction("LineString")}>
        Draw LineString
      </button>
      <button onClick={() => addDrawInteraction("Polygon")}>
        Draw Polygon
      </button>
      <div ref={mapRef} style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
};

export default MapComponent;

// Add the modal to JSX
