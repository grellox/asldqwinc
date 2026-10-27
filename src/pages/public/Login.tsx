import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import type { Role } from '../../types';

const demoCredentials: Record<'madre' | 'abogado', { email: string; password: string }> = {
  madre: { email: 'maria.torres@ejemplo.com', password: 'Syloop2026' },
  abogado: { email: 'carmen.valdivia@ejemplo.com', password: 'Syloop2026' },
};

const benefits: Record<'madre' | 'abogado', string[]> = {
  madre: [
    'Sigue tu expediente en tiempo real, sincronizado con el CEJ',
    'Habla con un abogado verificado del Colegio de Abogados de Arequipa',
    'Entiende cada paso de tu proceso en lenguaje claro',
  ],
  abogado: [
    'Recibe nuevas clientas verificadas en tu zona',
    'Valida las respuestas de la IA antes de enviarlas',
    'Cobra por hitos, sin gestionar cobranzas tú misma',
  ],
};

export function Login() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const pendingRequestLawyerId = useAppStore((s) => s.pendingRequestLawyerId);
  const setPendingRequestLawyer = useAppStore((s) => s.setPendingRequestLawyer);

  const [selectedRole, setSelectedRole] = useState<'madre' | 'abogado'>('madre');
  const [mode, setMode] = useState<'ingresar' | 'crear'>('ingresar');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(demoCredentials.madre.email);
  const [password, setPassword] = useState(demoCredentials.madre.password);
  const [caaNumber, setCaaNumber] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  function validate(): string {
    if (!email.includes('@') || email.length < 5) return 'Ingresa un correo electrónico válido.';
    if (password.length < 8) return 'La contraseña debe tener 8 caracteres o más.';
    if (mode === 'crear') {
      if (!name.trim()) return 'Ingresa tu nombre completo.';
      if (!acceptedTerms) return 'Debes aceptar el tratamiento de datos (Ley N.º 29733).';
      if (selectedRole === 'abogado' && !caaNumber.trim()) return 'Ingresa tu número de colegiatura del CAA.';
    }
    return '';
  }

  /** A visitor who came from "Solicitar asesoría" resumes on that lawyer's profile. */
  function routeAfterLogin() {
    if (selectedRole !== 'madre') {
      setPendingRequestLawyer(null);
      return '/abogado';
    }
    return pendingRequestLawyerId ? `/madre/abogados/${pendingRequestLawyerId}` : '/madre/panel';
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    const displayName = name.trim() || (selectedRole === 'madre' ? 'María Torres' : 'Dra. Carmen Valdivia');
    login(displayName, selectedRole as Role);
    navigate(routeAfterLogin());
  }

  function handleRoleChange(role: 'madre' | 'abogado') {
    setSelectedRole(role);
    if (mode === 'ingresar') {
      setEmail(demoCredentials[role].email);
      setPassword(demoCredentials[role].password);
    }
  }

  function handleModeChange(nextMode: 'ingresar' | 'crear') {
    setMode(nextMode);
    setError('');
    if (nextMode === 'ingresar') {
      setEmail(demoCredentials[selectedRole].email);
      setPassword(demoCredentials[selectedRole].password);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setCaaNumber('');
      setAcceptedTerms(false);
    }
  }

  function handleGoogle() {
    setGoogleLoading(true);
    setTimeout(() => {
      const displayName = selectedRole === 'madre' ? 'María Torres' : 'Dra. Carmen Valdivia';
      login(displayName, selectedRole as Role);
      setGoogleLoading(false);
      navigate(routeAfterLogin());
    }, 900);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="grid flex-1 lg:grid-cols-2">
        <div className="hidden flex-col bg-ink p-10 lg:flex">
          <Link to="/">
            <Logo variant="light" />
          </Link>
          <div className="flex flex-1 flex-col justify-center">
            <p className="font-serif text-3xl font-medium leading-tight text-white">
              Devolvemos el tiempo <span className="text-sky">a la justicia</span>
            </p>
            <ul className="mt-8 flex flex-col gap-4">
              {benefits[selectedRole].map((b) => (
                <li key={b} className="flex items-start gap-3 text-[15px] text-[#CBD5E1]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky/20 text-sky">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <Link to="/">
                <Logo />
              </Link>
            </div>
            <h1 className="font-serif text-2xl font-medium text-ink">Te damos la bienvenida</h1>

          <div className="mt-5 inline-flex w-full rounded-full bg-[#F1F5F9] p-1" role="group" aria-label="Elige tu rol">
            <button
              type="button"
              onClick={() => handleRoleChange('madre')}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                selectedRole === 'madre' ? 'bg-white text-ink shadow-sm' : 'text-[#475569]'
              }`}
            >
              Soy madre
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('abogado')}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                selectedRole === 'abogado' ? 'bg-white text-ink shadow-sm' : 'text-[#475569]'
              }`}
            >
              Soy abogado
            </button>
          </div>

          <div className="mt-5 flex gap-5 border-b border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => handleModeChange('ingresar')}
              className={`-mb-px border-b-2 px-1 py-2 text-sm font-semibold ${
                mode === 'ingresar' ? 'border-ink text-ink' : 'border-transparent text-[#475569]'
              }`}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('crear')}
              className={`-mb-px border-b-2 px-1 py-2 text-sm font-semibold ${
                mode === 'crear' ? 'border-ink text-ink' : 'border-transparent text-[#475569]'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            {mode === 'crear' && (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-link">Nombre completo</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombres y apellidos"
                  className="min-h-[44px] rounded-[10px] border border-[#E2E8F0] px-3.5 text-[15px] focus-visible:focus-ring"
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-link">Correo electrónico</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="min-h-[44px] rounded-[10px] border border-[#E2E8F0] px-3.5 text-[15px] focus-visible:focus-ring"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-link">Contraseña</span>
              <span className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caracteres o más"
                  className="min-h-[44px] w-full rounded-[10px] border border-[#E2E8F0] px-3.5 pr-11 text-[15px] focus-visible:focus-ring"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 flex h-6 w-6 items-center justify-center text-[#475569]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            {mode === 'crear' && selectedRole === 'abogado' && (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-link">N.º de colegiatura (CAA)</span>
                <input
                  type="text"
                  value={caaNumber}
                  onChange={(e) => setCaaNumber(e.target.value)}
                  placeholder="CAA N.º 1234"
                  className="min-h-[44px] rounded-[10px] border border-[#E2E8F0] px-3.5 text-[15px] focus-visible:focus-ring"
                />
              </label>
            )}

            {mode === 'crear' && (
              <label className="flex items-start gap-2.5 text-sm text-[#475569]">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#CBD5E1] text-brand focus-visible:focus-ring"
                />
                Acepto el tratamiento de mis datos personales conforme a la Ley N.º 29733.
              </label>
            )}

            {mode === 'ingresar' && (
              <p className="text-xs text-[#475569]">Cuenta de demostración precargada — solo pulsa "Ingresar".</p>
            )}

            {mode === 'ingresar' && (
              <div className="text-right">
                <button type="button" className="text-sm font-medium text-link hover:underline">
                  ¿La olvidaste?
                </button>
              </div>
            )}

            {error && <p className="text-sm font-medium text-danger-text">{error}</p>}

            <Button type="submit" variant="primary" className="w-full">
              {mode === 'ingresar' ? 'Ingresar' : 'Crear cuenta'}
            </Button>

            <div className="flex items-center gap-3 text-xs text-[#475569]">
              <span className="h-px flex-1 bg-[#E2E8F0]" />
              o
              <span className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            <Button type="button" variant="secondary" className="w-full" onClick={handleGoogle} disabled={googleLoading}>
              {googleLoading ? 'Conectando…' : 'Continuar con Google'}
            </Button>
          </form>
          </div>
        </div>
      </main>
    </div>
  );
}
