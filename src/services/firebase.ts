import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FbUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import { firebaseConfig } from '../config/firebaseConfig.ts';
import {
  AppUser,
  ResidentPreferences,
  PersistedGreenActivity,
  PersistedRewardBalance,
  PersistedTownshipConfig,
  PersistedManagerNote,
  UserRole,
} from '../types/firebase.ts';

// ----------------------------------------------------------------------
// Firebase App & Service Initialization
// ----------------------------------------------------------------------
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);

// Use the specific firestoreDatabaseId provisioned in firebase-applet-config.json
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Validate connection to Firestore on app boot
 * Required constraint from Firebase Integration Skill
 */
export async function testFirestoreConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { connected: true };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is currently offline or connecting...');
      return { connected: false, error: error.message };
    }
    // If the server responded (even with permission-denied or not-found), connection is live
    return { connected: true };
  }
}

// ----------------------------------------------------------------------
// Authentication Helpers
// ----------------------------------------------------------------------

/**
 * Sign in anonymously for zero-friction review of the hackathon prototype
 */
export async function signInAsGuest(role: UserRole = 'resident'): Promise<AppUser> {
  const activeRole = (localStorage.getItem('climasense_active_role') as UserRole) || role;
  const isManagerRole = activeRole === 'township_manager';
  const defaultDisplayName = isManagerRole ? 'Elmina Township Manager' : 'Elmina Resident';
  let uid = '';
  let email: string | null = null;
  let isAnon = true;

  try {
    const cred = await signInAnonymously(auth);
    uid = cred.user.uid;
    email = cred.user.email || null;
    isAnon = true;
    await updateProfile(cred.user, { displayName: defaultDisplayName });
  } catch (err: unknown) {
    const fbErr = err as { code?: string; message?: string };
    console.warn('Anonymous auth unavailable, trying demo account fallback:', fbErr?.code);

    const demoEmail = isManagerRole
      ? 'demo.manager@climasense.internal'
      : 'demo.resident@climasense.internal';
    const demoPassword = 'ClimaSenseDemo2026!';

    try {
      const cred = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
      uid = cred.user.uid;
      email = cred.user.email;
      isAnon = false;
    } catch (loginErr: unknown) {
      const loginFbErr = loginErr as { code?: string };
      if (
        loginFbErr?.code === 'auth/user-not-found' ||
        loginFbErr?.code === 'auth/invalid-credential'
      ) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
          uid = cred.user.uid;
          email = cred.user.email;
          isAnon = false;
          await updateProfile(cred.user, { displayName: defaultDisplayName });
        } catch (createErr) {
          console.warn('Could not create demo email account:', createErr);
        }
      }
    }

    // If cloud auth providers are disabled in Firebase Console, use persistent local guest session
    if (!uid) {
      let storedUid = localStorage.getItem('climasense_guest_uid');
      if (!storedUid) {
        storedUid = `guest-${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem('climasense_guest_uid', storedUid);
      }
      uid = storedUid;
      email = null;
      isAnon = true;
    }
  }

  // If testing as manager, provision the manager authority doc so rules pass
  if (isManagerRole && auth.currentUser) {
    try {
      await setDoc(doc(db, 'managers', uid), {
        userId: uid,
        role: 'township_manager',
        assignedTownshipId: 'elmina',
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Note: manager authority record already exists or restricted by rules', e);
    }
  }

  const existingProfile = await getUserProfile(uid);
  if (existingProfile) {
    if (existingProfile.role !== role) {
      try {
        await updateDoc(doc(db, 'users', uid), {
          role,
          displayName: defaultDisplayName,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Updating user profile role in db:', e);
      }
      existingProfile.role = role;
      existingProfile.displayName = defaultDisplayName;
    }
    return existingProfile;
  }

  const newProfile: AppUser = {
    uid,
    email: email || null,
    displayName: defaultDisplayName,
    role,
    isAnonymous: isAnon,
    townshipId: 'elmina',
    preferences: {
      alertHeat: true,
      alertRain: true,
      alertAqi: true,
      preferredZone: 'Elmina Central Park',
    },
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(`climasense_profile_${uid}`, JSON.stringify(newProfile));
  if (auth.currentUser) {
    try {
      await setDoc(doc(db, 'users', uid), newProfile);
    } catch (e) {
      console.warn('Saving new profile to Firestore:', e);
    }
  }
  return newProfile;
}

/**
 * Register with email and password
 */
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName: string,
  role: UserRole = 'resident'
): Promise<AppUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const uid = cred.user.uid;

  await updateProfile(cred.user, { displayName });

  if (role === 'township_manager') {
    try {
      await setDoc(doc(db, 'managers', uid), {
        userId: uid,
        role: 'township_manager',
        assignedTownshipId: 'elmina',
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Setting manager authority:', e);
    }
  }

  const newProfile: AppUser = {
    uid,
    email,
    displayName,
    role,
    isAnonymous: false,
    townshipId: 'elmina',
    preferences: {
      alertHeat: true,
      alertRain: true,
      alertAqi: true,
      preferredZone: 'Elmina Central Park',
    },
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', uid), newProfile);
  return newProfile;
}

/**
 * Sign in with email and password
 */
export async function loginWithEmail(email: string, pass: string): Promise<AppUser> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const profile = await getUserProfile(cred.user.uid);
  if (profile) return profile;

  // Fallback initial profile if not previously created
  const newProfile: AppUser = {
    uid: cred.user.uid,
    email: cred.user.email,
    displayName: cred.user.displayName || email.split('@')[0],
    role: 'resident',
    isAnonymous: false,
    townshipId: 'elmina',
    preferences: {
      alertHeat: true,
      alertRain: true,
      alertAqi: true,
      preferredZone: 'Elmina Central Park',
    },
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', cred.user.uid), newProfile);
  return newProfile;
}

/**
 * Sign out
 */
export async function logOut(): Promise<void> {
  await fbSignOut(auth);
}

// ----------------------------------------------------------------------
// User Profile & Preferences Persistence
// ----------------------------------------------------------------------
export async function getUserProfile(uid: string): Promise<AppUser | null> {
  if (auth.currentUser && auth.currentUser.uid === uid) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data() as AppUser;
        localStorage.setItem(`climasense_profile_${uid}`, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('Reading user profile from Firestore:', err);
    }
  }

  const cached = localStorage.getItem(`climasense_profile_${uid}`);
  if (cached) {
    try {
      return JSON.parse(cached) as AppUser;
    } catch {}
  }
  return null;
}

export async function updateUserPreferences(
  uid: string,
  preferences: ResidentPreferences
): Promise<void> {
  const cached = localStorage.getItem(`climasense_profile_${uid}`);
  if (cached) {
    try {
      const profile = JSON.parse(cached);
      profile.preferences = preferences;
      profile.updatedAt = new Date().toISOString();
      localStorage.setItem(`climasense_profile_${uid}`, JSON.stringify(profile));
    } catch {}
  }

  try {
    await updateDoc(doc(db, 'users', uid), {
      preferences,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Saving preferences to Firestore:', err);
  }
}

export async function toggleUserRole(uid: string, nextRole: UserRole): Promise<void> {
  if (nextRole === 'township_manager' && auth.currentUser) {
    try {
      await setDoc(doc(db, 'managers', uid), {
        userId: uid,
        role: 'township_manager',
        assignedTownshipId: 'elmina',
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Granting manager authority:', e);
    }
  }

  localStorage.setItem('climasense_active_role', nextRole);

  const cached = localStorage.getItem(`climasense_profile_${uid}`);
  if (cached) {
    try {
      const profile = JSON.parse(cached);
      profile.role = nextRole;
      profile.displayName = nextRole === 'township_manager' ? 'Elmina Township Manager' : 'Elmina Resident';
      profile.updatedAt = new Date().toISOString();
      localStorage.setItem(`climasense_profile_${uid}`, JSON.stringify(profile));
    } catch {}
  }

  try {
    await updateDoc(doc(db, 'users', uid), {
      role: nextRole,
      displayName: nextRole === 'township_manager' ? 'Elmina Township Manager' : 'Elmina Resident',
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Updating role in Firestore:', e);
  }
}

// ----------------------------------------------------------------------
// Green Activity Persistence
// ----------------------------------------------------------------------
export async function saveGreenActivityRecord(
  activity: PersistedGreenActivity
): Promise<void> {
  const localKey = `climasense_acts_${activity.userId}`;
  try {
    const existing: PersistedGreenActivity[] = JSON.parse(localStorage.getItem(localKey) || '[]');
    const filtered = existing.filter((a) => a.id !== activity.id);
    localStorage.setItem(localKey, JSON.stringify([activity, ...filtered]));
  } catch {}

  try {
    await setDoc(doc(db, 'green_activities', activity.id), activity);
  } catch (err) {
    console.warn('Saving green activity to Firestore:', err);
  }
}

export async function fetchUserGreenActivities(
  userId: string
): Promise<PersistedGreenActivity[]> {
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const q = query(
        collection(db, 'green_activities'),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      const items: PersistedGreenActivity[] = [];
      snap.forEach((docSnap) => {
        items.push(docSnap.data() as PersistedGreenActivity);
      });
      if (items.length > 0) {
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        localStorage.setItem(`climasense_acts_${userId}`, JSON.stringify(items));
        return items;
      }
    } catch (err) {
      console.warn('Fetching activities from Firestore:', err);
    }
  }

  const cached = localStorage.getItem(`climasense_acts_${userId}`);
  if (cached) {
    try {
      return JSON.parse(cached) as PersistedGreenActivity[];
    } catch {}
  }
  return [];
}

export async function deleteUserGreenActivity(
  activityId: string
): Promise<void> {
  // Update local storage
  const keys = Object.keys(localStorage).filter((k) => k.startsWith('climasense_acts_'));
  for (const k of keys) {
    try {
      const items: PersistedGreenActivity[] = JSON.parse(localStorage.getItem(k) || '[]');
      const filtered = items.filter((a) => a.id !== activityId);
      localStorage.setItem(k, JSON.stringify(filtered));
    } catch {}
  }

  try {
    await deleteDoc(doc(db, 'green_activities', activityId));
  } catch (err) {
    console.warn('Deleting activity from Firestore:', err);
  }
}

// ----------------------------------------------------------------------
// Reward Balances Persistence
// ----------------------------------------------------------------------
export async function saveRewardBalanceRecord(
  balance: PersistedRewardBalance
): Promise<void> {
  localStorage.setItem(`climasense_balance_${balance.userId}`, JSON.stringify(balance));
  try {
    await setDoc(doc(db, 'reward_balances', balance.userId), balance);
  } catch (err) {
    console.warn('Saving reward balance to Firestore:', err);
  }
}

export async function fetchRewardBalanceRecord(
  userId: string
): Promise<PersistedRewardBalance | null> {
  if (auth.currentUser && auth.currentUser.uid === userId) {
    try {
      const snap = await getDoc(doc(db, 'reward_balances', userId));
      if (snap.exists()) {
        const data = snap.data() as PersistedRewardBalance;
        localStorage.setItem(`climasense_balance_${userId}`, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('Fetching reward balance from Firestore:', err);
    }
  }

  const cached = localStorage.getItem(`climasense_balance_${userId}`);
  if (cached) {
    try {
      return JSON.parse(cached) as PersistedRewardBalance;
    } catch {}
  }
  return null;
}

// ----------------------------------------------------------------------
// Township Config Persistence
// ----------------------------------------------------------------------
export async function fetchTownshipConfigDoc(
  townshipId: string
): Promise<PersistedTownshipConfig | null> {
  try {
    const snap = await getDoc(doc(db, 'township_configs', townshipId));
    if (snap.exists()) {
      const data = snap.data() as PersistedTownshipConfig;
      localStorage.setItem(`climasense_config_${townshipId}`, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Fetching township config doc from Firestore:', err);
  }

  const cached = localStorage.getItem(`climasense_config_${townshipId}`);
  if (cached) {
    try {
      return JSON.parse(cached) as PersistedTownshipConfig;
    } catch {}
  }
  return null;
}

export async function saveTownshipConfigDoc(
  config: PersistedTownshipConfig
): Promise<void> {
  localStorage.setItem(`climasense_config_${config.townshipId}`, JSON.stringify(config));
  try {
    await setDoc(doc(db, 'township_configs', config.townshipId), config);
  } catch (err) {
    console.warn('Saving township config to Firestore:', err);
  }
}

// ----------------------------------------------------------------------
// Township Manager Notes Persistence
// ----------------------------------------------------------------------
export const DEFAULT_MANAGER_NOTES: PersistedManagerNote[] = [
  {
    id: 'note-seed-1',
    townshipId: 'elmina',
    title: 'Pre-Monsoon Bioretention & Bioswale Desilting',
    zoneId: 'Elmina Valley Lakeside',
    category: 'drainage_maintenance',
    content: 'Preventative sediment clearing completed along cascading retention cells 3 and 4. Buffer capacity is at 100% design absorption for anticipated afternoon convective cells.',
    authorId: 'system_manager',
    authorName: 'Sime Darby Property Operations',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'note-seed-2',
    townshipId: 'elmina',
    title: 'Shade Canopy Expansion Notice: Hope Seedling Nursery',
    zoneId: 'Elmina Central Park',
    category: 'tree_planting',
    content: '300 native rainforest saplings staged at the Central Park nursery for upcoming community planting day. High-canopy dipterocarps targeted for unshaded western active spines.',
    authorId: 'system_manager',
    authorName: 'Elmina Township Landscape Unit',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export async function fetchManagerNotesList(
  townshipId: string
): Promise<PersistedManagerNote[]> {
  try {
    const snap = await getDocs(collection(db, 'manager_notes'));
    const notes: PersistedManagerNote[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as PersistedManagerNote;
      if (data.townshipId === townshipId) {
        notes.push(data);
      }
    });
    if (notes.length > 0) {
      notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      localStorage.setItem(`climasense_notes_${townshipId}`, JSON.stringify(notes));
      return notes;
    }
  } catch (err) {
    console.warn('Fetching manager notes from Firestore:', err);
  }

  const cached = localStorage.getItem(`climasense_notes_${townshipId}`);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as PersistedManagerNote[];
      if (parsed.length > 0) return parsed;
    } catch {}
  }

  localStorage.setItem(`climasense_notes_${townshipId}`, JSON.stringify(DEFAULT_MANAGER_NOTES));
  return DEFAULT_MANAGER_NOTES;
}

export async function saveManagerNoteDoc(
  note: PersistedManagerNote
): Promise<void> {
  const localKey = `climasense_notes_${note.townshipId}`;
  try {
    const existing: PersistedManagerNote[] = JSON.parse(localStorage.getItem(localKey) || '[]');
    const filtered = existing.filter((n) => n.id !== note.id);
    localStorage.setItem(localKey, JSON.stringify([note, ...filtered]));
  } catch {}

  try {
    await setDoc(doc(db, 'manager_notes', note.id), note);
  } catch (err) {
    console.warn('Saving manager note to Firestore:', err);
  }
}

export async function deleteManagerNoteDoc(
  noteId: string
): Promise<void> {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith('climasense_notes_'));
  for (const k of keys) {
    try {
      const notes: PersistedManagerNote[] = JSON.parse(localStorage.getItem(k) || '[]');
      const filtered = notes.filter((n) => n.id !== noteId);
      localStorage.setItem(k, JSON.stringify(filtered));
    } catch {}
  }

  try {
    await deleteDoc(doc(db, 'manager_notes', noteId));
  } catch (err) {
    console.warn('Deleting manager note from Firestore:', err);
  }
}
