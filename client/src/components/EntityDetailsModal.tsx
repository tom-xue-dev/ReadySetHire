import type { ReactNode } from "react";
import Modal from "./Modal";
import Card from "./ui/Card";

export type JobEntity = {
  id?: number;
  title: string;
  description?: string;
  requirements?: string;
  location?: string;
  salary?: string;
  status?: string;
  company?: string;
  department?: string;
};

export type ApplicantEntity = {
  id: number;
  firstname: string;
  surname: string;
  emailAddress?: string;
  email_address?: string;
  phoneNumber?: string;
  phone_number?: string;
  resumeText?: string;
  resumeUrl?: string;
};

type Entity = JobEntity | ApplicantEntity;

export default function EntityDetailsModal({
  open,
  onClose,
  entity,
  title,
  headerExtra,
}: {
  open: boolean;
  onClose: () => void;
  entity: Entity | null;
  title?: string;
  headerExtra?: ReactNode;
}) {
  if (!entity) return null;

  const isJob = (e: Entity): e is JobEntity => 'title' in e && !('firstname' in e);
  const isApplicant = (e: Entity): e is ApplicantEntity => 'firstname' in e;

  return (
    <Modal open={open} onClose={onClose} title={title ?? (isJob(entity) ? 'Job Details' : 'Applicant Details')}>
      <div className="space-y-4">
        {headerExtra}
        {isJob(entity) && (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold">{entity.title}</div>
                {entity.company && <div className="text-sm text-gray-600">{entity.company}{entity.location ? ` · ${entity.location}` : ''}</div>}
                {!entity.company && entity.location && <div className="text-sm text-gray-600">{entity.location}</div>}
              </div>
              {entity.status && (
                <span className="px-2 py-1 rounded-full text-xs border bg-gray-50">{entity.status}</span>
              )}
            </div>

            {entity.salary && (
              <div className="text-sm text-gray-700">💰 {entity.salary}</div>
            )}

            {entity.description && (
              <Card className="p-3">
                <div className="text-sm font-medium mb-1">Job Description</div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{entity.description}</p>
              </Card>
            )}

            {entity.requirements && (
              <Card className="p-3">
                <div className="text-sm font-medium mb-1">Requirements</div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{entity.requirements}</p>
              </Card>
            )}
          </div>
        )}

        {isApplicant(entity) && (
          <div className="space-y-3">
            <div className="text-xl font-semibold">{entity.firstname} {entity.surname}</div>
            <div className="text-sm text-gray-700">✉️ {entity.emailAddress || entity.email_address || '—'}</div>
            <div className="text-sm text-gray-700">📞 {entity.phoneNumber || entity.phone_number || '—'}</div>

            {entity.resumeText && (
              <Card className="p-3">
                <div className="text-sm font-medium mb-1">Resume</div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-80 overflow-auto">{entity.resumeText}</p>
              </Card>
            )}

            {entity.resumeUrl && (
              <a href={entity.resumeUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-sm">Open attached resume</a>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}


