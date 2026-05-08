import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Line, Marker } from 'react-simple-maps';

// إحداثيات افتراضية لنقاطنا (Nodes)
const geoNodes = [
  { name: "Sana'a Node", coordinates: [44.2074, 15.3694] as [number, number], id: "YE_01" },
  { name: "Frankfurt Core", coordinates: [8.6821, 50.1109] as [number, number], id: "DE_01" },
  { name: "NY Gateway", coordinates: [-74.006, 40.7128] as [number, number], id: "US_01" },
  { name: "Tokyo Link", coordinates: [139.6917, 35.6895] as [number, number], id: "JP_01" }
];

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const GlobalNetworkMap: React.FC = () => {
  // محاكاة الـ API Connector لنبض البيانات
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#020617]/50 rounded-3xl border border-emerald-500/20 p-4 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-4 left-6 z-10">
        <h2 className="text-emerald-400 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
          Live_Network_Traffic_Stream
        </h2>
      </div>

      <ComposableMap projectionConfig={{ scale: 140 }} className="w-full h-auto max-h-[400px]">
        <Geographies geography={geoUrl}> 
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#0f172a"
                stroke="#10b981"
                strokeWidth={0.2}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#1e293b", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* رسم مسارات الأنفاق (Tunnels) */}
        {/* من صنعاء إلى فرانكفورت */}
        <Line
          from={geoNodes[0].coordinates}
          to={geoNodes[1].coordinates}
          stroke="#34d399"
          strokeWidth={pulse ? 1.5 : 0.5}
          strokeDasharray="4 2"
          className="transition-all duration-1000 ease-in-out opacity-60"
        />
        {/* من فرانكفورت إلى نيويورك */}
        <Line
          from={geoNodes[1].coordinates}
          to={geoNodes[2].coordinates}
          stroke="#34d399"
          strokeWidth={pulse ? 1.5 : 0.5}
          strokeDasharray="4 2"
          className="transition-all duration-1000 ease-in-out opacity-60"
        />
        {/* من فرانكفورت إلى طوكيو */}
        <Line
          from={geoNodes[1].coordinates}
          to={geoNodes[3].coordinates}
          stroke="#34d399"
          strokeWidth={pulse ? 1.5 : 0.5}
          strokeDasharray="4 2"
          className="transition-all duration-1000 ease-in-out opacity-60"
        />

        {/* نقاط الـ Nodes المتوهجة */}
        {geoNodes.map(({ name, coordinates, id }) => (
          <Marker key={id} coordinates={coordinates}>
            <circle r={4} fill="#10b981" className="animate-ping opacity-75" />
            <circle r={2} fill="#34d399" />
            <text
              textAnchor="middle"
              y={-10}
              className="fill-emerald-400 font-mono text-[6px] pointer-events-none uppercase tracking-widest drop-shadow-[0_0_2px_#000]"
            >
              {name}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      <div className="mt-4 flex gap-4 justify-center border-t border-emerald-500/10 pt-4 relative z-10">
         <div className="text-[10px] font-mono text-emerald-500/50">
           ACTIVE_TUNNELS: <span className="text-emerald-400">12_SECURE</span>
         </div>
         <div className="text-[10px] font-mono text-emerald-500/50">
           ENCRYPTION: <span className="text-emerald-400">XTLS_REALITY_VISION</span>
         </div>
         <div className="text-[10px] font-mono text-emerald-500/50">
           PACKET_LOSS: <span className="text-emerald-400">0.0%</span>
         </div>
      </div>
    </div>
  );
};

export default GlobalNetworkMap;
