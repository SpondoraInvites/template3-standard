/* ============================================================
   STANDARD TEMPLATE — CLIENT CONFIG (Zayan & Mahira)
   ------------------------------------------------------------
   The values the page's script needs live in this one object.
   Display copy (names, invitation letter, story chapters, venue
   blurb, day schedule) is hand-set in index.html — this template
   is written for one couple rather than rendered from config.

   NOTE: the sample couple's date below is placeholder data and
   has already passed, so the countdown reads "just married!".
   Set a real client's date here when reusing the template.
   ============================================================ */

const INVITE_CONFIG = {

  /* ---------- Wedding datetime ----------
     ISO format with timezone. Drives the live countdown and the
     Add-to-Calendar file. 4 PM Bangladesh time (UTC+6).          */
  weddingDateTime: "2026-09-12T16:00:00+06:00",

  /* ---------- Add-to-Calendar (.ics) ----------
     Generated locally in the guest's browser when the
     "Add to calendar" button is pressed. Commas in the location
     and description are escaped automatically.                  */
  calendar: {
    title: "Zayan & Mahira — Wedding",
    location: "The Royal Garden, Level 9, Polwel Carnation, Sector 8, Uttara, Dhaka, Bangladesh",
    description: "The wedding of Zayan and Mahira, at four in the afternoon on the rooftop garden.",
    durationHours: 7,                     // reception ends with the 11 PM shuttle
    filename: "zayan-weds-mahira.ics",
    prodid: "Zayan weds Mahira",
    uid: "zm-wedding-20260912@royalgarden",
  },

  /* ---------- Background music ----------
     A looping background nasheed ("NAFSIJI" — No Copyright Nasheed /
     Halal Sounds) at assets/music/nafsiji.mp3. Swap the file for the
     client's song when known. It never autoplays silently: the tap
     that opens the invitation, or the floating note button, starts
     it.                                                          */
  music: {
    src: "assets/music/nafsiji.mp3",
    volume: 0.6,
  },

  /* ---------- RSVP ----------
     Replies are remembered in the guest's own browser
     (localStorage) so a returning guest can update their reply.
     whatsapp opens a prefilled reply to the couple's number;
     guests must press Send in WhatsApp. Replace the sample number
     with the client's international number (digits only, no +),
     or set it to "" to keep replies local only.
     maxParty caps the seats stepper; the preview wording covers
     parties up to six.                                          */
  rsvp: {
    whatsapp: "8801712345678",
    storageKey: "zm_rsvp_v1",
    maxParty: 6,
  },
};

/* Export for reuse; safe to ignore in the browser. */
if (typeof module !== "undefined") {
  module.exports = INVITE_CONFIG;
}
