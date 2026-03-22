/* ════════════════════════════════════════
   CONFIG.JS — App Configuration
   Resource Atlas | DYFTZ
   
   ⚠️  SETUP REQUIRED:
   Fill in your Supabase credentials and
   Claude API Edge Function URL below.
════════════════════════════════════════ */

const CONFIG = {

  /* ── Supabase Backend ──────────────────
     Register free at: https://supabase.com
     Get these from: Project Settings → API  */
  SUPABASE_URL:      '',   // e.g. 'https://abcxyzabc.supabase.co'
  SUPABASE_ANON_KEY: '',   // e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

  /* ── AI Matching Edge Function ─────────
     Deploy the Edge Function from /backend/
     then paste the URL here               */
  AI_EDGE_FN: '',          // e.g. 'https://abcxyzabc.supabase.co/functions/v1/ai-match'

  /* ── File Storage ──────────────────────
     Uses Supabase Storage by default.
     For Cloudflare R2, set R2_PUBLIC_URL   */
  STORAGE_BUCKET:  'attachments',
  R2_PUBLIC_URL:   '',     // optional: 'https://pub-xxx.r2.dev'

  /* ── Email Notifications ───────────────
     Register free at: https://resend.com   */
  RESEND_EDGE_FN:  '',     // e.g. 'https://abcxyzabc.supabase.co/functions/v1/send-email'
  ADMIN_EMAIL:     '',     // e.g. 'admin@dyftz.com'

  /* ── Resource Limits ───────────────────  */
  FILE_MAX_MB:    10,      // max size per file (MB)
  FILES_PER_RES:  5,       // max files per resource entry

  /* ── AI Daily Quota ────────────────────  */
  AI_QUOTA: {
    admin:  999999,
    vip:    50,
    editor: 10,
  },

  /* ── Demo Mode ─────────────────────────
     true  = use in-memory demo data (no backend needed)
     false = use real Supabase backend               */
  DEMO_MODE: true,

};
