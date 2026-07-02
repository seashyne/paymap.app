// v1.5: Graceful fallback when Firebase is not configured (dev mode)
import { cert, getApps, initializeApp, App } from "firebase-admin/app"
import { Auth, getAuth } from "firebase-admin/auth"

function isFirebaseConfigured() {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  )
}

let _adminApp: App | null = null
let _adminAuth: Auth | null = null

function getAdminApp(): App {
  if (_adminApp) return _adminApp
  if (!isFirebaseConfigured()) throw new Error("Firebase Admin not configured — use direct credentials login in dev")
  _adminApp = getApps()[0] ?? initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  })
  return _adminApp
}

export const firebaseAdminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (!_adminAuth) {
      _adminAuth = getAuth(getAdminApp())
    }
    return (_adminAuth as any)[prop]
  },
})

export function isFirebaseAdminAvailable() {
  return isFirebaseConfigured()
}
