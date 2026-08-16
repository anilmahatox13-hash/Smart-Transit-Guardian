import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    fleet: 'Fleet Radar',
    liveMap: 'Live Map',
    driverConsole: 'Driver Console',
    adminHub: 'Admin Hub',
    searchBus: 'Search bus name or number...',
    origin: 'Starting Point (Origin)',
    destination: 'Destination Point',
    filterRegion: 'Filter State / Region',
    allRegions: 'All States / Regions',
    rateDriver: 'Rate Driver',
    submitRating: 'Submit Feedback',
    driverAbsent: 'Primary Driver Absent (Substitute Assigned)',
    seats: 'seats',
    activeBuses: 'Active Buses',
    totalFleet: 'Total Fleet',
    sosAlert: 'Trigger SOS Alert',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    logout: 'Log out',
    phoneOrEmail: 'Email or Mobile Phone Number',
    password: 'Password',
    otpCode: '6-Digit OTP Code',
    verify: 'Verify & Sign In',
    addBus: 'Add New Bus',
    editBus: 'Modify Bus & Driver Assignment'
  },
  hi: {
    fleet: 'फ्लीट रडार',
    liveMap: 'लाइव मानचित्र',
    driverConsole: 'ड्राइवर कंसोल',
    adminHub: 'व्यवस्थापक हब',
    searchBus: 'बस का नाम या नंबर खोजें...',
    origin: 'शुरुआती स्थान (मूल)',
    destination: 'गंतव्य स्थान',
    filterRegion: 'राज्य/क्षेत्र चुनें',
    allRegions: 'सभी राज्य / क्षेत्र',
    rateDriver: 'ड्राइवर को रेटिंग दें',
    submitRating: 'प्रतिक्रिया जमा करें',
    driverAbsent: 'प्राथमिक ड्राइवर अनुपस्थित (प्रतिस्थापन चालक तैनात)',
    seats: 'सीटें',
    activeBuses: 'सक्रिय बसें',
    totalFleet: 'कुल बसें',
    sosAlert: 'आपातकालीन एसओएस',
    signIn: 'साइन इन करें',
    signUp: 'साइन अप करें',
    logout: 'लॉग आउट',
    phoneOrEmail: 'ईमेल या मोबाइल नंबर',
    password: 'पासवर्ड',
    otpCode: '6-अंकीय ओटीपी',
    verify: 'सत्यापित करें और आगे बढ़ें',
    addBus: 'नई बस जोड़ें',
    editBus: 'बस और ड्राइवर बदलें'
  },
  ne: {
    fleet: 'बस फ्लीट रडार',
    liveMap: 'प्रत्यक्ष नक्सा',
    driverConsole: 'चालक कन्सोल',
    adminHub: 'प्रशासक हब',
    searchBus: 'बस नम्बर वा नाम खोज्नुहोस्...',
    origin: 'सुरुवाती स्थान (प्रस्थान)',
    destination: 'गन्तव्य स्थान',
    filterRegion: 'प्रदेश / क्षेत्र छान्नुहोस्',
    allRegions: 'सबै प्रदेश र क्षेत्रहरू',
    rateDriver: 'चालकलाई मूल्याङ्कन दिनुहोस्',
    submitRating: 'प्रतिक्रिया पठाउनुहोस्',
    driverAbsent: 'मुख्य चालक अनुपस्थित (वैकल्पिक चालक खटाइएको)',
    seats: 'सिटहरू',
    activeBuses: 'सञ्चालनमा रहेका बसहरू',
    totalFleet: 'जम्मा बसहरू',
    sosAlert: 'आपतकालीन SOS',
    signIn: 'लग-इन गर्नुहोस्',
    signUp: 'साइन अप गर्नुहोस्',
    logout: 'लग आउट',
    phoneOrEmail: 'इमेल वा मोबाइल नम्बर',
    password: 'पासवर्ड',
    otpCode: '६-अङ्कको OTP कोड',
    verify: 'प्रमाणीकरण गर्नुहोस्',
    addBus: 'नयाँ बस थप्नुहोस्',
    editBus: 'बस र चालक विवरण बदल्नुहोस्'
  },
  es: {
    fleet: 'Radar de Flota',
    liveMap: 'Mapa en Vivo',
    driverConsole: 'Consola Conductor',
    adminHub: 'Panel Admin',
    searchBus: 'Buscar autobús...',
    origin: 'Punto de Origen',
    destination: 'Destino',
    filterRegion: 'Filtrar Región',
    allRegions: 'Todas las Regiones',
    rateDriver: 'Calificar Conductor',
    submitRating: 'Enviar Calificación',
    driverAbsent: 'Conductor Ausente (Sustituto Asignado)',
    seats: 'asientos',
    activeBuses: 'Autobuses Activos',
    totalFleet: 'Flota Total',
    sosAlert: 'Alerta SOS',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    logout: 'Cerrar Sesión',
    phoneOrEmail: 'Correo o Número Telefónico',
    password: 'Contraseña',
    otpCode: 'Código OTP de 6 dígitos',
    verify: 'Verificar y Entrar',
    addBus: 'Agregar Autobús',
    editBus: 'Modificar Autobús'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('transit_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('transit_lang', lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);