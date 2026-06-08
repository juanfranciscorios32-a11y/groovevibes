/* ============================================================
   Groovevibes — Supabase Client
   ============================================================
   Inicializa el cliente de Supabase y expone helpers globales
   para auth/sesión/rol. Se carga ANTES del script principal
   del dashboard.

   Globals que expone:
     window.sb              → cliente de Supabase
     window.gvAuth          → namespace con helpers:
       gvAuth.getSession()           → promesa con session actual o null
       gvAuth.getUser()              → promesa con user actual o null
       gvAuth.getProfile()           → promesa con row de public.profiles
       gvAuth.signIn(email, pw)      → loguea, devuelve { error } o {}
       gvAuth.signOut()              → cierra sesión
       gvAuth.onAuthChange(cb)       → cb(event, session) en cada cambio
       gvAuth.isAdmin()              → bool, cacheado del último profile
       gvAuth.currentArtistaId()     → uuid|null del artista vinculado

   El profile se cachea en memoria para no pegarle a la DB
   en cada render. Se invalida en cada signIn / signOut / cambio
   de sesión.
   ============================================================ */

(function () {
  "use strict";

  // --- Config ----------------------------------------------------
  const SUPABASE_URL = "https://dueyypqwwtxezmnhfsgh.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_m6YiPQxPd1CdV2KVtDTM1A_i02ZpGtv";

  // --- Sanity check ---------------------------------------------
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error(
      "[gv] SDK de Supabase no cargado. Verificá que el <script> del CDN " +
      "esté ANTES de supabase-client.js en index.html."
    );
    return;
  }

  // --- Cliente ---------------------------------------------------
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,        // guarda la sesión en localStorage de supabase
      autoRefreshToken: true,      // refresca el JWT automáticamente
      detectSessionInUrl: true,    // soporta magic-link callbacks (cuando lo activemos)
      storageKey: "gv-auth",       // key custom para evitar colisión con otras apps
    },
  });

  // --- Cache de profile -----------------------------------------
  let cachedProfile = null;   // { id, email, full_name, role, artista_id, ... }
  let cachedUserId = null;

  async function fetchProfile(userId) {
    if (!userId) return null;
    const { data, error } = await sb
      .from("profiles")
      .select("id, email, full_name, role, artista_id, created_at, updated_at")
      .eq("id", userId)
      .single();
    if (error) {
      console.error("[gv] error leyendo profile:", error.message);
      return null;
    }
    return data;
  }

  async function refreshProfileFromSession(session) {
    const userId = session?.user?.id ?? null;
    if (userId !== cachedUserId) {
      cachedUserId = userId;
      cachedProfile = await fetchProfile(userId);
    } else if (userId && !cachedProfile) {
      cachedProfile = await fetchProfile(userId);
    }
    return cachedProfile;
  }

  // --- API pública ----------------------------------------------
  const gvAuth = {
    async getSession() {
      const { data, error } = await sb.auth.getSession();
      if (error) {
        console.error("[gv] getSession:", error.message);
        return null;
      }
      return data.session;
    },

    async getUser() {
      const session = await gvAuth.getSession();
      return session?.user ?? null;
    },

    async getProfile(force = false) {
      const session = await gvAuth.getSession();
      if (!session) return null;
      if (force || !cachedProfile || cachedUserId !== session.user.id) {
        cachedUserId = session.user.id;
        cachedProfile = await fetchProfile(session.user.id);
      }
      return cachedProfile;
    },

    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return { error };
      cachedUserId = data.session.user.id;
      cachedProfile = await fetchProfile(cachedUserId);
      return { session: data.session, profile: cachedProfile };
    },

    async signOut() {
      cachedProfile = null;
      cachedUserId = null;
      const { error } = await sb.auth.signOut();
      return { error };
    },

    onAuthChange(cb) {
      // Pasa el event + session al callback y mantiene cache sincronizado.
      const { data: subscription } = sb.auth.onAuthStateChange(async (event, session) => {
        if (!session) {
          cachedProfile = null;
          cachedUserId = null;
        } else if (cachedUserId !== session.user.id) {
          cachedUserId = session.user.id;
          cachedProfile = await fetchProfile(cachedUserId);
        }
        try { cb(event, session, cachedProfile); }
        catch (e) { console.error("[gv] auth change handler:", e); }
      });
      return subscription;
    },

    isAdmin() {
      return cachedProfile?.role === "admin";
    },

    currentArtistaId() {
      return cachedProfile?.artista_id ?? null;
    },

    // Útil para debugging desde la consola
    _debug() {
      return { cachedProfile, cachedUserId, sb };
    },
  };

  // --- Expone globals -------------------------------------------
  window.sb = sb;
  window.gvAuth = gvAuth;

  console.log("[gv] Supabase client inicializado contra", SUPABASE_URL);
})();
