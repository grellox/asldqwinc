import { LawyerBrowser } from '../../components/lawyers/LawyerBrowser';

export function Directorio() {
  return (
    <div className="bg-canvas px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-col items-start gap-3">
          <h1 className="font-serif text-4xl font-medium text-ink sm:text-[40px]">
            Encuentra a tu abogado en Arequipa
          </h1>
          <p className="max-w-2xl text-[#475569]">
            Todos los abogados de este directorio están verificados por el Colegio de Abogados de Arequipa y
            trabajan por hitos, para que sepas exactamente qué estás pagando.
          </p>
        </div>

        <div className="mt-8">
          <LawyerBrowser mode="public" />
        </div>
      </div>
    </div>
  );
}
