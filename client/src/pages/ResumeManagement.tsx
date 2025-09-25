import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, SparklesIcon, XMarkIcon, DocumentTextIcon, ChartBarIcon, ArrowDownTrayIcon, PlusIcon, ArrowsUpDownIcon, CheckCircleIcon, TrashIcon, EnvelopeIcon, TagIcon, UserGroupIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import Card from '../components/ui/Card';
import ScoreBadge from '../components/ui/ScoreBadge';
import { useFilteredCandidates, useSortedCandidates, type Candidate } from '../hooks/useCandidates';

// Mock candidate data
const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'c_001',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    phone: '+61 412 345 678',
    role: 'Frontend Engineer',
    source: 'LinkedIn',
    experience: 3,
    location: 'Brisbane',
    tags: ['React', 'TypeScript', 'Tailwind'],
    updatedAt: '2025-09-20',
    score: 86,
    rationale: 'Strong overlap with JD: React + TS + testing. Missing SSR experience.',
    status: 'New',
  },
  {
    id: 'c_002',
    name: 'Wei Chen',
    email: 'wei.chen@example.com',
    phone: '+61 430 000 111',
    role: 'Fullstack Engineer',
    source: 'Referral',
    experience: 5,
    location: 'Sydney',
    tags: ['Node.js', 'PostgreSQL', 'React'],
    updatedAt: '2025-09-22',
    score: 73,
    rationale: 'Good backend depth; frontend acceptable; lacks design system experience.',
    status: 'Screening',
  },
  {
    id: 'c_003',
    name: 'Priya Patel',
    email: 'priya.p@example.com',
    phone: '+61 450 777 888',
    role: 'Frontend Engineer',
    source: 'Careers Page',
    experience: 4,
    location: 'Melbourne',
    tags: ['React', 'Jest', 'Accessibility'],
    updatedAt: '2025-09-18',
    score: 92,
    rationale: 'Excellent match incl. a11y, testing, performance. Great portfolio.',
    status: 'Shortlisted',
  },
  {
    id: 'c_004',
    name: 'Liam Smith',
    email: 'liam.smith@example.com',
    phone: '+61 498 333 222',
    role: 'Frontend Engineer',
    source: 'Indeed',
    experience: 2,
    location: 'Brisbane',
    tags: ['Vue', 'React'],
    updatedAt: '2025-09-12',
    score: 58,
    rationale: 'Entry-level; needs mentorship; some React exposure via side projects.',
    status: 'New',
  },
];

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <Chip key={t}>{t}</Chip>
      ))}
    </div>
  );
}

function DetailDrawer({ open, onClose, cand }: { open: boolean; onClose: () => void; cand: Candidate | null }) {
  if (!open || !cand) return null;
  return (
    <div className="fixed inset-0 flex justify-end z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-xl h-full bg-white border-l border-gray-200 shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{cand.name}</h3>
            <p className="text-sm text-gray-500">{cand.role} · {cand.location}</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-gray-600"><XMarkIcon className="w-5 h-5"/></Button>
        </div>
        <div className="p-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChartBarIcon className="w-4 h-4"/>
                <ScoreBadge score={cand.score} />
              </div>
              <Chip>Updated {cand.updatedAt}</Chip>
            </div>
            <div className="mt-3 text-sm text-gray-700">
              <span className="font-medium">Why:</span> {cand.rationale}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <DocumentTextIcon className="w-4 h-4"/>
              <h4 className="font-semibold">Resume (parsed)</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Email</div>
                <div>{cand.email}</div>
              </div>
              <div>
                <div className="text-gray-500">Phone</div>
                <div>{cand.phone}</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500">Skills</div>
                <TagList tags={cand.tags} />
              </div>
              <div className="col-span-2">
                <div className="text-gray-500">Notes</div>
                <div className="mt-1 p-2 rounded bg-gray-50 border text-gray-700">Portfolio shows strong a11y focus; confirm SSR experience in next call.</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="primary"><CheckCircleIcon className="w-4 h-4 mr-1"/> Shortlist</Button>
              <Button variant="outline" className="text-red-600 border-red-300"><TrashIcon className="w-4 h-4 mr-1"/> Reject</Button>
              <Button variant="outline"><EnvelopeIcon className="w-4 h-4 mr-1"/> Email</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'pdf' | 'text'>('pdf');
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <Card className="relative w-full max-w-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Add Resume</h3>
          <Button variant="ghost" onClick={onClose}><XMarkIcon className="w-5 h-5"/></Button>
        </div>
        <div className="flex gap-2 mb-4">
          <Button variant={tab === 'pdf' ? 'primary' : 'outline'} onClick={() => setTab('pdf')}>PDF/DOCX</Button>
          <Button variant={tab === 'text' ? 'primary' : 'outline'} onClick={() => setTab('text')}>Plain Text</Button>
        </div>
        {tab === 'pdf' ? (
          <div className="border-2 border-dashed rounded-xl p-6 text-center">
            <DocumentArrowUpIcon className="w-8 h-8 mx-auto text-gray-400"/>
            <p className="mt-2 text-sm text-gray-600">Drag & drop resume files here, or click to browse</p>
            <p className="text-xs text-gray-500 mt-1">PDF, DOCX · up to 10MB</p>
          </div>
        ) : (
          <textarea className="w-full h-40 p-3 border rounded-xl focus:outline-none focus:ring" placeholder="Paste resume text here…" />
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary"><SparklesIcon className="w-4 h-4 mr-1"/> Parse & Score</Button>
        </div>
      </Card>
    </div>
  );
}

export default function ResumeManagement() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [minScore, setMinScore] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detail, setDetail] = useState<Candidate | null>(null);
  const [sortBy, setSortBy] = useState<{ key: 'updatedAt' | 'score' | 'name'; dir: 'asc' | 'desc' }>({ key: 'updatedAt', dir: 'desc' });

  const filtered = useFilteredCandidates(MOCK_CANDIDATES, q, role, minScore);
  const sorted = useSortedCandidates(filtered, sortBy.key, sortBy.dir);

  return (
    <section className="min-h-[60vh]">
      {/* Page header (inside app Header/Sidebar layout) */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 text-gray-800">
          <UserGroupIcon className="w-5 h-5"/>
          <h1 className="text-xl font-semibold m-0">Resume Management</h1>
        </div>
        <div className="flex-1" />
        <div className="relative w-full max-w-md">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, skill, email…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring"
          />
        </div>
        <Button variant="outline" onClick={() => setUploadOpen(true)} className="ml-2"><DocumentArrowUpIcon className="w-4 h-4 mr-1"/> Add Resume</Button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Filters */}
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3 text-gray-800"><FunnelIcon className="w-4 h-4"/><h3 className="font-semibold">Filters</h3></div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Role</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Frontend Engineer', 'Fullstack Engineer'].map((r) => (
                    <button
                      key={r}
                      className={`px-2 py-1 rounded-full border text-xs ${role === r ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'}`}
                      onClick={() => setRole(role === r ? null : r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Min. Score</div>
                <div className="flex flex-wrap gap-1.5">
                  {[50, 60, 70, 80, 90].map((s) => (
                    <button
                      key={s}
                      onClick={() => setMinScore(minScore === s ? null : s)}
                      className={`px-2 py-1 rounded-full border text-xs ${
                        minScore === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {s}%+
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1 flex items-center gap-1"><TagIcon className="w-4 h-4"/>Quick Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {['React', 'TypeScript', 'Node.js', 'Accessibility', 'PostgreSQL'].map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </div>
              </div>
              <div className="pt-2 flex gap-2">
                <Button variant="outline" onClick={() => { setRole(null); setMinScore(null); setQ(''); }}>Reset</Button>
                <Button variant="primary"><SparklesIcon className="w-4 h-4 mr-1"/> Re‑Score Visible</Button>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2 text-gray-800"><ChartBarIcon className="w-4 h-4"/><h3 className="font-semibold">Pipeline</h3></div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span>New</span><Chip>12</Chip></div>
              <div className="flex items-center justify-between"><span>Screening</span><Chip>8</Chip></div>
              <div className="flex items-center justify-between"><span>Interview</span><Chip color="yellow">5</Chip></div>
              <div className="flex items-center justify-between"><span>Offer</span><Chip color="green">2</Chip></div>
            </div>
          </Card>
        </aside>

        {/* Table */}
        <section className="col-span-12 lg:col-span-9">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline"><ArrowDownTrayIcon className="w-4 h-4 mr-1"/> Export</Button>
                <Button variant="outline"><PlusIcon className="w-4 h-4 mr-1"/> New Candidate</Button>
              </div>
              <div className="text-xs text-gray-500">{sorted.length} results</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Source</th>
                    <th className="px-4 py-2 cursor-pointer" onClick={() => setSortBy({ key: 'score', dir: sortBy.dir === 'asc' ? 'desc' : 'asc' })}>
                      <div className="inline-flex items-center gap-1">Score <ArrowsUpDownIcon className="w-3.5 h-3.5"/></div>
                    </th>
                    <th className="px-4 py-2">Tags</th>
                    <th className="px-4 py-2 cursor-pointer" onClick={() => setSortBy({ key: 'updatedAt', dir: sortBy.dir === 'asc' ? 'desc' : 'asc' })}>
                      <div className="inline-flex items-center gap-1">Updated <ArrowsUpDownIcon className="w-3.5 h-3.5"/></div>
                    </th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c) => (
                    <tr key={c.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                            {c.name.split(' ').map((s) => s[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{c.name}</div>
                            <div className="text-xs text-gray-500">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{c.role}</td>
                      <td className="px-4 py-3">{c.source}</td>
                      <td className="px-4 py-3"><ScoreBadge score={c.score} /></td>
                      <td className="px-4 py-3"><TagList tags={c.tags} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{c.updatedAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={() => setDetail(c)}>View</Button>
                          <Button variant="primary">Review</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <DetailDrawer open={!!detail} onClose={() => setDetail(null)} cand={detail} />
    </section>
  );
}
