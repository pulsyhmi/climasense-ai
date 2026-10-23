import React, { useState } from 'react';
import {
  Building2,
  TreePine,
  Shield,
  Layers,
  Thermometer,
  CloudRain,
  MapPin,
  CheckCircle,
  Clock,
  PlusCircle,
  Sparkles,
  Info,
  Filter,
  BarChart3,
  Sliders,
  FileText,
  Trash2,
  ShieldAlert,
  Send,
  X,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import {
  TownshipZone,
  TownshipIntervention,
  RiskLevel,
} from '../../types/index.ts';
import { TownshipProfile } from '../../config/townshipConfig.ts';
import { MetricCard } from '../common/MetricCard.tsx';
import { RiskBadge } from '../common/RiskBadge.tsx';
import { AppUser, PersistedManagerNote } from '../../types/firebase.ts';

interface TownshipManagementProps {
  township: TownshipProfile;
  zones: TownshipZone[];
  interventions: TownshipIntervention[];
  onToggleInterventionStatus: (id: string) => void;
  onOpenMethodology: () => void;
  currentUser: AppUser | null;
  managerNotes: PersistedManagerNote[];
  onPublishNote: (note: {
    townshipId: string;
    title: string;
    zoneId: string;
    category: 'heat_advisory' | 'drainage_maintenance' | 'tree_planting' | 'infrastructure';
    content: string;
  }) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onOpenThresholds: () => void;
  onOpenAuth: () => void;
}

export const TownshipManagement: React.FC<TownshipManagementProps> = ({
  township,
  zones,
  interventions,
  onToggleInterventionStatus,
  onOpenMethodology,
  currentUser,
  managerNotes,
  onPublishNote,
  onDeleteNote,
  onOpenThresholds,
  onOpenAuth,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'zone-cp');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Manager Note Modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState<'heat_advisory' | 'drainage_maintenance' | 'tree_planting' | 'infrastructure'>('heat_advisory');
  const [noteZoneId, setNoteZoneId] = useState(zones[0]?.name || 'Elmina Central Park');
  const [noteContent, setNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const isManager = currentUser?.role === 'township_manager';
  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  // Calculate township aggregate metrics based on interventions
  const implementedCount = interventions.filter((i) => i.status === 'implemented').length;
  const inProgressCount = interventions.filter((i) => i.status === 'in_progress').length;
  const proposedCount = interventions.filter((i) => i.status === 'proposed').length;

  const totalImplementedImpact = interventions
    .filter((i) => i.status === 'implemented')
    .reduce((acc, curr) => acc + curr.resilienceImpactScore, 0);

  const filteredInterventions = categoryFilter === 'all'
    ? interventions
    : interventions.filter((i) => i.category === categoryFilter);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent || isSubmittingNote) return;

    setIsSubmittingNote(true);
    try {
      await onPublishNote({
        townshipId: township.id,
        title: noteTitle.trim(),
        zoneId: noteZoneId,
        category: noteCategory,
        content: noteContent.trim(),
      });
      setNoteTitle('');
      setNoteContent('');
      setIsNoteModalOpen(false);
    } catch (err) {
      console.error('Failed to publish note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Township Governance Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider">
              Masterplan Command
            </span>
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 font-medium">
              Demo Simulated Micro-Zones
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
              isManager
                ? 'bg-teal-100 text-teal-900 border border-teal-300'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {isManager ? '🛡️ Township Manager Mode' : '👤 Resident View Mode'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Township Climate Management & Interventions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
            Macro-level environmental surveillance, illustrative micro-climate zone vulnerability analysis, and infrastructure intervention pipeline for {township.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isManager ? (
            <button
              onClick={onOpenThresholds}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Config Thresholds</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              title="Switch to Township Manager persona to edit thresholds"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Manager Settings</span>
            </button>
          )}

          <button
            onClick={onOpenMethodology}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-emerald-700" />
            <span>Zone Scoring Rationale</span>
          </button>
        </div>
      </div>

      {/* 4 Township Macro-Level KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Resilience Score"
          value={76 + Math.min(12, Math.round(totalImplementedImpact / 5))}
          unit="/ 100"
          subtitle="Township Composite Index"
          icon={Shield}
          iconColor="text-emerald-800 bg-emerald-50 border-emerald-100"
          trendText={`+${totalImplementedImpact} pts from active interventions`}
          trendType="positive"
        />

        <MetricCard
          title="Green Canopy Coverage"
          value={township.baselineCanopyCoveragePct + (implementedCount > 2 ? 2.5 : 0)}
          unit="%"
          subtitle="Forest Reserve & Street Canopy"
          icon={TreePine}
          iconColor="text-teal-800 bg-teal-50 border-teal-100"
          trendText="Target: 45% by 2030"
          trendType="positive"
        />

        <MetricCard
          title="Stormwater Retention"
          value={82}
          unit="%"
          subtitle="Bioretention Basin Buffer"
          icon={CloudRain}
          iconColor="text-blue-800 bg-blue-50 border-blue-100"
          trendText="100-Year Flood Attenuation"
          trendType="positive"
        />

        <MetricCard
          title="Active Interventions"
          value={implementedCount}
          unit={`/ ${interventions.length}`}
          subtitle={`${inProgressCount} in progress, ${proposedCount} proposed`}
          icon={Layers}
          iconColor="text-slate-800 bg-slate-100 border-slate-200"
          trendText="Synced with masterplan"
          trendType="neutral"
        />
      </div>

      {/* Manager Notes & Community Advisories Section (Firestore Persisted) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span>Township Climate Advisories & Manager Notes</span>
              </h2>
              <span className="text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Cloud Firestore
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Official operational notes and advisories published by Sime Darby Property township management.
            </p>
          </div>

          <div>
            {isManager ? (
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#C8102E] hover:bg-[#A50D24] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publish Advisory</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Manager Login to Publish</span>
              </button>
            )}
          </div>
        </div>

        {/* Notes Grid */}
        {managerNotes.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">No manager advisories published yet.</p>
            {isManager && (
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="mt-2 text-xs font-bold text-teal-700 hover:text-teal-900"
              >
                + Publish the first advisory note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {managerNotes.map((note) => {
              const categoryBadge = {
                heat_advisory: 'bg-rose-50 text-rose-800 border-rose-200',
                drainage_maintenance: 'bg-blue-50 text-blue-800 border-blue-200',
                tree_planting: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                infrastructure: 'bg-amber-50 text-amber-800 border-amber-200',
              }[note.category];

              return (
                <div
                  key={note.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${categoryBadge}`}>
                        {note.category.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(note.createdAt).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {note.title}
                    </h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{note.zoneId}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>By: <strong>{note.authorName}</strong></span>
                    {isManager && (
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Illustrative Risk Hotspot Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <span>Illustrative Township Micro-Zones & Vulnerability Hotspots</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a demo precinct to inspect microclimate differentials, canopy shade, and runoff vulnerability.
          </p>
        </div>

        {/* Micro-Zone Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {zones.map((zone) => {
            const isSelected = zone.id === selectedZone.id;
            return (
              <button
                key={zone.id}
                onClick={() => setSelectedZoneId(zone.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate block">
                    {zone.name.split(' ')[0]} {zone.name.split(' ')[1] || ''}
                  </span>
                  <RiskBadge level={zone.floodRiskLevel} size="sm" showDot={false} />
                </div>
                <div className="space-y-0.5 text-[11px] text-slate-500">
                  <div className="flex justify-between">
                    <span>Surface:</span>
                    <strong className="text-slate-700 font-mono">{zone.surfaceTempC}°C</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Canopy:</span>
                    <strong className="text-slate-700 font-mono">{zone.treeCanopyPct}%</strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Infrastructure Interventions Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              <span>Targeted Climate Interventions Pipeline</span>
            </h2>
            <p className="text-xs text-slate-500">
              Actionable resilience infrastructure projects for City of Elmina. Click to update project status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Filter:
            </span>
            {['all', 'shade', 'drainage', 'water', 'green_infrastructure'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Intervention Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredInterventions.map((item) => {
            const statusConfig = {
              proposed: {
                label: 'Proposed',
                color: 'bg-slate-100 text-slate-700 border-slate-300',
                actionLabel: 'Advance to In-Progress',
              },
              in_progress: {
                label: 'In Progress',
                color: 'bg-amber-100 text-amber-800 border-amber-300',
                actionLabel: 'Mark Implemented',
              },
              implemented: {
                label: 'Implemented',
                color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                actionLabel: 'Reset to Proposed',
              },
            }[item.status];

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {item.zoneName.split(' ')[0]} {item.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                    <span className="text-emerald-700 font-semibold">
                      +{item.resilienceImpactScore} Resilience Pts
                    </span>
                    {item.expectedCoolingDeltaC && (
                      <span className="text-teal-700 font-medium">
                        -{item.expectedCoolingDeltaC}°C Thermal Relief
                      </span>
                    )}
                    {item.expectedRunoffReductionPct && (
                      <span className="text-blue-700 font-medium">
                        -{item.expectedRunoffReductionPct}% Peak Runoff
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Cost Tier: <strong>{item.estimatedCostTier}</strong>
                  </span>

                  <button
                    onClick={() => onToggleInterventionStatus(item.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    {statusConfig.actionLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Publish Advisory Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <FileText className="w-5 h-5 text-teal-700" />
                <span>Publish Township Manager Advisory</span>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Advisory Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Scheduled Swale De-silting Before Monsoonal Rain"
                  required
                  maxLength={150}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-800"
                  >
                    <option value="heat_advisory">Heat Advisory</option>
                    <option value="drainage_maintenance">Drainage Maintenance</option>
                    <option value="tree_planting">Tree Planting Notice</option>
                    <option value="infrastructure">Infrastructure Memo</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Target Zone</label>
                  <select
                    value={noteZoneId}
                    onChange={(e) => setNoteZoneId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-800"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.name}>{z.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Content / Instructions</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter detailed guidance for residents or operations teams..."
                  rows={4}
                  required
                  maxLength={1000}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNote}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingNote ? 'Saving to Firestore...' : 'Publish to Community'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
