import React, { useState } from 'react';
import {
  Award,
  Leaf,
  Plus,
  Bike,
  Footprints,
  Recycle,
  Zap,
  Droplets,
  Sprout,
  CheckCircle2,
  Gift,
  Clock,
  Sparkles,
  Info,
  Filter,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  GreenActivity,
  GreenActivityCategory,
  GreenReward,
} from '../../types/index.ts';
import { TownshipProfile } from '../../config/townshipConfig.ts';
import { MetricCard } from '../common/MetricCard.tsx';

import { Trash2, Database } from 'lucide-react';

interface GreenRewardsProps {
  township: TownshipProfile;
  activities: GreenActivity[];
  rewards: GreenReward[];
  userPoints: number;
  onLogActivity: (activity: Omit<GreenActivity, 'id' | 'loggedAt'>) => void;
  onRedeemReward: (rewardId: string, cost: number) => { success: boolean; message: string };
  onOpenMethodology: () => void;
  onDeleteActivity?: (id: string) => void;
  isSyncing?: boolean;
}

const ACTIVITY_POINTS_TABLE: Record<
  GreenActivityCategory,
  { label: string; points: number; defaultImpact: string; icon: React.ElementType }
> = {
  tree_planting: {
    label: 'Tree Planting',
    points: 100,
    defaultImpact: 'Estimated ~22 kg CO2/year long-term potential at maturity (Illustrative).',
    icon: Sprout,
  },
  cycling: {
    label: 'Cycling Commute / Recreation',
    points: 25,
    defaultImpact: 'Displaces motor vehicle emissions along Elmina active mobility paths.',
    icon: Bike,
  },
  walking: {
    label: 'Walking / Active Steps',
    points: 15,
    defaultImpact: 'Zero-emission pedestrian journey along shaded Elmina Central Park spine.',
    icon: Footprints,
  },
  recycling: {
    label: 'Segregated Recycling',
    points: 20,
    defaultImpact: 'Diverts domestic recyclables from Selangor municipal landfill.',
    icon: Recycle,
  },
  energy_conservation: {
    label: 'Energy Conservation (Off-Peak AC)',
    points: 30,
    defaultImpact: 'Curbs peak electricity demand during hottest afternoon hours.',
    icon: Zap,
  },
  water_conservation: {
    label: 'Rainwater / Water Conservation',
    points: 20,
    defaultImpact: 'Reduces domestic potable tap demand and buffers retention runoff.',
    icon: Droplets,
  },
  composting: {
    label: 'Food Waste Composting',
    points: 30,
    defaultImpact: 'Converts organic household scraps into nutrient-rich soil compost.',
    icon: Leaf,
  },
};

export const GreenRewards: React.FC<GreenRewardsProps> = ({
  township,
  activities,
  rewards,
  userPoints,
  onLogActivity,
  onRedeemReward,
  onOpenMethodology,
  onDeleteActivity,
  isSyncing,
}) => {
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<GreenActivityCategory>('cycling');
  const [activityTitle, setActivityTitle] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenLogModal = (presetCategory?: GreenActivityCategory) => {
    if (presetCategory) {
      setSelectedCategory(presetCategory);
    }
    setActivityTitle('');
    setQuantityInput('');
    setNotesInput('');
    setFormError('');
    setIsLogModalOpen(true);
  };

  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantityInput.trim()) {
      setFormError('Please enter a description or distance/quantity (e.g., 5 km, 2 kg, 1 sapling).');
      return;
    }

    const config = ACTIVITY_POINTS_TABLE[selectedCategory];
    const finalTitle = activityTitle.trim() || `${config.label}: ${quantityInput.trim()}`;

    onLogActivity({
      category: selectedCategory,
      title: finalTitle,
      pointsEarned: config.points,
      quantityDesc: quantityInput.trim(),
      notes: notesInput.trim() || undefined,
      simulatedImpactDesc: config.defaultImpact,
    });

    setIsLogModalOpen(false);
    showToast(`+${config.points} points awarded for logging ${config.label}!`);
  };

  const handleRedeem = (reward: GreenReward) => {
    if (userPoints < reward.pointsCost) {
      showToast(`Insufficient points. You need ${reward.pointsCost} points (Current balance: ${userPoints} pts).`);
      return;
    }

    const res = onRedeemReward(reward.id, reward.pointsCost);
    showToast(res.message);
  };

  const filteredActivities = historyFilter === 'all'
    ? activities
    : activities.filter((a) => a.category === historyFilter);

  // Compute tier progress
  const currentTier = userPoints >= 500
    ? 'Elmina Eco-Champion (Tier 3)'
    : userPoints >= 200
    ? 'Community Steward (Tier 2)'
    : 'Green Pioneer (Tier 1)';

  const nextTierPoints = userPoints >= 500 ? 1000 : userPoints >= 200 ? 500 : 200;
  const tierProgressPct = Math.min(100, Math.round((userPoints / nextTierPoints) * 100));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Points Summary Banner */}
      <div className="bg-[#0C121E] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-950/60 text-red-300 text-xs font-semibold uppercase tracking-wider border border-red-800/60">
                Resident Sustainability Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {township.name}
              </span>
              <span className="flex items-center gap-1 text-[10px] bg-slate-850 text-slate-300 px-2.5 py-0.5 rounded-full font-mono border border-slate-700">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Cloud Firestore {isSyncing ? 'Syncing...' : 'Synced'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Green Community Rewards
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Earn illustrative eco-points for sustainable daily habits. Redeem points for community nursery vouchers, local cafe perks, and eco-initiatives.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 backdrop-blur-xs">
            <div>
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">
                Your Eco Balance
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {userPoints}
                </span>
                <span className="text-xs font-bold text-[#EAAA08] uppercase">
                  Pts
                </span>
              </div>
              <span className="text-[11px] text-slate-300 block mt-1">
                Status: <strong className="text-emerald-400">{currentTier}</strong>
              </span>
            </div>

            <button
              onClick={() => handleOpenLogModal()}
              className="px-4 py-2.5 bg-[#C8102E] hover:bg-[#A50D24] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Green Habit</span>
            </button>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800 space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Progress toward next milestone: {nextTierPoints} Pts</span>
            <span className="font-bold text-[#EAAA08]">{tierProgressPct}%</span>
          </div>
          <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-[#EAAA08] h-full rounded-full transition-all duration-500"
              style={{ width: `${tierProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Category Shortcuts */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Quick Log Activity Shortcuts:
          </h2>
          <span className="text-xs text-slate-500">
            Deterministic point rewards
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {(Object.keys(ACTIVITY_POINTS_TABLE) as GreenActivityCategory[]).map((cat) => {
            const item = ACTIVITY_POINTS_TABLE[cat];
            const Icon = item.icon;
            return (
              <button
                key={cat}
                onClick={() => handleOpenLogModal(cat)}
                className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50/60 hover:border-emerald-300 text-left transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-emerald-700 group-hover:text-emerald-900">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 font-mono">
                    +{item.points}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Layout: Available Rewards & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Activity Log */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Your Logged Sustainability Activities
              </h2>
              <p className="text-xs text-slate-500">
                In-memory activity feed updated immediately on submission.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'cycling', 'tree_planting', 'recycling', 'energy_conservation'].map((f) => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`text-[11px] px-2 py-1 rounded-md font-semibold capitalize transition-colors cursor-pointer ${
                    historyFilter === f
                      ? 'bg-emerald-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Leaf className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">No activities logged in this category yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((act) => {
                const conf = ACTIVITY_POINTS_TABLE[act.category] || ACTIVITY_POINTS_TABLE.cycling;
                const Icon = conf.icon;

                return (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {act.title}
                          </h3>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {act.quantityDesc} • {act.loggedAt}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                          +{act.pointsEarned} Pts
                        </span>
                        {onDeleteActivity && (
                          <button
                            onClick={() => onDeleteActivity(act.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete activity record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {act.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                        "{act.notes}"
                      </p>
                    )}

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>{act.simulatedImpactDesc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Rewards Catalog */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-700" />
              Township Rewards Catalog
            </h2>
            <p className="text-xs text-slate-500">
              Redeem demo vouchers from local Elmina partners and nurseries.
            </p>
          </div>

          <div className="space-y-3">
            {rewards.map((reward) => {
              const canAfford = userPoints >= reward.pointsCost;

              return (
                <div
                  key={reward.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {reward.partnerName}
                      </span>
                      <span className="text-xs font-black text-emerald-800 font-mono">
                        {reward.pointsCost} Pts
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {reward.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {reward.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Partner: {reward.partnerName}
                    </span>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        canAfford
                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Redeem Voucher' : 'Need More Pts'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
            <strong>Prototype Rules:</strong> Points and redemption vouchers are demonstration prototype assets. Prepared with clean handler architecture for Firebase / database persistence.
          </div>
        </div>
      </div>

      {/* Log Activity Modal */}
      {isLogModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Log Sustainable Habit
                </h3>
                <p className="text-xs text-slate-500">
                  Document your green action in {township.name}
                </p>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitActivity} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Activity Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value as GreenActivityCategory)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {(Object.keys(ACTIVITY_POINTS_TABLE) as GreenActivityCategory[]).map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {ACTIVITY_POINTS_TABLE[cat].label} (+{ACTIVITY_POINTS_TABLE[cat].points} pts)
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Quantity / Unit */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quantity / Metric <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={quantityInput}
                  onChange={(e) => {
                    setQuantityInput(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="e.g. 6.5 km cycling, 2 saplings, 3 kg paper"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Title / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="e.g. Central Park morning loop with family"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Personal Reflection / Notes
                </label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  rows={2}
                  placeholder="Details on trail condition, temperature, or community group..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Simulated Award Preview */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-semibold">
                  Points awarded immediately:
                </span>
                <span className="text-sm font-black text-emerald-800 font-mono">
                  +{ACTIVITY_POINTS_TABLE[selectedCategory].points} Pts
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Confirm & Award Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
