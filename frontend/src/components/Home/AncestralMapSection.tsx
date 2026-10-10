import React, { useState, useEffect, useRef } from 'react';
import { Landmark, MapPin, Navigation, Copy, Check, Layers, LucideIcon, ZoomIn, ZoomOut } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icon lăng mộ / bia tháp tưởng niệm tiền nhân thiết kế chuyên biệt
const TombIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21h18" />
    <path d="M5 18h14" />
    <path d="M7 18V9a5 5 0 0 1 10 0v9" />
    <path d="M12 6.5V3.5" />
    <path d="M10 13h4" />
    <path d="M12 11v4" />
  </svg>
);

interface LocationInfo {
  id: 'nha-tho' | 'con-giua';
  name: string;
  shortName: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
  icon: LucideIcon | React.ComponentType<{ size?: number; className?: string }>;
  badge: string;
}

const LOCATIONS: LocationInfo[] = [
  {
    id: 'nha-tho',
    name: 'Nhà Thờ Họ Lê Văn',
    shortName: 'Nhà Thờ Họ Lê Văn',
    description:
      'Từ đường họ Lê Văn là chốn linh thiêng quy tụ hương hỏa và hồn thiêng sông núi của dòng tộc tại làng An Lợi. Nơi đây diễn ra các kỳ tế lễ, giỗ chạp truyền thống trang trọng để con cháu tưởng nhớ và tri nhân công đức trời biển của các bậc tiền nhân. Hằng năm, nhà thờ là điểm hẹn tâm linh ấm áp, kết nối tình thân tộc của muôn đời con cháu Chi 2 - Phái 4 dù sinh sống tại quê nhà hay lập nghiệp khắp muôn phương.',
    lat: 16.825772,
    lng: 107.141450,
    address: 'Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị',
    icon: Landmark,
    badge: 'Chốn Từ Đường Thiêng Liêng',
  },
  {
    id: 'con-giua',
    name: 'Lăng Mộ Chi 2 - Phái 4 - Họ Lê Văn',
    shortName: 'Lăng Mộ Chi 2 - Phái 4 - Họ Lê Văn',
    description:
      'Khu lăng mộ tọa lạc tại vùng đất Cồn Giữa yên bình, là nơi an nghỉ thiên thu của các bậc tiền nhân dòng tộc. Nơi đây quy tụ phần mộ của Ngài Thủy tổ Lê Văn Khôi, Cụ bà Phan Thị Mưu cùng 88 vị tiền nhân liệt tổ liệt tông qua nhiều thế hệ của dòng họ. Mỗi nén hương dâng lên là lòng hiếu kính thiêng liêng, nhắc nhở con cháu hôm nay và mai sau luôn khắc ghi đạo lý uống nước nhớ nguồn.',
    lat: 16.830898,
    lng: 107.144187,
    address: 'Cồn Giữa, Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị',
    icon: TombIcon,
    badge: 'Nơi An Nghỉ Của Tiền Nhân',
  },
];

// Tạo marker SVG tuỳ biến cho bản đồ Leaflet
const createCustomMarkerIcon = (isSelected: boolean, isTomb: boolean, label: string) => {
  const bgClass = isSelected ? '#8B0000' : '#5A1A1A';
  const borderColor = isSelected ? '#FBBF24' : '#FFFFFF';
  const iconSvg = isTomb
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 18h14"/><path d="M7 18V9a5 5 0 0 1 10 0v9"/><path d="M12 6.5V3.5"/><path d="M10 13h4"/><path d="M12 11v4"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="22" x2="22" y2="22"></line><line x1="6" y1="18" x2="6" y2="11"></line><line x1="10" y1="18" x2="10" y2="11"></line><line x1="14" y1="18" x2="14" y2="11"></line><line x1="18" y1="18" x2="18" y2="11"></line><polygon points="12 2 20 7 4 7"></polygon></svg>`;

  const pulseEffect = isSelected
    ? `<span style="position: absolute; top: -4px; right: -4px; display: flex; width: 14px; height: 14px;">
        <span style="animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; background-color: #FBBF24; opacity: 0.75;"></span>
        <span style="position: relative; display: inline-flex; border-radius: 9999px; height: 14px; width: 14px; background-color: #F59E0B; border: 2px solid white;"></span>
       </span>`
    : '';

  return L.divIcon({
    className: 'custom-ancestral-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer; user-select: none;">
        <div style="background-color: ${bgClass}; border: 3px solid ${borderColor}; box-shadow: 0 8px 20px rgba(0,0,0,0.5); width: 40px; height: 40px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">
          ${iconSvg}
          ${pulseEffect}
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${bgClass}; margin-top: -1px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));"></div>
        <div style="margin-top: 4px; background: rgba(17, 24, 39, 0.88); color: #FFF; padding: 2.5px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; white-space: nowrap; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
          ${label}
        </div>
      </div>
    `,
    iconSize: [40, 64],
    iconAnchor: [0, 0],
    popupAnchor: [0, -56],
  });
};

interface AncestralMapProps {
  id?: string;
  isStandalonePage?: boolean;
}

const AncestralMapSection: React.FC<AncestralMapProps> = ({ id = 'map', isStandalonePage = false }) => {
  const [selectedLocationId, setSelectedLocationId] = useState<'nha-tho' | 'con-giua'>('nha-tho');
  const [copied, setCopied] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const currentLocation = LOCATIONS.find((loc) => loc.id === selectedLocationId) || LOCATIONS[0];
  const coordString = `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`;

  const handleCopyCoords = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(coordString);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = coordString;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Không thể sao chép tọa độ:', err);
    }
  };

  // Khởi tạo bản đồ Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentLocation.lat, currentLocation.lng],
      zoom: 17,
      maxZoom: 20,
      minZoom: 6,
      scrollWheelZoom: true, // Cuộn chuột trực tiếp không cần phím Ctrl!
      zoomControl: false,
    });

    // Lớp ảnh vệ tinh Google Hybrid sắc nét (ảnh thực tế + tên đường / làng thôn)
    const googleHybridLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '© Google Maps',
    });
    googleHybridLayer.addTo(map);

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Cập nhật vị trí và markers khi chuyển tab địa điểm
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Xoá các marker cũ
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Tạo marker cho cả 2 địa điểm trên bản đồ
    LOCATIONS.forEach((loc) => {
      const isSelected = loc.id === selectedLocationId;
      const isTomb = loc.id === 'con-giua';
      const icon = createCustomMarkerIcon(isSelected, isTomb, loc.shortName);

      const marker = L.marker([loc.lat, loc.lng], { icon })
        .addTo(map);

      marker.on('click', () => {
        setSelectedLocationId(loc.id);
      });

      markersRef.current[loc.id] = marker;
    });

    // Bay mượt mà tới vị trí đã chọn
    map.flyTo([currentLocation.lat, currentLocation.lng], 17, {
      duration: 1.2,
    });
  }, [selectedLocationId]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetCenter = () => {
    mapInstanceRef.current?.flyTo([currentLocation.lat, currentLocation.lng], 17, { duration: 0.8 });
  };

  // Đường link chỉ đường GPS mở Google Maps trên thiết bị
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${currentLocation.lat},${currentLocation.lng}`;

  return (
    <section id={id} className={`pt-8 sm:pt-10 pb-12 sm:pb-16 bg-cream scroll-mt-20 ${isStandalonePage ? 'min-h-[calc(100vh-4rem)]' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề mục: Trình bày đồng nhất hoàn toàn với mục Tư liệu & Sự kiện */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-1.5 sm:mb-2">
            Vị Trí Từ Đường & Mộ Phần Dòng Họ
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-2">
            Thôn An Lợi, Xã Triệu Bình, Tỉnh Quảng Trị — nơi phụng tự tổ tiên và lưu dấu nguồn cội muôn đời của con cháu Họ Lê Văn - Phái 4 - Chi 2.
          </p>
          <div className="w-16 h-1 bg-primary"></div>
        </div>

        {/* Tab chuyển đổi địa điểm */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-4 mb-6 sm:mb-8">
          {LOCATIONS.map((loc) => {
            const isSelected = loc.id === selectedLocationId;
            const IconComponent = loc.icon;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocationId(loc.id)}
                className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
                  isSelected
                    ? 'bg-primary text-white shadow-md scale-[1.01] sm:scale-105 border-2 border-primary ring-2 ring-primary/20'
                    : 'bg-white text-gray-700 hover:bg-amber-50/70 border border-gray-200 hover:border-primary/40'
                }`}
              >
                <IconComponent size={18} className={isSelected ? 'text-secondary' : 'text-primary'} />
                <span>{loc.name}</span>
              </button>
            );
          })}
        </div>

        {/* Khung nội dung chính: Cột thông tin bên trái (nhỏ gọn) + Cột bản đồ vệ tinh bên phải (rộng) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          
          {/* Cột thông tin chi tiết */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-md border border-amber-100 p-4 sm:p-5 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Huy hiệu nhận diện */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-primary text-[11px] font-bold">
                <currentLocation.icon size={13} className="text-primary flex-shrink-0" />
                <span>{currentLocation.badge}</span>
              </div>

              {/* Tên địa điểm */}
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                {currentLocation.name}
              </h3>

              {/* Đoạn văn chú dẫn hoàn chỉnh */}
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed text-justify">
                {currentLocation.description}
              </p>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
                {/* Địa chỉ thực tế */}
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Địa chỉ: </span>
                    <span className="leading-relaxed">{currentLocation.address}</span>
                  </div>
                </div>

                {/* Tọa độ GPS */}
                <div className="flex items-start gap-2 text-gray-700">
                  <Navigation size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-gray-900">GPS: </span>
                    <span className="font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-800 font-medium">
                      {coordString}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCoords}
                      title="Sao chép tọa độ GPS"
                      className="inline-flex items-center gap-0.5 text-xs text-primary hover:text-primary-dark font-medium underline transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check size={13} className="text-green-600" />
                          <span className="text-green-600">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Nút hành động duy nhất: Chỉ đường về tận nơi */}
            <div className="pt-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-3 rounded-xl text-center text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <Navigation size={16} className="text-secondary" />
                <span>Chỉ đường về tận nơi</span>
              </a>
            </div>
          </div>

          {/* Cột Bản đồ tương tác trực tiếp (Leaflet vệ tinh) */}
          <div className="lg:col-span-9 flex flex-col">
            <div className="relative bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden flex-1 min-h-[480px] sm:min-h-[520px] md:min-h-[580px] flex flex-col">
              
              {/* Thanh điều khiển trên đầu bản đồ */}
              <div className="bg-gradient-to-r from-red-950 to-primary-dark text-white px-4 py-2.5 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-secondary">
                  <MapPin size={16} />
                  <span className="truncate max-w-[260px] sm:max-w-none">{currentLocation.shortName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-black/35 px-3 py-1 rounded-lg text-xs font-semibold text-secondary border border-yellow-500/20">
                    <Layers size={13} />
                    <span>Bản đồ Vệ tinh</span>
                  </div>
                </div>
              </div>

              {/* Khung bản đồ tương tác trực tiếp
                  - Khi đưa chuột vào khung: cuộn chuột trực tiếp thu phóng bản đồ (không cần Ctrl)
                  - Khi đưa chuột ra ngoài: cuộn chuột cuộn trang web bình thường */}
              <div 
                className="relative flex-1 w-full h-full min-h-[440px] bg-gray-900 isolate z-0 overflow-hidden"
                onMouseEnter={() => {
                  mapInstanceRef.current?.scrollWheelZoom.enable();
                }}
                onMouseLeave={() => {
                  mapInstanceRef.current?.scrollWheelZoom.disable();
                }}
              >
                <div 
                  ref={mapContainerRef} 
                  className="w-full h-full min-h-[440px] z-0" 
                  style={{ minHeight: '460px' }} 
                />

                {/* Các nút điều khiển thu phóng trực tiếp trên góc phải dưới của bản đồ */}
                <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 shadow-lg">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    title="Phóng to bản đồ"
                    className="w-9 h-9 bg-white/95 hover:bg-white text-gray-800 rounded-lg flex items-center justify-center font-bold text-lg shadow border border-gray-200 transition-all active:scale-95 hover:text-primary"
                  >
                    <ZoomIn size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    title="Thu nhỏ bản đồ"
                    className="w-9 h-9 bg-white/95 hover:bg-white text-gray-800 rounded-lg flex items-center justify-center font-bold text-lg shadow border border-gray-200 transition-all active:scale-95 hover:text-primary"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCenter}
                    title="Căn giữa vị trí đang chọn"
                    className="w-9 h-9 bg-white/95 hover:bg-white text-primary rounded-lg flex items-center justify-center shadow border border-gray-200 transition-all active:scale-95"
                  >
                    <MapPin size={17} />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AncestralMapSection;
