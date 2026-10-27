import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';
import { Landing } from './pages/public/Landing';
import { Login } from './pages/public/Login';
import { Directorio } from './pages/public/Directorio';
import { PerfilAbogado } from './pages/public/PerfilAbogado';
import { NotFound } from './pages/public/NotFound';
import { Panel } from './pages/mother/Panel';
import { Ruta } from './pages/mother/Ruta';
import { Asistente } from './pages/mother/Asistente';
import { Expediente } from './pages/mother/Expediente';
import { Gastos } from './pages/mother/Gastos';
import { Marketplace } from './pages/mother/Marketplace';
import { PerfilAbogado as PerfilAbogadoMadre } from './pages/mother/PerfilAbogado';
import { CommandCenter } from './pages/lawyer/CommandCenter';
import { Leads } from './pages/lawyer/Leads';
import { Validation } from './pages/lawyer/Validation';
import { Asistente as LawyerAsistente } from './pages/lawyer/Asistente';
import { ClientDetail } from './pages/lawyer/ClientDetail';
import { Perfil } from './pages/lawyer/Perfil';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
        <Route path="/ingresar" element={<Login />} />
        <Route path="/directorio" element={<PublicLayout><Directorio /></PublicLayout>} />
        <Route path="/directorio/:id" element={<PublicLayout><PerfilAbogado /></PublicLayout>} />
        <Route path="/abogados" element={<Navigate to="/directorio" replace />} />

        <Route path="/madre/panel" element={<AppLayout role="madre"><Panel /></AppLayout>} />
        <Route path="/madre/ruta" element={<AppLayout role="madre"><Ruta /></AppLayout>} />
        <Route path="/madre/asistente" element={<AppLayout role="madre"><Asistente /></AppLayout>} />
        <Route path="/madre/expediente" element={<AppLayout role="madre"><Expediente /></AppLayout>} />
        <Route path="/madre/gastos" element={<AppLayout role="madre"><Gastos /></AppLayout>} />
        <Route path="/madre/abogados" element={<AppLayout role="madre"><Marketplace /></AppLayout>} />
        <Route path="/madre/abogados/:id" element={<AppLayout role="madre"><PerfilAbogadoMadre /></AppLayout>} />

        <Route path="/abogado" element={<AppLayout role="abogado"><CommandCenter /></AppLayout>} />
        <Route path="/abogado/adquisicion" element={<AppLayout role="abogado"><Leads /></AppLayout>} />
        <Route path="/abogado/validacion" element={<AppLayout role="abogado"><Validation /></AppLayout>} />
        <Route path="/abogado/asistente" element={<AppLayout role="abogado"><LawyerAsistente /></AppLayout>} />
        <Route path="/abogado/perfil" element={<AppLayout role="abogado"><Perfil /></AppLayout>} />
        <Route path="/abogado/clienta/:id" element={<AppLayout role="abogado"><ClientDetail /></AppLayout>} />

        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </HashRouter>
  );
}
