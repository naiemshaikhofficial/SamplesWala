/**
 * 🌠 Trustpilot Signal Protocol
 * Handles automated review invitations via the JavaScript Integration API.
 */

export function triggerTrustpilotInvitation(email: string, name: string, referenceId: string) {
  if (typeof window !== 'undefined' && (window as any).tp) {
    console.log(`[TRUSTPILOT] Triggering invitation for ${email} (Ref: ${referenceId})`);
    try {
      (window as any).tp('createInvitation', {
        recipientEmail: email,
        recipientName: name,
        referenceId: referenceId,
        source: 'InvitationLink'
      });
    } catch (err) {
      console.error("[TRUSTPILOT_ERROR] Failed to trigger invitation signal:", err);
    }
  } else {
    console.warn("[TRUSTPILOT] Signal engine not initialized or running in SSR context.");
  }
}
