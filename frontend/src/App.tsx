import { useState } from 'react';
import { AlertsSection } from './components/AlertsSection';
import { AltaNegocio } from './components/AltaNegocio';
import { BusinessSection } from './components/BusinessSection';
import { CitizenSection } from './components/CitizenSection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ImpactSection } from './components/ImpactSection';
import { MapSection } from './components/MapSection';
import { MethodModal } from './components/MethodModal';
import { Kp as PacksSection } from './equipo/packs';
import { useDatos } from './state';

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function App() {
  const { hoy: HOY } = useDatos();
  const [fecha, setFecha] = useState(HOY);
  const [sel, setSel] = useState<string | null>(null);
  const [method, setMethod] = useState(false);
  const [alertFor, setAlertFor] = useState<string | null>(null);

  const pick = (id: string) => {
    setSel(id);
    scrollTo('mapa');
  };
  const alert = (id: string) => {
    setAlertFor(id);
    scrollTo('avisos');
  };
  const openMethod = () => setMethod(true);

  return (
    <>
      <Header onMethod={openMethod} />
      <main>
        <Hero
          onPick={(id) => {
            setFecha(HOY);
            pick(id);
          }}
          onMethod={openMethod}
        />
        <MapSection fecha={fecha} onFecha={setFecha} sel={sel} onSel={setSel} onMethod={openMethod} onAlert={alert} />
        <PacksSection fecha={fecha} onPick={pick} />
        <AlertsSection preselect={alertFor} />
        <CitizenSection />
        <ImpactSection />
        <BusinessSection />
        <AltaNegocio />
      </main>
      <Footer onMethod={openMethod} />
      <MethodModal open={method} onClose={() => setMethod(false)} />
    </>
  );
}
