import React, { createContext, useContext, useState, useEffect } from 'react';
import { REGION_DATA } from '../data/regions';

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
  const [country, setCountry] = useState(() => localStorage.getItem('transit_country') || 'Nepal');
  const [province, setProvince] = useState(() => localStorage.getItem('transit_province') || 'Bagmati Province');
  const [district, setDistrict] = useState(() => localStorage.getItem('transit_district') || 'Kathmandu');

  useEffect(() => {
    localStorage.setItem('transit_country', country);
    localStorage.setItem('transit_province', province);
    localStorage.setItem('transit_district', district);
  }, [country, province, district]);

  const changeCountry = (newCountry) => {
    setCountry(newCountry);
    const firstProv = Object.keys(REGION_DATA[newCountry]?.provinces || {})[0] || 'all';
    setProvince(firstProv);
    const firstDist = REGION_DATA[newCountry]?.provinces[firstProv]?.[0] || 'all';
    setDistrict(firstDist);
  };

  const currency = REGION_DATA[country]?.currency || 'NPR';
  const flag = REGION_DATA[country]?.flag || '🇳🇵';

  return (
    <RegionContext.Provider value={{
      country,
      province,
      district,
      currency,
      flag,
      setCountry: changeCountry,
      setProvince,
      setDistrict
    }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => useContext(RegionContext);