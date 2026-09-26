import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, InputGroup, Alert, Badge } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Swal from 'sweetalert2';

interface LocationMapPickerModalProps {
    show: boolean;
    onHide: () => void;
    latitude: number;
    longitude: number;
    radius: number;
    locationName?: string;
    onConfirm: (lat: number, lng: number, radius?: number) => void;
}

// Custom crisp SVG Pin Icon
const pinIcon = L.divIcon({
    className: 'custom-leaflet-marker-pin',
    html: `
        <div style="transform: translate(-50%, -100%);">
            <svg width="34" height="42" viewBox="0 0 24 24" fill="#dc3545" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.45));">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
            </svg>
        </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
});

// Helper component to handle map clicks & updating center
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(
                parseFloat(e.latlng.lat.toFixed(6)),
                parseFloat(e.latlng.lng.toFixed(6))
            );
        },
    });
    return null;
}

// Helper component to re-center map when lat/lng changes externally
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], map.getZoom() || 16, { duration: 0.8 });
        }
    }, [lat, lng, map]);
    return null;
}

export default function LocationMapPickerModal({
    show,
    onHide,
    latitude: initialLat,
    longitude: initialLng,
    radius: initialRadius,
    locationName,
    onConfirm,
}: LocationMapPickerModalProps) {
    const [lat, setLat] = useState<number>(initialLat || 14.475685);
    const [lng, setLng] = useState<number>(initialLng || 100.116528);
    const [radius, setRadius] = useState<number>(initialRadius || 100);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLocating, setIsLocating] = useState<boolean>(false);

    useEffect(() => {
        if (show) {
            setLat(initialLat || 14.475685);
            setLng(initialLng || 100.116528);
            setRadius(initialRadius || 100);
        }
    }, [show, initialLat, initialLng, initialRadius]);

    // Handle fetching device current position (GPS)
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            Swal.fire('ข้อผิดพลาด', 'อุปกรณ์ของคุณไม่รองรับการระบุพิกัด GPS', 'warning');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const currentLat = parseFloat(pos.coords.latitude.toFixed(6));
                const currentLng = parseFloat(pos.coords.longitude.toFixed(6));
                setLat(currentLat);
                setLng(currentLng);
                setIsLocating(false);
                Swal.fire({
                    icon: 'success',
                    title: 'ดึงพิกัดจากอุปกรณ์สำเร็จ',
                    text: `พิกัดปัจจุบัน: ${currentLat}, ${currentLng}`,
                    timer: 1600,
                    showConfirmButton: false,
                });
            },
            (err) => {
                setIsLocating(false);
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเข้าถึงพิกัด GPS ได้ โปรดอนุญาตสิทธิ์ Location ในเบราว์เซอร์', 'error');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Parse Google Maps query or coordinate text (e.g., "14.475685, 100.116528" or URL)
    const handleParseCoordinates = () => {
        if (!searchQuery.trim()) return;

        const text = searchQuery.trim();

        // 1. Try URL regex (e.g. google.com/maps?q=14.47,100.11 or @14.47,100.11)
        const urlMatch = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || text.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (urlMatch) {
            setLat(parseFloat(urlMatch[1]));
            setLng(parseFloat(urlMatch[2]));
            setSearchQuery('');
            return;
        }

        // 2. Try raw "lat, lng" coordinates (e.g., 14.475685, 100.116528 or 14.475685 100.116528)
        const coordMatch = text.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
        if (coordMatch) {
            setLat(parseFloat(coordMatch[1]));
            setLng(parseFloat(coordMatch[2]));
            setSearchQuery('');
            return;
        }

        // If it's a place name search, search via Nominatim OpenStreetMap
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text + ' สุพรรณบุรี')}&limit=1`)
            .then((res) => res.json())
            .then((data) => {
                if (data && data.length > 0) {
                    setLat(parseFloat(parseFloat(data[0].lat).toFixed(6)));
                    setLng(parseFloat(parseFloat(data[0].lon).toFixed(6)));
                    setSearchQuery('');
                } else {
                    Swal.fire('ไม่พบตำแหน่ง', 'ไม่พบสถานที่ตามที่ระบุ โปรดลองป้อนเป็นตัวเลขพิกัด ละติจูด, ลองจิจูด', 'info');
                }
            })
            .catch(() => {
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถค้นหาสถานที่ได้', 'error');
            });
    };

    const handleConfirm = () => {
        onConfirm(lat, lng, radius);
        onHide();
    };

    const openInGoogleMaps = () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton className="bg-light">
                <Modal.Title className="fs-16 d-flex align-items-center gap-2">
                    <IconifyIcon icon="tabler:map-pin" className="text-danger fs-20" />
                    แผนที่เลือกพิกัดจัดงาน & กำหนดรัศมีเช็กอิน (Geofencing)
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-3">
                {/* Search & Actions Bar */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                    <InputGroup className="flex-fill" style={{ minWidth: 260 }}>
                        <InputGroup.Text className="bg-white">
                            <IconifyIcon icon="tabler:search" />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="ค้นหาสถานที่ หรือ วางพิกัด Google Maps เช่น 14.475685, 100.116528..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleParseCoordinates()}
                        />
                        <Button variant="primary" onClick={handleParseCoordinates}>
                            ค้นหา/ใช้พิกัด
                        </Button>
                    </InputGroup>

                    <Button
                        variant="success"
                        className="d-flex align-items-center gap-1 shadow-sm text-nowrap"
                        onClick={handleGetCurrentLocation}
                        disabled={isLocating}
                    >
                        <IconifyIcon icon={isLocating ? 'tabler:loader' : 'tabler:current-location'} className={isLocating ? 'spin' : ''} />
                        {isLocating ? 'กำลังดึงพิกัด...' : 'ดึงพิกัดอุปกรณ์ของฉัน (GPS)'}
                    </Button>

                    <Button
                        variant="outline-secondary"
                        className="d-flex align-items-center gap-1 text-nowrap"
                        onClick={openInGoogleMaps}
                        title="เปิดดูตำแหน่งนี้ใน Google Maps"
                    >
                        <IconifyIcon icon="tabler:brand-google-maps" className="text-danger" />
                        เปิดใน Google Maps
                    </Button>
                </div>

                <div className="alert alert-info py-2 px-3 fs-13 mb-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                        <IconifyIcon icon="tabler:hand-click" className="me-1 fs-16 text-primary align-middle" />
                        <strong>คลิกตรงจุดใดก็ได้บนแผนที่</strong> เพื่อปักหมุดย้ายตำแหน่งจัดงานทันที
                    </div>
                    <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-2 py-1">
                        รัศมีเช็กอิน: {radius} เมตร
                    </Badge>
                </div>

                {/* Leaflet Interactive Map */}
                <div className="border rounded-3 overflow-hidden shadow-sm" style={{ height: 380, width: '100%', position: 'relative' }}>
                    <MapContainer
                        center={[lat, lng]}
                        zoom={16}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Recenter helper */}
                        <MapRecenter lat={lat} lng={lng} />

                        {/* Click handler */}
                        <MapClickHandler onLocationSelect={(newLat, newLng) => {
                            setLat(newLat);
                            setLng(newLng);
                        }} />

                        {/* Pinned Marker */}
                        <Marker position={[lat, lng]} icon={pinIcon} />

                        {/* Circular Geofence Radius visualizer */}
                        <Circle
                            center={[lat, lng]}
                            radius={radius}
                            pathOptions={{
                                color: '#465dff',
                                fillColor: '#465dff',
                                fillOpacity: 0.15,
                                weight: 2,
                                dashArray: '4, 6',
                            }}
                        />
                    </MapContainer>
                </div>

                {/* Coordinate Readouts & Radius Adjuster */}
                <div className="p-3 bg-light rounded-3 border mt-3">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-4">
                            <Form.Label className="fs-12 text-muted mb-1">ละติจูด (Latitude)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.000001"
                                value={lat}
                                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="col-md-4">
                            <Form.Label className="fs-12 text-muted mb-1">ลองจิจูด (Longitude)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.000001"
                                value={lng}
                                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        <div className="col-md-4">
                            <Form.Label className="fs-12 text-muted mb-1">ปรับรัศมี Geofencing (เมตร)</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="number"
                                    min="10"
                                    max="5000"
                                    step="10"
                                    value={radius}
                                    onChange={(e) => setRadius(parseInt(e.target.value) || 50)}
                                />
                                <InputGroup.Text>ม.</InputGroup.Text>
                            </InputGroup>
                        </div>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer className="bg-light">
                <Button variant="secondary" onClick={onHide}>
                    ยกเลิก
                </Button>
                <Button variant="primary" onClick={handleConfirm} className="d-flex align-items-center gap-1 shadow">
                    <IconifyIcon icon="tabler:check" /> ยืนยันพิกัดและรัศมีนี้
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
