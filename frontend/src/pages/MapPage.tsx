import React, { useEffect } from 'react';
import AncestralMapSection from '../components/Home/AncestralMapSection';

const MapPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      <AncestralMapSection id="map-page" isStandalonePage={true} />
    </div>
  );
};

export default MapPage;
