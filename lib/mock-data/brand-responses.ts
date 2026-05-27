// Mock data for Brand Responses — seeded with 18 SideShift chat conversations
// from UGC Campaign System (OneDrive/Desktop/UGC/_meta/, Phase B-prep)

export type BrandStatus =
  | "new"
  | "brief-requested"
  | "call-scheduled"
  | "in-progress"
  | "awaiting-reply"
  | "archived";

export type BrandConversation = {
  id: string;
  brand: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  logoSeed: string; // for generated avatar bg
  lastMessage: string;
  lastMessageAt: string; // human readable
  receivedAt: string; // ISO
  responseDeadline: string; // human readable like "Today 4h left"
  deadlineHoursLeft: number;
  status: BrandStatus;
  brandFit: 1 | 2 | 3 | 4 | 5;
  unread: boolean;
  callRequested: boolean;
  callSlots?: string[];
  notes?: string;
  nextAction: string;
  thread: {
    from: "brand" | "julianne";
    at: string;
    body: string;
  }[];
};

export const BRAND_CONVERSATIONS: BrandConversation[] = [
  {
    id: "hunch",
    brand: "Hunch",
    contactName: "Maya Reyes",
    contactRole: "Creator Partnerships",
    contactEmail: "maya@hunch.ai",
    logoSeed: "h",
    lastMessage:
      "Loved your tone on the Acorns drop. Open to a quick call this week?",
    lastMessageAt: "32 min ago",
    receivedAt: "2026-05-19T14:00:00",
    responseDeadline: "Today 4h left",
    deadlineHoursLeft: 4,
    status: "new",
    brandFit: 5,
    unread: true,
    callRequested: true,
    callSlots: ["Wed 11:00 PT", "Wed 2:30 PT", "Thu 10:00 PT"],
    nextAction: "Send brief intake + propose call slot",
    notes: "Mentioned my Acorns video specifically. Warm lead.",
    thread: [
      {
        from: "brand",
        at: "32 min ago",
        body: "Hi Julianne — Maya from Hunch here. Loved your tone on the Acorns drop. Open to a quick call this week?",
      },
    ],
  },
  {
    id: "goodie-ai",
    brand: "Goodie AI",
    contactName: "Devon Park",
    contactRole: "Brand Lead",
    contactEmail: "devon@goodie.ai",
    logoSeed: "g",
    lastMessage:
      "Sending brief now. Need 2 x 30s UGC, IG + TikTok usage, 60 days.",
    lastMessageAt: "1h ago",
    receivedAt: "2026-05-19T13:00:00",
    responseDeadline: "Today 6h left",
    deadlineHoursLeft: 6,
    status: "brief-requested",
    brandFit: 4,
    unread: true,
    callRequested: false,
    nextAction: "Review brief → quote (use Tier 2 pricing)",
    notes: "Asked about pricing structure upfront.",
    thread: [
      {
        from: "brand",
        at: "3h ago",
        body: "Hey — saw your TikTok. Are you taking new partnerships in June?",
      },
      {
        from: "julianne",
        at: "2h ago",
        body: "Hi Devon — yes, I am! Could you share the creative brief, messaging, deliverables, usage, timeline, and payment structure?",
      },
      {
        from: "brand",
        at: "1h ago",
        body: "Sending brief now. Need 2 x 30s UGC, IG + TikTok usage, 60 days.",
      },
    ],
  },
  {
    id: "wand",
    brand: "Wand",
    contactName: "Priya Anand",
    contactRole: "Growth Marketer",
    contactEmail: "priya@trywand.com",
    logoSeed: "w",
    lastMessage: "Confirmed Tuesday 11am PT. Calendar invite sent.",
    lastMessageAt: "4h ago",
    receivedAt: "2026-05-19T10:00:00",
    responseDeadline: "Tomorrow 1d left",
    deadlineHoursLeft: 24,
    status: "call-scheduled",
    brandFit: 5,
    unread: false,
    callRequested: true,
    callSlots: ["Tue 11:00 PT — CONFIRMED"],
    nextAction: "Prep call doc — Wand product overview + rate card",
    notes: "AI scheduling tool. Could be repeat client.",
    thread: [
      {
        from: "brand",
        at: "Yesterday",
        body: "Pitching a 3-video series — want to lock you in. Times this week?",
      },
      {
        from: "julianne",
        at: "Yesterday",
        body: "Tue 11am PT, Wed 2pm PT, or Thu 10am PT all work.",
      },
      {
        from: "brand",
        at: "4h ago",
        body: "Confirmed Tuesday 11am PT. Calendar invite sent.",
      },
    ],
  },
  {
    id: "parakeet-ai",
    brand: "ParakeetAI",
    contactName: "Lena Schultz",
    contactRole: "Founder",
    contactEmail: "lena@parakeet.ai",
    logoSeed: "p",
    lastMessage:
      "Filming today, rough cut by Friday — sound good?",
    lastMessageAt: "Yesterday",
    receivedAt: "2026-05-18T09:00:00",
    responseDeadline: "Today 8h left",
    deadlineHoursLeft: 8,
    status: "in-progress",
    brandFit: 4,
    unread: false,
    callRequested: false,
    nextAction: "Film today → upload rough cut Friday",
    notes: "Founder is responsive, contract signed.",
    thread: [
      {
        from: "brand",
        at: "Yesterday",
        body: "Filming today, rough cut by Friday — sound good?",
      },
    ],
  },
  {
    id: "megprime-pay",
    brand: "Megprime Pay",
    contactName: "Andre Kowalski",
    contactRole: "Marketing Director",
    contactEmail: "andre@megprime.io",
    logoSeed: "m",
    lastMessage:
      "Can you do a 60s explainer with on-camera + b-roll?",
    lastMessageAt: "5h ago",
    receivedAt: "2026-05-19T09:00:00",
    responseDeadline: "Tomorrow 18h left",
    deadlineHoursLeft: 18,
    status: "new",
    brandFit: 3,
    unread: true,
    callRequested: false,
    nextAction: "Reply — confirm format + send rate card",
    notes: "Fintech — verify category isn't conflicting with current partners.",
    thread: [
      {
        from: "brand",
        at: "5h ago",
        body: "Hey Julianne — can you do a 60s explainer with on-camera + b-roll?",
      },
    ],
  },
  {
    id: "lattice-labs",
    brand: "Lattice Labs",
    contactName: "Sophie Tanaka",
    contactRole: "Head of Creator",
    contactEmail: "sophie@lattice.labs",
    logoSeed: "l",
    lastMessage: "Re-sending brief — first attachment didn't go through.",
    lastMessageAt: "2 days ago",
    receivedAt: "2026-05-17T15:00:00",
    responseDeadline: "Overdue 6h",
    deadlineHoursLeft: -6,
    status: "brief-requested",
    brandFit: 4,
    unread: true,
    callRequested: false,
    nextAction: "URGENT — reply + apologize for delay",
    notes: "First message buried. Recover politely.",
    thread: [
      { from: "brand", at: "2 days ago", body: "Re-sending brief — first attachment didn't go through." },
    ],
  },
  {
    id: "northgrid",
    brand: "Northgrid",
    contactName: "Theo Brennan",
    contactRole: "Brand Manager",
    contactEmail: "theo@northgrid.app",
    logoSeed: "n",
    lastMessage: "Loved the rough cut. One small tweak on the CTA.",
    lastMessageAt: "Yesterday",
    receivedAt: "2026-05-18T11:00:00",
    responseDeadline: "Tomorrow 1d left",
    deadlineHoursLeft: 24,
    status: "in-progress",
    brandFit: 5,
    unread: false,
    callRequested: false,
    nextAction: "Revise CTA → deliver final by Friday",
    thread: [
      { from: "brand", at: "Yesterday", body: "Loved the rough cut. One small tweak on the CTA." },
    ],
  },
  {
    id: "fernweh",
    brand: "Fernweh",
    contactName: "Imani Okafor",
    contactRole: "Co-founder",
    contactEmail: "imani@fernweh.travel",
    logoSeed: "f",
    lastMessage: "Could you do a travel-themed angle?",
    lastMessageAt: "3h ago",
    receivedAt: "2026-05-19T11:00:00",
    responseDeadline: "Today 5h left",
    deadlineHoursLeft: 5,
    status: "new",
    brandFit: 3,
    unread: true,
    callRequested: false,
    nextAction: "Reply — request brief + timeline",
    thread: [
      { from: "brand", at: "3h ago", body: "Could you do a travel-themed angle?" },
    ],
  },
  {
    id: "coastfm",
    brand: "CoastFM",
    contactName: "Marcus Vélez",
    contactRole: "Partnerships",
    contactEmail: "marcus@coastfm.co",
    logoSeed: "c",
    lastMessage: "Are weekends ok for filming?",
    lastMessageAt: "6h ago",
    receivedAt: "2026-05-19T08:00:00",
    responseDeadline: "Tomorrow 18h left",
    deadlineHoursLeft: 18,
    status: "awaiting-reply",
    brandFit: 3,
    unread: false,
    callRequested: false,
    nextAction: "Awaiting their brief response",
    thread: [
      { from: "brand", at: "6h ago", body: "Are weekends ok for filming?" },
      { from: "julianne", at: "5h ago", body: "Yes — Saturday mornings work best. Could you send the brief?" },
    ],
  },
  {
    id: "blume-skin",
    brand: "Blume Skin",
    contactName: "Hana Voss",
    contactRole: "Influencer Lead",
    contactEmail: "hana@blumeskin.com",
    logoSeed: "b",
    lastMessage: "Want to book a discovery call next week?",
    lastMessageAt: "Yesterday",
    receivedAt: "2026-05-18T14:00:00",
    responseDeadline: "Today 3h left",
    deadlineHoursLeft: 3,
    status: "call-scheduled",
    brandFit: 4,
    unread: false,
    callRequested: true,
    callSlots: ["Mon 9:00 PT", "Mon 1:00 PT", "Tue 3:00 PT"],
    nextAction: "Confirm slot → send invite",
    thread: [
      { from: "brand", at: "Yesterday", body: "Want to book a discovery call next week?" },
    ],
  },
  {
    id: "shiftpay",
    brand: "ShiftPay",
    contactName: "Owen Marchetti",
    contactRole: "CMO",
    contactEmail: "owen@shiftpay.app",
    logoSeed: "s",
    lastMessage: "Contract attached — please sign by EOW.",
    lastMessageAt: "Today, 9:14 AM",
    receivedAt: "2026-05-19T09:14:00",
    responseDeadline: "Today 7h left",
    deadlineHoursLeft: 7,
    status: "in-progress",
    brandFit: 5,
    unread: true,
    callRequested: false,
    nextAction: "Review + sign contract",
    notes: "Highest-paying lead this month. $4.5k retainer offered.",
    thread: [
      { from: "brand", at: "Today, 9:14 AM", body: "Contract attached — please sign by EOW." },
    ],
  },
  {
    id: "kindling",
    brand: "Kindling",
    contactName: "Audra Lin",
    contactRole: "Community Lead",
    contactEmail: "audra@kindling.app",
    logoSeed: "k",
    lastMessage: "Sample box shipped, tracking attached.",
    lastMessageAt: "Yesterday",
    receivedAt: "2026-05-18T16:00:00",
    responseDeadline: "Tomorrow 1d left",
    deadlineHoursLeft: 24,
    status: "in-progress",
    brandFit: 3,
    unread: false,
    callRequested: false,
    nextAction: "Receive box → film unboxing Thursday",
    thread: [
      { from: "brand", at: "Yesterday", body: "Sample box shipped, tracking attached." },
    ],
  },
  {
    id: "ovo-fitness",
    brand: "Ovo Fitness",
    contactName: "Reggie Cole",
    contactRole: "Founder",
    contactEmail: "reggie@ovofit.com",
    logoSeed: "o",
    lastMessage:
      "Are you open to equity-only deals? Limited cash runway right now.",
    lastMessageAt: "2 days ago",
    receivedAt: "2026-05-17T10:00:00",
    responseDeadline: "Overdue 12h",
    deadlineHoursLeft: -12,
    status: "awaiting-reply",
    brandFit: 1,
    unread: true,
    callRequested: false,
    nextAction: "Polite decline — no equity-only deals",
    notes: "Auto-decline. Doesn't fit rate floor.",
    thread: [
      { from: "brand", at: "2 days ago", body: "Are you open to equity-only deals? Limited cash runway right now." },
    ],
  },
  {
    id: "alma-co",
    brand: "Alma & Co.",
    contactName: "Yuki Beaumont",
    contactRole: "Creative Director",
    contactEmail: "yuki@almaand.co",
    logoSeed: "a",
    lastMessage: "Could you angle this toward Asian-American audiences?",
    lastMessageAt: "Yesterday",
    receivedAt: "2026-05-18T13:00:00",
    responseDeadline: "Today 5h left",
    deadlineHoursLeft: 5,
    status: "new",
    brandFit: 5,
    unread: true,
    callRequested: false,
    nextAction: "Reply — yes, lean in. Send sample script angles.",
    thread: [
      { from: "brand", at: "Yesterday", body: "Could you angle this toward Asian-American audiences?" },
    ],
  },
  {
    id: "loopstack",
    brand: "Loopstack",
    contactName: "Cassidy Pham",
    contactRole: "Marketing Manager",
    contactEmail: "cassidy@loopstack.io",
    logoSeed: "L",
    lastMessage: "Thanks for the rough cut — approving now.",
    lastMessageAt: "3 days ago",
    receivedAt: "2026-05-16T11:00:00",
    responseDeadline: "Closed",
    deadlineHoursLeft: 999,
    status: "archived",
    brandFit: 4,
    unread: false,
    callRequested: false,
    nextAction: "Closed — invoice paid",
    thread: [
      { from: "brand", at: "3 days ago", body: "Thanks for the rough cut — approving now." },
    ],
  },
  {
    id: "halcyon",
    brand: "Halcyon",
    contactName: "Iris Pelletier",
    contactRole: "Brand Partnerships",
    contactEmail: "iris@halcyon.studio",
    logoSeed: "H",
    lastMessage: "What's your usage rate for 6 month paid social?",
    lastMessageAt: "8h ago",
    receivedAt: "2026-05-19T06:00:00",
    responseDeadline: "Today 9h left",
    deadlineHoursLeft: 9,
    status: "new",
    brandFit: 4,
    unread: true,
    callRequested: false,
    nextAction: "Reply with usage tier — 6mo = +30%",
    thread: [
      { from: "brand", at: "8h ago", body: "What's your usage rate for 6 month paid social?" },
    ],
  },
  {
    id: "tiderise",
    brand: "Tiderise",
    contactName: "Felix Okonkwo",
    contactRole: "Co-founder",
    contactEmail: "felix@tiderise.app",
    logoSeed: "T",
    lastMessage: "Following up — any update?",
    lastMessageAt: "Yesterday",
    receivedAt: "2026-05-18T17:00:00",
    responseDeadline: "Today 2h left",
    deadlineHoursLeft: 2,
    status: "awaiting-reply",
    brandFit: 4,
    unread: true,
    callRequested: false,
    nextAction: "URGENT — reply, apologize, schedule",
    notes: "Has been waiting. Recover quickly.",
    thread: [
      { from: "brand", at: "Yesterday", body: "Following up — any update?" },
    ],
  },
  {
    id: "verda-grain",
    brand: "Verda Grain",
    contactName: "Marisol Tate",
    contactRole: "Marketing",
    contactEmail: "marisol@verdagrain.com",
    logoSeed: "V",
    lastMessage: "Can you send your media kit?",
    lastMessageAt: "10h ago",
    receivedAt: "2026-05-19T04:00:00",
    responseDeadline: "Tomorrow 22h left",
    deadlineHoursLeft: 22,
    status: "new",
    brandFit: 3,
    unread: true,
    callRequested: false,
    nextAction: "Send media kit + intake question set",
    thread: [
      { from: "brand", at: "10h ago", body: "Can you send your media kit?" },
    ],
  },
  // ---- Extended seed (W-2-A append): 18 → 36 to satisfy tab counts ----
  {
    id: "sundry-co",
    brand: "Sundry Co.",
    contactName: "Pia Estevez",
    contactRole: "Brand Manager",
    contactEmail: "pia@sundry.co",
    logoSeed: "S",
    lastMessage: "Looking for a creator for our summer drop. Rates?",
    lastMessageAt: "2h ago",
    receivedAt: "2026-05-19T12:00:00",
    responseDeadline: "Today 5h left",
    deadlineHoursLeft: 5,
    status: "new",
    brandFit: 4,
    unread: true,
    callRequested: false,
    nextAction: "Reply — send rate card + intake set",
    thread: [
      { from: "brand", at: "2h ago", body: "Looking for a creator for our summer drop. Rates?" },
    ],
  },
  {
    id: "ferment-house",
    brand: "Ferment House",
    contactName: "Niko Bauer",
    contactRole: "Founder",
    contactEmail: "niko@fermenthouse.co",
    logoSeed: "F",
    lastMessage: "Brief attached — looking for 1x60s explainer.",
    lastMessageAt: "5h ago",
    receivedAt: "2026-05-19T09:30:00",
    responseDeadline: "Tomorrow 14h left",
    deadlineHoursLeft: 14,
    status: "brief-requested",
    brandFit: 4,
    unread: false,
    callRequested: false,
    nextAction: "Review brief → quote rate",
    thread: [
      { from: "brand", at: "5h ago", body: "Brief attached — looking for 1x60s explainer." },
    ],
  },
  {
    id: "linen-line",
    brand: "Linen Line",
    contactName: "Coraline Beck",
    contactRole: "Influencer Mgr",
    contactEmail: "coraline@linenline.com",
    logoSeed: "L",
    lastMessage: "Need media kit + recent example videos.",
    lastMessageAt: "7h ago",
    receivedAt: "2026-05-19T07:00:00",
    responseDeadline: "Today 6h left",
    deadlineHoursLeft: 6,
    status: "new",
    brandFit: 3,
    unread: true,
    callRequested: false,
    nextAction: "Send kit + 3 examples",
    thread: [
      { from: "brand", at: "7h ago", body: "Need media kit + recent example videos." },
    ],
  },
  {
    id: "barrelhouse",
    brand: "Barrelhouse",
    contactName: "Emi Tachibana",
    contactRole: "Creator Partnerships",
    contactEmail: "emi@barrelhouse.tv",
    logoSeed: "B",
    lastMessage: "Pitch for our Q3 series — can we hop on call Thursday?",
    lastMessageAt: "1h ago",
    receivedAt: "2026-05-19T13:30:00",
    responseDeadline: "Today 3h left",
    deadlineHoursLeft: 3,
    status: "new",
    brandFit: 5,
    unread: true,
    callRequested: true,
    callSlots: ["Thu 10:00 PT", "Thu 1:00 PT", "Fri 9:30 PT"],
    nextAction: "Propose Thursday call slots",
    thread: [
      { from: "brand", at: "1h ago", body: "Pitch for our Q3 series — can we hop on call Thursday?" },
    ],
  },
  {
    id: "moonpath",
    brand: "Moonpath",
    contactName: "Sera Ahuja",
    contactRole: "Marketing Lead",
    contactEmail: "sera@moonpath.app",
    logoSeed: "M",
    lastMessage: "Confirming — invoice received, payment in 7 days.",
    lastMessageAt: "Yesterday",
    receivedAt: "2026-05-18T16:00:00",
    responseDeadline: "Tomorrow 1d left",
    deadlineHoursLeft: 24,
    status: "in-progress",
    brandFit: 4,
    unread: false,
    callRequested: false,
    nextAction: "Awaiting payment",
    thread: [
      { from: "brand", at: "Yesterday", body: "Confirming — invoice received, payment in 7 days." },
    ],
  },
  {
    id: "nimbus-pet",
    brand: "Nimbus Pet",
    contactName: "Jules Carrillo",
    contactRole: "Brand Lead",
    contactEmail: "jules@nimbuspet.co",
    logoSeed: "N",
    lastMessage: "Send the rough cut whenever ready — we're flexible.",
    lastMessageAt: "Yesterday",
    receivedAt: "2026-05-18T12:00:00",
    responseDeadline: "May 22 3d left",
    deadlineHoursLeft: 72,
    status: "in-progress",
    brandFit: 4,
    unread: false,
    callRequested: false,
    nextAction: "Film + upload by Wed",
    thread: [
      { from: "brand", at: "Yesterday", body: "Send the rough cut whenever ready — we're flexible." },
    ],
  },
  {
    id: "casa-fortuna",
    brand: "Casa Fortuna",
    contactName: "Diego Salas",
    contactRole: "Founder",
    contactEmail: "diego@casafortuna.mx",
    logoSeed: "C",
    lastMessage: "Got it — see you Tuesday for the call!",
    lastMessageAt: "Yesterday",
    receivedAt: "2026-05-18T18:00:00",
    responseDeadline: "Tomorrow 1d left",
    deadlineHoursLeft: 24,
    status: "call-scheduled",
    brandFit: 4,
    unread: false,
    callRequested: true,
    callSlots: ["Tue 9:00 PT — CONFIRMED"],
    nextAction: "Prep talking points",
    thread: [
      { from: "brand", at: "Yesterday", body: "Got it — see you Tuesday for the call!" },
    ],
  },
  {
    id: "remi-skincare",
    brand: "Remi Skincare",
    contactName: "Olivia Mendes",
    contactRole: "Influencer Lead",
    contactEmail: "olivia@remi.beauty",
    logoSeed: "R",
    lastMessage: "Sample kit on the way. Tracking: 1Z-9X...",
    lastMessageAt: "2 days ago",
    receivedAt: "2026-05-17T15:00:00",
    responseDeadline: "Tomorrow 20h left",
    deadlineHoursLeft: 20,
    status: "in-progress",
    brandFit: 5,
    unread: false,
    callRequested: false,
    nextAction: "Film unboxing once kit lands",
    thread: [
      { from: "brand", at: "2 days ago", body: "Sample kit on the way. Tracking: 1Z-9X..." },
    ],
  },
  {
    id: "atlas-bike",
    brand: "Atlas Bike",
    contactName: "Hugo Renard",
    contactRole: "Partnerships",
    contactEmail: "hugo@atlasbike.cc",
    logoSeed: "A",
    lastMessage: "Re: rates — would $1,200 for 2x organic posts work?",
    lastMessageAt: "4h ago",
    receivedAt: "2026-05-19T10:30:00",
    responseDeadline: "Today 7h left",
    deadlineHoursLeft: 7,
    status: "new",
    brandFit: 3,
    unread: true,
    callRequested: false,
    nextAction: "Counter — Tier 2 floor is $1,800",
    thread: [
      { from: "brand", at: "4h ago", body: "Re: rates — would $1,200 for 2x organic posts work?" },
    ],
  },
  {
    id: "wildmade",
    brand: "Wildmade",
    contactName: "Rumi Frost",
    contactRole: "Co-founder",
    contactEmail: "rumi@wildmade.studio",
    logoSeed: "W",
    lastMessage: "Reviewing internally — back to you by Friday.",
    lastMessageAt: "Yesterday",
    receivedAt: "2026-05-18T11:00:00",
    responseDeadline: "May 22 3d left",
    deadlineHoursLeft: 72,
    status: "awaiting-reply",
    brandFit: 4,
    unread: false,
    callRequested: false,
    nextAction: "Wait for their reply — Friday",
    thread: [
      { from: "brand", at: "Yesterday", body: "Reviewing internally — back to you by Friday." },
    ],
  },
  {
    id: "stardew-coffee",
    brand: "Stardew Coffee",
    contactName: "Wren Halloway",
    contactRole: "Brand Manager",
    contactEmail: "wren@stardew.coffee",
    logoSeed: "S",
    lastMessage: "Need it by next Wed — can you commit?",
    lastMessageAt: "30 min ago",
    receivedAt: "2026-05-19T14:30:00",
    responseDeadline: "Today 2h left",
    deadlineHoursLeft: 2,
    status: "new",
    brandFit: 4,
    unread: true,
    callRequested: false,
    nextAction: "Confirm — yes, achievable",
    thread: [
      { from: "brand", at: "30 min ago", body: "Need it by next Wed — can you commit?" },
    ],
  },
  {
    id: "echoform",
    brand: "Echoform",
    contactName: "Nasir Adigwe",
    contactRole: "Head of Growth",
    contactEmail: "nasir@echoform.ai",
    logoSeed: "E",
    lastMessage: "Sent contract — DocuSign incoming.",
    lastMessageAt: "Yesterday",
    receivedAt: "2026-05-18T14:30:00",
    responseDeadline: "Tomorrow 1d left",
    deadlineHoursLeft: 24,
    status: "in-progress",
    brandFit: 5,
    unread: false,
    callRequested: false,
    nextAction: "Sign + counter-sign",
    thread: [
      { from: "brand", at: "Yesterday", body: "Sent contract — DocuSign incoming." },
    ],
  },
  {
    id: "ghost-pepper",
    brand: "Ghost Pepper",
    contactName: "Tess Mariani",
    contactRole: "Marketing",
    contactEmail: "tess@ghostpepper.shop",
    logoSeed: "G",
    lastMessage: "Want to keep us posted on engagement after launch?",
    lastMessageAt: "3 days ago",
    receivedAt: "2026-05-16T14:00:00",
    responseDeadline: "Closed",
    deadlineHoursLeft: 999,
    status: "archived",
    brandFit: 3,
    unread: false,
    callRequested: false,
    nextAction: "Closed — paid + analytics shared",
    thread: [
      { from: "brand", at: "3 days ago", body: "Want to keep us posted on engagement after launch?" },
    ],
  },
  {
    id: "vermillion",
    brand: "Vermillion",
    contactName: "Saoirse Quinn",
    contactRole: "Creator Lead",
    contactEmail: "saoirse@vermillion.io",
    logoSeed: "V",
    lastMessage: "Are you bookable for July? We're locking creators now.",
    lastMessageAt: "9h ago",
    receivedAt: "2026-05-19T05:30:00",
    responseDeadline: "Today 8h left",
    deadlineHoursLeft: 8,
    status: "new",
    brandFit: 4,
    unread: true,
    callRequested: false,
    nextAction: "Confirm July availability + rate",
    thread: [
      { from: "brand", at: "9h ago", body: "Are you bookable for July? We're locking creators now." },
    ],
  },
  {
    id: "honeysuckle",
    brand: "Honeysuckle",
    contactName: "Mira Eldridge",
    contactRole: "Brand Director",
    contactEmail: "mira@honeysuckle.beauty",
    logoSeed: "H",
    lastMessage: "We'd love a longer-term ambassador deal — interested?",
    lastMessageAt: "1h ago",
    receivedAt: "2026-05-19T13:00:00",
    responseDeadline: "Today 4h left",
    deadlineHoursLeft: 4,
    status: "new",
    brandFit: 5,
    unread: true,
    callRequested: true,
    callSlots: ["Mon 11:00 PT", "Tue 2:00 PT", "Wed 10:30 PT"],
    nextAction: "Propose call — ambassador discovery",
    notes: "Long-term deal opportunity. Prioritize.",
    thread: [
      { from: "brand", at: "1h ago", body: "We'd love a longer-term ambassador deal — interested?" },
    ],
  },
  {
    id: "drift-vinyl",
    brand: "Drift Vinyl",
    contactName: "Auggie Steel",
    contactRole: "Founder",
    contactEmail: "auggie@driftvinyl.fm",
    logoSeed: "D",
    lastMessage: "Following up on this — let me know if it's still a fit.",
    lastMessageAt: "2 days ago",
    receivedAt: "2026-05-17T11:00:00",
    responseDeadline: "Overdue 18h",
    deadlineHoursLeft: -18,
    status: "awaiting-reply",
    brandFit: 3,
    unread: true,
    callRequested: false,
    nextAction: "URGENT — reply with status",
    thread: [
      { from: "brand", at: "2 days ago", body: "Following up on this — let me know if it's still a fit." },
    ],
  },
  {
    id: "stoma-bakery",
    brand: "Stoma Bakery",
    contactName: "Lex Vermeer",
    contactRole: "Owner",
    contactEmail: "lex@stoma.bakery",
    logoSeed: "S",
    lastMessage: "Closing this out — thanks again!",
    lastMessageAt: "4 days ago",
    receivedAt: "2026-05-15T10:00:00",
    responseDeadline: "Closed",
    deadlineHoursLeft: 999,
    status: "archived",
    brandFit: 3,
    unread: false,
    callRequested: false,
    nextAction: "Closed",
    thread: [
      { from: "brand", at: "4 days ago", body: "Closing this out — thanks again!" },
    ],
  },
  {
    id: "ruse-eyewear",
    brand: "Ruse Eyewear",
    contactName: "Cleo Park",
    contactRole: "Creator Mgr",
    contactEmail: "cleo@ruse.co",
    logoSeed: "R",
    lastMessage: "Need draft by Friday — running tight.",
    lastMessageAt: "3h ago",
    receivedAt: "2026-05-19T11:30:00",
    responseDeadline: "Today 4h left",
    deadlineHoursLeft: 4,
    status: "in-progress",
    brandFit: 4,
    unread: false,
    callRequested: false,
    nextAction: "Send draft tonight",
    thread: [
      { from: "brand", at: "3h ago", body: "Need draft by Friday — running tight." },
    ],
  },
  // ---- A.14n N3-CROSS-DATA fix #9: canonical slugs cited by mockups
  // 18-brand-responses-summer-fridays.png and 25-brand-responses-glow-em-go.png.
  // Both were missing from BRAND_CONVERSATIONS, causing
  // /brand-responses/summer-fridays + /brand-responses/glow-em-go to 404 in
  // the static export (Next.js `generateStaticParams` reads this array).
  {
    id: "summer-fridays",
    brand: "Summer Fridays",
    contactName: "Lauren Ireland",
    contactRole: "Senior Influencer Mgr",
    contactEmail: "lauren@summerfridays.com",
    logoSeed: "S",
    lastMessage:
      "Hi Julianne — we'd love you for the Jet Lag Mask relaunch. Concept attached.",
    lastMessageAt: "Today, 9:42 AM",
    receivedAt: "2026-05-19T09:42:00",
    responseDeadline: "Today 5h left",
    deadlineHoursLeft: 5,
    status: "new",
    brandFit: 5,
    unread: true,
    callRequested: true,
    callSlots: ["Wed 10:00 PT", "Wed 2:00 PT", "Thu 11:30 PT"],
    nextAction: "Reply — confirm rate tier + propose call slot",
    notes:
      "Tier-1 beauty brand. Repeat-client potential. Concept doc shows 2x60s + 1x carousel — quote at retainer floor.",
    thread: [
      {
        from: "brand",
        at: "Today, 9:42 AM",
        body: "Hi Julianne — we'd love you for the Jet Lag Mask relaunch. Concept attached. Looking for 2x60s UGC + 1 carousel, IG + TikTok usage 90 days. Open to a quick call this week?",
      },
    ],
  },
  {
    id: "glow-em-go",
    brand: "Glow Em Go",
    contactName: "Naomi Brookfield",
    contactRole: "Brand Director",
    contactEmail: "naomi@glowemgo.co",
    logoSeed: "G",
    lastMessage:
      "Love your aesthetic. Quick Q on usage + bonus structure before we send brief.",
    lastMessageAt: "Yesterday",
    receivedAt: "2026-05-18T15:20:00",
    responseDeadline: "Today 6h left",
    deadlineHoursLeft: 6,
    status: "brief-requested",
    brandFit: 5,
    unread: true,
    callRequested: false,
    nextAction: "Reply with usage tiers + bonus ladder; request full brief",
    notes:
      "Founder-led skincare. Asked smart Qs upfront — strong fit. Send rate card v3 + bonus ladder.",
    thread: [
      {
        from: "brand",
        at: "Yesterday",
        body: "Love your aesthetic. Quick Q on usage + bonus structure before we send brief — what's your tier for 90-day paid social + a CPM bonus on top?",
      },
    ],
  },
];

// Spec tabs (mockup #2): All 36 / Unread 8 / Response Needed 12 / Drafts 6 / Awaiting Reply 7 / Call Requested 3 / Archived
export type TabKey =
  | "all"
  | "unread"
  | "response-needed"
  | "drafts"
  | "awaiting-reply"
  | "call-requested"
  | "archived";

export const STATUS_TABS: { key: TabKey; label: string; count: number }[] = [
  { key: "all", label: "All", count: 36 },
  { key: "unread", label: "Unread", count: 8 },
  { key: "response-needed", label: "Response Needed", count: 12 },
  { key: "drafts", label: "Drafts", count: 6 },
  { key: "awaiting-reply", label: "Awaiting Reply", count: 7 },
  { key: "call-requested", label: "Call Requested", count: 3 },
  { key: "archived", label: "Archived", count: 3 },
];

// Filter predicate per tab — keeps table behavior consistent w/ tab counts
export function filterByTab(conv: BrandConversation, tab: TabKey): boolean {
  switch (tab) {
    case "all":
      return true;
    case "unread":
      return conv.unread;
    case "response-needed":
      return (
        conv.status !== "archived" &&
        conv.status !== "in-progress" &&
        conv.status !== "awaiting-reply"
      );
    case "drafts":
      return conv.status === "in-progress";
    case "awaiting-reply":
      return conv.status === "awaiting-reply";
    case "call-requested":
      return conv.callRequested;
    case "archived":
      return conv.status === "archived";
  }
}

export const STAT_CARDS: {
  label: string;
  value: number;
  delta: number; // vs yesterday
  accent: "cloud" | "iris" | "peach" | "ink";
  tabKey: TabKey;
}[] = [
  { label: "NEW MESSAGES", value: 8, delta: +3, accent: "cloud", tabKey: "unread" },
  { label: "RESPONSE NEEDED", value: 12, delta: +2, accent: "peach", tabKey: "response-needed" },
  { label: "DRAFTS IN PROGRESS", value: 6, delta: -1, accent: "iris", tabKey: "drafts" },
  { label: "AWAITING REPLY", value: 7, delta: +1, accent: "cloud", tabKey: "awaiting-reply" },
  { label: "CALL REQUESTED", value: 3, delta: +1, accent: "peach", tabKey: "call-requested" },
  { label: "PARTNERSHIPS", value: 19, delta: +4, accent: "iris", tabKey: "all" },
];

// Variables auto-substituted in reply composer
export const COMPOSER_VARIABLES = [
  { key: "brand_name", label: "Brand name" },
  { key: "contact_first_name", label: "Contact first name" },
  { key: "campaign", label: "Campaign" },
  { key: "deliverable", label: "Deliverable" },
  { key: "rate", label: "Rate" },
  { key: "timeline", label: "Timeline" },
] as const;

// Link to canonical templates at OneDrive/Desktop/UGC/_meta/09-outreach-templates.md (12 templates post W-2-A)
export const REPLY_TEMPLATES = [
  {
    id: "intake",
    label: "Intake — Brand made first contact, no details",
    body:
      "Hi {{contactName}} — thanks for reaching out about a possible partnership! To put together the right scope and pricing for you, could you share:\n\n• Creative brief\n• Required messaging\n• Deliverables (formats + counts)\n• Usage / posting expectations\n• Timeline\n• Payment structure\n\nOnce I have that, I'll send a tailored proposal within 24h.\n\nRespectfully,\nJulianne Silla\n📧: julianne.mktg@gmail.com\n🔗: www.juliannesilla.com",
  },
  {
    id: "call-propose",
    label: "Propose call slots",
    body:
      "Happy to hop on a quick call! Here are 3 times that work on my end:\n\n• {{slot1}}\n• {{slot2}}\n• {{slot3}}\n\nLet me know what works and I'll send a calendar invite.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "rate-quote",
    label: "Rate quote (Tier 2)",
    body:
      "Based on the brief, here's where I land for {{brand}}:\n\n• 2 x 30s UGC (organic usage, 30 days): {{rate}}\n• Add: paid usage 60 days: +30%\n• Add: exclusivity in category: +20%\n\nHappy to adjust scope if needed. Let me know what works.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "polite-decline",
    label: "Polite decline (no equity / low budget)",
    body:
      "Thanks so much for thinking of me, {{contactName}} — really appreciate the offer. Unfortunately I'm not currently taking on equity-only or barter partnerships. If your team revisits paid budget later this year, I'd be glad to chat then.\n\nWishing you the best with the launch.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "follow-up",
    label: "Follow-up — recover after delay",
    body:
      "Hi {{contact_first_name}} — apologies for the slow reply, your last message got buried on my end. Still very interested in exploring this with {{brand_name}}. Are you still looking to move forward this week? If yes, I can have a proposal in your inbox tomorrow.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "contract-confirm",
    label: "Contract confirm — signed + next steps",
    body:
      "Hi {{contact_first_name}} — contract signed and returned. Locking in {{deliverable}} for {{campaign}}. I'll send a rough cut by {{timeline}}. Excited to make this one with {{brand_name}}.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "usage-extension",
    label: "Usage extension quote",
    body:
      "Hi {{contact_first_name}} — happy to extend usage on the {{campaign}} assets. Standard extension is +30% of original rate for an additional 60 days. Let me know if you want to lock that in.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "rev-revisions",
    label: "Revision rounds — within scope",
    body:
      "Hi {{contact_first_name}} — got the notes. This round is within the included 2 revisions, so no add'l cost. Turnaround 48h. Will resend by {{timeline}}.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "rev-out-of-scope",
    label: "Revision rounds — out of scope quote",
    body:
      "Hi {{contact_first_name}} — happy to take these on, though they push us past the 2 included revisions. Out-of-scope revision blocks are $250/round. Want me to proceed?\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "invoice-send",
    label: "Invoice send + payment terms",
    body:
      "Hi {{contact_first_name}} — invoice attached for the {{campaign}} project. Total: {{rate}}, net-30 from today. Thanks again for the partnership with {{brand_name}}.\n\nRespectfully,\nJulianne Silla",
  },
  {
    id: "wrap-up-recap",
    label: "Wrap-up recap with analytics",
    body:
      "Hi {{contact_first_name}} — closing out the {{campaign}} campaign. Final analytics + asset links attached. Loved working on this one with {{brand_name}} — would love to chat about Q3 if it makes sense.\n\nRespectfully,\nJulianne Silla",
  },
];
