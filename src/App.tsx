import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveModule,
  ClimateConditions,
  ChatMessage,
  GreenActivity,
  TownshipIntervention,
  IoTSensor,
  GreenReward,
  GreenActivityCategory,
} from './types/index.ts';
import { CURRENT_TOWNSHIP, TownshipProfile } from './config/townshipConfig.ts';
import {
  RiskThresholdConfig,
  DEFAULT_RISK_THRESHOLDS,
} from './config/riskThresholds.ts';
import {
  DEMO_TOWNSHIP_ZONES,
  DEMO_INTERVENTIONS,
  DEMO_IOT_SENSORS,
  INITIAL_GREEN_ACTIVITIES,
  GREEN_REWARDS_CATALOG,
  INITIAL_CHAT_MESSAGES,
} from './data/sampleData.ts';
import {
  fetchLiveClimateData,
  LiveClimateData,
} from './services/climateService.ts';
import {
  calculateHeatRisk,
  calculateRainfallRisk,
  calculateAirQualityRisk,
  calculateOverallResilienceScore,
} from './utils/climateRisk.ts';

// Firebase Services & Types
import {
  auth,
  testFirestoreConnection,
  signInAsGuest,
  getUserProfile,
  fetchUserGreenActivities,
  saveGreenActivityRecord,
  deleteUserGreenActivity,
  fetchRewardBalanceRecord,
  saveRewardBalanceRecord,
  fetchTownshipConfigDoc,
  saveTownshipConfigDoc,
  fetchManagerNotesList,
  saveManagerNoteDoc,
  deleteManagerNoteDoc,
} from './services/firebase.ts';
import { onAuthStateChanged } from 'firebase/auth';
import {
  AppUser,
  PersistedManagerNote,
  PersistedGreenActivity,
  PersistedRewardBalance,
  PersistedTownshipConfig,
} from './types/firebase.ts';

// Components
import { Header } from './components/common/Header.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';
import { MethodologyModal } from './components/common/MethodologyModal.tsx';
import { ThresholdSettingsModal } from './components/common/ThresholdSettingsModal.tsx';
import { AuthModal } from './components/common/AuthModal.tsx';
import { ResidentDashboard } from './components/modules/ResidentDashboard.tsx';
import { AiAssistant } from './components/modules/AiAssistant.tsx';
import { TownshipManagement } from './components/modules/TownshipManagement.tsx';
import { ScenarioSimulator } from './components/modules/ScenarioSimulator.tsx';
import { IotSensorMonitor } from './components/modules/IotSensorMonitor.tsx';
import { GreenRewards } from './components/modules/GreenRewards.tsx';

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('resident_dashboard');
  const [currentTownship, setCurrentTownship] = useState<TownshipProfile>(CURRENT_TOWNSHIP);

  // Firebase Authentication & Database State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isSyncingRewards, setIsSyncingRewards] = useState<boolean>(false);
  const [managerNotes, setManagerNotes] = useState<PersistedManagerNote[]>([]);

  // Real Open-Meteo API State
  const [liveClimateData, setLiveClimateData] = useState<LiveClimateData | null>(null);
  const [isLoadingClimate, setIsLoadingClimate] = useState<boolean>(true);
  const [climateError, setClimateError] = useState<string | null>(null);

  // Configurable Risk Thresholds (Persisted to Firestore for township)
  const [thresholds, setThresholds] = useState<RiskThresholdConfig>(DEFAULT_RISK_THRESHOLDS);
  const [isThresholdsModalOpen, setIsThresholdsModalOpen] = useState<boolean>(false);

  // Simulated indicators (water stress & IoT fleet remain simulated per instructions)
  const [simulatedWaterStressPct, setSimulatedWaterStressPct] = useState<number>(28);
  const [zones, setZones] = useState(DEMO_TOWNSHIP_ZONES);
  const [interventions, setInterventions] = useState<TownshipIntervention[]>(DEMO_INTERVENTIONS);
  const [sensors, setSensors] = useState<IoTSensor[]>(DEMO_IOT_SENSORS);

  // Green Rewards state (synced with Firestore)
  const [activities, setActivities] = useState<GreenActivity[]>(INITIAL_GREEN_ACTIVITIES);
  const [rewards, setRewards] = useState<GreenReward[]>(GREEN_REWARDS_CATALOG);
  const [userPoints, setUserPoints] = useState<number>(175);

  // AI Assistant Chat State & Gemini Integration
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isAssistantLoading, setIsAssistantLoading] = useState<boolean>(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string>('');

  // Modals & Navigation
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Load activities and reward balance for a specific user ID
  const loadUserData = useCallback(async (uid: string) => {
    try {
      const dbActs = await fetchUserGreenActivities(uid);
      if (dbActs && dbActs.length > 0) {
        setActivities(
          dbActs.map((a) => ({
            id: a.id,
            category: (a.category === 'food_waste' ? 'composting' : a.category) as GreenActivityCategory,
            title: a.title,
            pointsEarned: a.pointsAwarded,
            loggedAt: a.timestamp || 'Recent',
            quantityDesc: a.metricDescription,
            notes: a.notes,
            simulatedImpactDesc: 'Verified habit logged in Cloud Firestore.',
          }))
        );
      }
    } catch (e) {
      console.warn('Loading green activities:', e);
    }

    try {
      const balance = await fetchRewardBalanceRecord(uid);
      if (balance) {
        setUserPoints(balance.points);
      } else {
        await saveRewardBalanceRecord({
          userId: uid,
          points: 175,
          lifetimePoints: 175,
          tier: 'Green Pioneer (Tier 1)',
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Loading reward balance:', e);
    }
  }, []);

  // 1. Initial Firestore Connection Check & Auto Guest Sign-in
  useEffect(() => {
    testFirestoreConnection().then((res) => {
      setIsFirebaseConnected(res.connected);
    });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        let profile = await getUserProfile(fbUser.uid);
        if (!profile) {
          // If signed in anonymously without profile, create one
          profile = {
            uid: fbUser.uid,
            email: fbUser.email || null,
            displayName: fbUser.displayName || 'Elmina Resident',
            role: 'resident',
            isAnonymous: fbUser.isAnonymous,
            townshipId: 'elmina',
            preferences: {
              alertHeat: true,
              alertRain: true,
              alertAqi: true,
              preferredZone: 'Elmina Central Park',
            },
            createdAt: new Date().toISOString(),
          };
        }
        setCurrentUser(profile);

        loadUserData(fbUser.uid);
      } else {
        // Auto-sign in as guest resident for instant zero-friction reviewer experience
        signInAsGuest('resident').then((guestProfile) => {
          setCurrentUser(guestProfile);
          loadUserData(guestProfile.uid);
        }).catch((e) => {
          console.warn('Guest sign-in error:', e);
        });
      }
    });

    // Load persisted township config for Elmina from Firestore
    fetchTownshipConfigDoc('elmina').then((savedConfig) => {
      if (savedConfig) {
        setThresholds({
          heat: {
            ...DEFAULT_RISK_THRESHOLDS.heat,
            moderateThresholdC: savedConfig.heatModerateC,
            elevatedThresholdC: savedConfig.heatElevatedC,
          },
          rainfall: {
            ...DEFAULT_RISK_THRESHOLDS.rainfall,
            moderatePrecipMm: savedConfig.rainModerateMm,
            elevatedPrecipMm: savedConfig.rainElevatedMm,
          },
          airQuality: {
            ...DEFAULT_RISK_THRESHOLDS.airQuality,
            moderateAqi: savedConfig.aqiModerate,
            elevatedAqi: savedConfig.aqiElevated,
          },
        });
      }
    }).catch((e) => {
      console.warn('Loading township config from Firestore:', e);
    });

    // Load persisted manager notes for Elmina from Firestore
    fetchManagerNotesList('elmina').then((notes) => {
      if (notes && notes.length > 0) {
        setManagerNotes(notes);
      }
    }).catch((e) => {
      console.warn('Loading manager notes from Firestore:', e);
    });

    return () => unsubscribe();
  }, []);

  // Reusable live climate fetcher
  const loadClimateData = useCallback(async (township: TownshipProfile) => {
    setIsLoadingClimate(true);
    setClimateError(null);

    try {
      const data = await fetchLiveClimateData({
        latitude: township.coordinates.latitude,
        longitude: township.coordinates.longitude,
        timezone: township.timezone,
      });
      setLiveClimateData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown network failure while connecting to Open-Meteo';
      setClimateError(msg);
    } finally {
      setIsLoadingClimate(false);
    }
  }, []);

  // Fetch on mount or when township changes
  useEffect(() => {
    loadClimateData(currentTownship);
  }, [currentTownship, loadClimateData]);

  // Derived indicative risks based on live data and current thresholds
  const heatRisk = liveClimateData?.temperatureC && liveClimateData?.apparentTemperatureC
    ? calculateHeatRisk(liveClimateData.temperatureC, liveClimateData.apparentTemperatureC, thresholds)
    : calculateHeatRisk(32, 38, thresholds);

  const rainfallRisk = liveClimateData?.precipitationMm !== null && liveClimateData?.precipitationMm !== undefined
    ? calculateRainfallRisk(liveClimateData.precipitationMm, liveClimateData.precipitationProbPct ?? 0, thresholds)
    : calculateRainfallRisk(0, 50, thresholds);

  const aqiVal = liveClimateData?.usAqi ?? liveClimateData?.europeanAqi ?? 42;
  const pm25Val = liveClimateData?.pm25 ?? 15;
  const aqiRisk = calculateAirQualityRisk(aqiVal, pm25Val, thresholds);

  // Dynamic resilience score for township
  const overallResilience = calculateOverallResilienceScore(
    heatRisk.score,
    rainfallRisk.score,
    aqiRisk.score,
    simulatedWaterStressPct,
    currentTownship.baselineCanopyCoveragePct
  );

  // Township intervention status toggle
  const handleToggleInterventionStatus = (id: string) => {
    setInterventions((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus =
          item.status === 'proposed'
            ? 'in_progress'
            : item.status === 'in_progress'
            ? 'implemented'
            : 'proposed';
        return { ...item, status: nextStatus };
      })
    );
  };

  // IoT Sensor telemetry simulated refresh
  const handleRefreshSensors = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setSensors((prev) =>
      prev.map((s) => {
        const tempDelta = Number(((Math.random() - 0.5) * 0.3).toFixed(1));
        const newTemp = Number((s.telemetry.temperatureC + tempDelta).toFixed(1));
        const newSoil = Math.max(
          30,
          Math.min(95, s.telemetry.soilMoisturePct + Math.floor((Math.random() - 0.5) * 2))
        );

        return {
          ...s,
          lastUpdated: 'Just now',
          telemetry: {
            ...s.telemetry,
            temperatureC: newTemp,
            soilMoisturePct: newSoil,
          },
          history: [
            ...s.history.slice(1),
            {
              time: timeStr,
              temperatureC: newTemp,
              humidityPct: s.telemetry.humidityPct,
              aqi: s.telemetry.aqi,
            },
          ],
        };
      })
    );
  };

  // AI Assistant Chat Handler invoking secure server-side Gemini endpoint
  const handleSendMessage = async (text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeStr,
    };

    setMessages((prev) => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        if (last.sender === 'user' && last.text.trim() === text.trim()) {
          return prev;
        }
      }
      return [...prev, userMessage];
    });
    setLastQuery(text);
    setIsAssistantLoading(true);
    setAssistantError(null);

    // Build comprehensive context payload for Gemini
    const climateContext = {
      township: {
        name: currentTownship.name,
        district: currentTownship.district,
        state: currentTownship.state,
        coordinates: currentTownship.coordinates,
        elevationMeters: currentTownship.elevationMeters,
        masterplanAcres: currentTownship.totalMasterplanAcres,
      },
      observations: {
        temperatureC: liveClimateData?.temperatureC ?? null,
        apparentTemperatureC: liveClimateData?.apparentTemperatureC ?? null,
        humidityPct: liveClimateData?.humidityPct ?? null,
        precipitationMm: liveClimateData?.precipitationMm ?? null,
        precipitationProbPct: liveClimateData?.precipitationProbPct ?? null,
        windSpeedKmh: liveClimateData?.windSpeedKmh ?? null,
        windDirection: liveClimateData?.windDirectionCardinal || 'N/A',
        conditionText: liveClimateData?.conditionText || 'Unspecified',
        observationTime: liveClimateData?.observationTimeFormatted || 'N/A',
      },
      modelledAirQuality: {
        pm25: liveClimateData?.pm25 ?? null,
        pm10: liveClimateData?.pm10 ?? null,
        aqi: aqiVal,
        sourceNotice:
          liveClimateData?.airQualityDisclaimer ||
          'Modelled European CAMS atmospheric forecast via Open-Meteo, not in-situ station measurement.',
        forecastTime: liveClimateData?.airQualityTimeFormatted || 'N/A',
      },
      indicativeRisks: {
        heatRiskLevel: heatRisk.level,
        heatRiskScore: heatRisk.score,
        rainfallRiskLevel: rainfallRisk.level,
        rainfallRiskScore: rainfallRisk.score,
        airQualityRiskLevel: aqiRisk.level,
        airQualityRiskScore: aqiRisk.score,
        overallResilienceScore: overallResilience,
      },
      thresholds: {
        heatModerate: thresholds.heat.moderateThresholdC,
        heatElevated: thresholds.heat.elevatedThresholdC,
        rainfallModerate: thresholds.rainfall.moderatePrecipMm,
        rainfallElevated: thresholds.rainfall.elevatedPrecipMm,
        aqiModerate: thresholds.airQuality.moderateAqi,
        aqiElevated: thresholds.airQuality.elevatedAqi,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-4),
          climateContext,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const rawError = errorData.error;
        // Ensure no raw JSON or technical stack traces are presented to the user
        const friendlyMessage =
          typeof rawError === 'string' &&
          rawError.trim().length > 0 &&
          !rawError.includes('{') &&
          !rawError.includes('<!DOCTYPE')
            ? rawError
            : 'Our AI assistant is temporarily unavailable. Please try again shortly.';
        throw new Error(friendlyMessage);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: data.timestamp || timeStr,
        model: data.model || 'gemini-3.5-flash-lite',
        suggestedActions: data.suggestedActions || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      console.error('Failed to get Gemini response:', err);

      let errorMessage = 'Our AI assistant is temporarily unavailable. Please try again shortly.';
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'The request timed out. Please try again shortly.';
        } else if (err.message && !err.message.includes('{') && !err.message.includes('<!DOCTYPE')) {
          errorMessage = err.message;
        }
      }
      setAssistantError(errorMessage);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  const handleRetryAssistant = () => {
    if (lastQuery) {
      handleSendMessage(lastQuery);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_CHAT_MESSAGES);
    setAssistantError(null);
  };

  const handleNavigateToAssistant = (prompt?: string) => {
    setActiveModule('ai_assistant');
    if (prompt) {
      setAssistantInitialPrompt(prompt);
    }
  };

  // Green Rewards Habit Logging (Firestore Persisted)
  const handleLogActivity = async (newAct: Omit<GreenActivity, 'id' | 'loggedAt'>) => {
    const actId = `act-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const timeFormatted = new Date().toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const actWithMeta: GreenActivity = {
      ...newAct,
      id: actId,
      loggedAt: timeFormatted,
    };

    // Update UI immediately
    setActivities((prev) => [actWithMeta, ...prev]);
    const updatedPoints = userPoints + newAct.pointsEarned;
    setUserPoints(updatedPoints);

    // Persist to Cloud Firestore if user is authenticated
    if (currentUser) {
      setIsSyncingRewards(true);
      try {
        const persistedAct: PersistedGreenActivity = {
          id: actId,
          userId: currentUser.uid,
          userName: currentUser.displayName,
          category: newAct.category,
          title: newAct.title,
          metricDescription: newAct.quantityDesc,
          pointsAwarded: newAct.pointsEarned,
          townshipId: currentTownship.id,
          notes: newAct.notes || '',
          timestamp: timeFormatted,
          createdAt: nowIso,
        };
        await saveGreenActivityRecord(persistedAct);

        // Compute tier
        const tierName =
          updatedPoints >= 500
            ? 'Resilience Champion (Tier 3)'
            : updatedPoints >= 200
            ? 'Community Steward (Tier 2)'
            : 'Green Pioneer (Tier 1)';

        const balance: PersistedRewardBalance = {
          userId: currentUser.uid,
          points: updatedPoints,
          lifetimePoints: updatedPoints,
          tier: tierName,
          updatedAt: nowIso,
        };
        await saveRewardBalanceRecord(balance);
      } catch (err) {
        console.error('Failed to persist green activity to Firestore:', err);
      } finally {
        setIsSyncingRewards(false);
      }
    }
  };

  const handleDeleteActivity = async (actId: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== actId));
    if (currentUser) {
      try {
        await deleteUserGreenActivity(actId);
      } catch (err) {
        console.error('Failed to delete activity from Firestore:', err);
      }
    }
  };

  const handleRedeemReward = (rewardId: string, cost: number) => {
    if (userPoints < cost) {
      return { success: false, message: 'Insufficient points for this reward.' };
    }

    const nextPoints = userPoints - cost;
    setUserPoints(nextPoints);

    if (currentUser) {
      const tierName =
        nextPoints >= 500
          ? 'Resilience Champion (Tier 3)'
          : nextPoints >= 200
          ? 'Community Steward (Tier 2)'
          : 'Green Pioneer (Tier 1)';

      saveRewardBalanceRecord({
        userId: currentUser.uid,
        points: nextPoints,
        lifetimePoints: userPoints,
        tier: tierName,
        updatedAt: new Date().toISOString(),
      }).catch((e) => console.warn('Syncing balance deduction:', e));
    }

    const reward = rewards.find((r) => r.id === rewardId);
    return {
      success: true,
      message: `Voucher redeemed! ${cost} points deducted for ${reward?.title || 'Reward'}.`,
    };
  };

  // Township Manager Notes (Firestore Persisted)
  const handlePublishManagerNote = async (noteData: {
    townshipId: string;
    title: string;
    zoneId: string;
    category: 'heat_advisory' | 'drainage_maintenance' | 'tree_planting' | 'infrastructure';
    content: string;
  }) => {
    if (!currentUser || currentUser.role !== 'township_manager') {
      console.warn('Township Manager permission required to publish advisories.');
      throw new Error('Township Manager permission required to publish advisories.');
    }

    const noteId = `note-${Date.now()}`;
    const newNote: PersistedManagerNote = {
      id: noteId,
      townshipId: noteData.townshipId,
      title: noteData.title,
      zoneId: noteData.zoneId,
      category: noteData.category,
      content: noteData.content,
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      createdAt: new Date().toISOString(),
    };

    setManagerNotes((prev) => [newNote, ...prev]);
    await saveManagerNoteDoc(newNote);
  };

  const handleDeleteManagerNote = async (noteId: string) => {
    if (!currentUser || currentUser.role !== 'township_manager') {
      console.warn('Township Manager permission required to delete advisories.');
      return;
    }

    setManagerNotes((prev) => prev.filter((n) => n.id !== noteId));
    await deleteManagerNoteDoc(noteId);
  };

  // Township Risk Thresholds Persistence
  const handleUpdateThresholds = async (newThresholds: RiskThresholdConfig) => {
    setThresholds(newThresholds);
    if (currentUser && currentUser.role === 'township_manager') {
      const configDoc: PersistedTownshipConfig = {
        townshipId: currentTownship.id,
        name: currentTownship.name,
        heatModerateC: newThresholds.heat.moderateThresholdC,
        heatElevatedC: newThresholds.heat.elevatedThresholdC,
        rainModerateMm: newThresholds.rainfall.moderatePrecipMm,
        rainElevatedMm: newThresholds.rainfall.elevatedPrecipMm,
        aqiModerate: newThresholds.airQuality.moderateAqi,
        aqiElevated: newThresholds.airQuality.elevatedAqi,
        greenTargetPct: 45,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.displayName,
      };
      await saveTownshipConfigDoc(configDoc).catch((e) =>
        console.warn('Saving township config to Firestore:', e)
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        currentTownship={currentTownship}
        isCollapsedDesktop={isSidebarCollapsed}
        onToggleCollapseDesktop={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}>
        {/* Top Header */}
        <Header
          currentTownship={currentTownship}
          onSelectTownship={(t) => {
            setCurrentTownship(t);
          }}
          onOpenMethodology={() => setIsMethodologyOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          resilienceScore={overallResilience}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          isFirebaseConnected={isFirebaseConnected}
        />

        {/* Dynamic Module Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeModule === 'resident_dashboard' && (
            <ResidentDashboard
              township={currentTownship}
              liveData={liveClimateData}
              isLoading={isLoadingClimate}
              error={climateError}
              thresholds={thresholds}
              simulatedWaterStressPct={simulatedWaterStressPct}
              onRefresh={() => loadClimateData(currentTownship)}
              onOpenMethodology={() => setIsMethodologyOpen(true)}
              onOpenThresholds={() => setIsThresholdsModalOpen(true)}
              onNavigateToAssistant={handleNavigateToAssistant}
              currentUser={currentUser}
            />
          )}

          {activeModule === 'ai_assistant' && (
            <AiAssistant
              township={currentTownship}
              liveData={liveClimateData}
              messages={messages}
              isLoading={isAssistantLoading}
              error={assistantError}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              onRetry={handleRetryAssistant}
              initialPrompt={assistantInitialPrompt}
              lastQuery={lastQuery}
            />
          )}

          {activeModule === 'township_management' && (
            <TownshipManagement
              township={currentTownship}
              zones={zones}
              interventions={interventions}
              onToggleInterventionStatus={handleToggleInterventionStatus}
              onOpenMethodology={() => setIsMethodologyOpen(true)}
              currentUser={currentUser}
              managerNotes={managerNotes}
              onPublishNote={handlePublishManagerNote}
              onDeleteNote={handleDeleteManagerNote}
              onOpenThresholds={() => setIsThresholdsModalOpen(true)}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}

          {activeModule === 'scenario_simulator' && (
            <ScenarioSimulator
              township={currentTownship}
              onOpenMethodology={() => setIsMethodologyOpen(true)}
            />
          )}

          {activeModule === 'iot_sensors' && (
            <IotSensorMonitor
              township={currentTownship}
              sensors={sensors}
              onRefreshSensors={handleRefreshSensors}
            />
          )}

          {activeModule === 'green_rewards' && (
            <GreenRewards
              township={currentTownship}
              activities={activities}
              rewards={rewards}
              userPoints={userPoints}
              onLogActivity={handleLogActivity}
              onDeleteActivity={handleDeleteActivity}
              onRedeemReward={handleRedeemReward}
              onOpenMethodology={() => setIsMethodologyOpen(true)}
              isSyncing={isSyncingRewards}
            />
          )}
        </main>
      </div>

      {/* Illustrative Scoring Methodology Documentation Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      {/* Configurable Risk Thresholds Modal */}
      <ThresholdSettingsModal
        isOpen={isThresholdsModalOpen}
        onClose={() => setIsThresholdsModalOpen(false)}
        thresholds={thresholds}
        onUpdateThresholds={handleUpdateThresholds}
      />

      {/* Firebase Authentication & Preferences Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />
    </div>
  );
}
