import { LawyerBrowser } from '../../components/lawyers/LawyerBrowser';
import { lawyers } from '../../data/lawyers';

export function Directorio() {
  return (
    <div className="bg-canvas py-16">
      <div className="page-shell">
        <div className="flex flex-col items-start gap-3">
          <h1 className="font-serif text-4xl font-medium text-ink sm:text-[40px]">
            Abogados de alimentos en Arequipa
          </h1>
          <p className="max-w-2xl text-[#475569]">
            Los {lawyers.length} tienen colegiatura verificada en el CAA y cobran por hitos, así sabes qué
            pagas y cuándo.
          </p>
        </div>

        <div className="mt-8">
          <LawyerBrowser mode="public" />
        </div>
      </div>
    </div>
  );
}
