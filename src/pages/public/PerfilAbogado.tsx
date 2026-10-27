import { LawyerProfileView } from '../../components/lawyers/LawyerProfileView';

export function PerfilAbogado() {
  return (
    <div className="bg-canvas px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-[1240px]">
        <LawyerProfileView mode="public" />
      </div>
    </div>
  );
}
