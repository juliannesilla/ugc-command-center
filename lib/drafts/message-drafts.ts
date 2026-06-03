// A.AA Wave B7 — real send-ready message drafts surfaced for review.
//
// Source: JOAN's drafted SideShift/email replies (_meta/dashboard-spec/
// 06-a14y-wave-0.9-drafted-messages.md), tone-verified against the canonical
// outreach templates. These are REAL drafts (HR-49) — Julz reviews, copies,
// sends. Rendered on /drafts.

export interface MessageDraft {
  id: string;
  brand: string;
  contact: string;
  channel: 'SideShift' | 'Email';
  sendTo: string;
  url: string;
  status: 'ready';
  notes: string;
  text: string;
}

export const MESSAGE_DRAFTS: MessageDraft[] = [
  {
    id: 'mwm-alicia',
    brand: 'MWM.ai',
    contact: 'Alicia',
    channel: 'SideShift',
    sendTo: 'SideShift — MWM.ai thread (Alicia)',
    url: 'https://app.sideshift.app/chat',
    status: 'ready',
    notes: 'Signed contract. 5 P0 clarifications: video length · tone guide · usage-rights window · do-not-say list · whether YouTube Shorts are required or optional.',
    text: `Hi Alicia,

Thank you again for getting the agreement over to me — I really appreciate it, and I'm excited to start building the content plan for MWM.ai.

Before I map out the first batch, I want to make sure I'm building everything to spec from the start. A few quick clarifications:

1. Video length: is there a target length or range you'd like the TikTok, Reels, and Shorts to land in?
2. Tone: do you have a per-post tone guide or a few reference posts so I can match the voice you're going for?
3. Usage rights: what's the usage window for the content once it's posted (how long, and which placements)?
4. Anything off-limits: is there a "do not say" list or any claims, phrasing, or competitors I should avoid?
5. YouTube Shorts: I see Shorts listed alongside TikTok and Reels. Are those a required part of each cycle, or optional cross-posting on top of the core posts?

Once I have these, I'll have the first batch mapped quickly. Thank you again, I am genuinely grateful for the opportunity to be considered among so many talented creators.

Respectfully,
Julianne Silla
💌: julianne.mktg@gmail.com
🔗: www.juliannesilla.com`,
  },
  {
    id: 'phobaxx-jayson',
    brand: 'Phobaxx',
    contact: 'Jayson',
    channel: 'SideShift',
    sendTo: 'SideShift — Phobaxx thread (Jayson)',
    url: 'https://app.sideshift.app/chat',
    status: 'ready',
    notes: 'Signed contract, 30 posts/month organic-native. 3 P0s: video-only vs photo/carousel mix · minimum product visibility · FTC disclosure phrasing.',
    text: `Hi Jayson,

Thank you again for the opportunity with Phobaxx — I really appreciate it, and I'm getting the content plan organized now.

Before I lock the first batch, three quick clarifications so I build it correctly:

1. Format mix: are all 30 monthly posts meant to be video, or are photo and carousel posts acceptable for some of them as long as they feel native and show the product clearly?
2. Product visibility: is there a minimum bar for how prominently the product needs to appear in each post (for example, on-screen for a set portion, clearly named, or shown in use)?
3. FTC disclosure: how would you like paid partnership disclosed? I want to match your preferred wording and placement (for example, "paid partnership" label, #ad, or specific copy).

Once these are set, I'll have the first batch mapped quickly. Thank you again, I am genuinely grateful for the opportunity to be considered among so many talented creators.

Respectfully,
Julianne Silla
💌: julianne.mktg@gmail.com
🔗: www.juliannesilla.com`,
  },
  {
    id: 'ca-campaign',
    brand: 'CA Campaign',
    contact: 'Hi there (name unknown — swap if you know it)',
    channel: 'SideShift',
    sendTo: 'SideShift — CA Campaign thread (California Republic flag avatar)',
    url: 'https://app.sideshift.app/chat',
    status: 'ready',
    notes: '14 days awaiting. Confirm onboarding done + submit handles. HR-10: opens "Hi there," (name unknown). Confirm your IG handle + that the contract is signed before sending.',
    text: `Hi there,

Thank you again for the opportunity to join the campaign — I really appreciate it, and I'm glad to be moving forward.

I've gone through the onboarding steps on my end and I'm getting everything submitted. Here are my handles for the campaign:

- TikTok: @geezjulz
- Instagram: @geezjulz

If there's anything else you need from me to finish setup, or any handle or detail you'd like confirmed, just let me know and I'll get it over to you right away. Thank you again, I am genuinely grateful for the opportunity to be considered among so many talented creators.

Respectfully,
Julianne Silla
💌: julianne.mktg@gmail.com
🔗: www.juliannesilla.com`,
  },
  {
    id: 'triips-omar',
    brand: 'Triips.com',
    contact: 'Omar (founder)',
    channel: 'Email',
    sendTo: 'EMAIL → triipsugc@gmail.com (their SideShift inbox is UNMONITORED — send by email + book the Tally call)',
    url: 'https://tally.so/r/pbLgVq',
    status: 'ready',
    notes: 'Founder selected you for the Creator Program. Book the 15-min call at the Tally link, then email this. Do NOT rely on a SideShift reply (Omar said they do not monitor it).',
    text: `Hi Omar,

Thank you so much for selecting me for the Triips Creator Program — I'm genuinely excited, and the mission of making travel more accessible through real flight deals is exactly the kind of thing I love creating around.

I'm booking my 15-minute onboarding call through the Tally link now, and I'll go through the setup steps on the redirect page so I'm ready before we talk.

A couple of things I'd love to cover on the call so I can hit the ground running: the content direction and deliverables you're envisioning, posting cadence and platforms, usage rights, and the payment structure. If it's easier to share any of that in writing beforehand, I'm happy to review it so I come prepared with ideas.

Thank you again, I am genuinely grateful for the opportunity to be considered among so many talented creators.

Respectfully,
Julianne Silla
💌: julianne.mktg@gmail.com
🔗: www.juliannesilla.com`,
  },
  {
    id: 'blint',
    brand: 'Blint',
    contact: 'Hi there (name unknown)',
    channel: 'SideShift',
    sendTo: 'SideShift — Blint thread',
    url: 'https://app.sideshift.app/chat',
    status: 'ready',
    notes: 'They asked for a 20-30s sample. This requests the written brief BEFORE filming (your established pattern — protect time before unpaid production). If you would rather just film the clip, say so and I will swap to the sample-attached version.',
    text: `Hi there,

Thank you so much for thinking of me for this — I really appreciate it, and I'm interested in putting together a short sample for you.

Before I film, would you be able to share a quick written overview of what you're looking for? Even a few lines on the topic or angle, the tone, the deliverables and posting expectations, usage rights, and the payment structure would help me make sure the sample actually reflects how I'd create for the brand.

Once I have that, I'm happy to turn around the 20-30 second video quickly. Thank you again, I am genuinely grateful for the opportunity to be considered among so many talented creators.

Respectfully,
Julianne Silla
💌: julianne.mktg@gmail.com
🔗: www.juliannesilla.com`,
  },
  {
    id: 'aniwell',
    brand: 'Aniwell',
    contact: 'deepgrade78 (campaign rep)',
    channel: 'SideShift',
    sendTo: 'SideShift — Aniwell thread (rep: deepgrade78)',
    url: 'https://app.sideshift.app/chat',
    status: 'ready',
    notes: 'Forward-moving follow-up (you already opened warmly). Confirms the eval-only sample + folds in intake (deliverables, usage, timeline, payment) so the promised written contract arrives with real terms.',
    text: `Hi there,

Thank you again for the opportunity — I'm glad to keep this moving, and I'm happy to put together a sample so you can evaluate the fit and make sure it aligns with the brand.

So the sample lands as close to your vision as possible, is there a topic, product, or angle you'd like me to use, along with a target length and tone? Any reference posts you love would help too.

Whenever it's convenient, I'd also love to see the written overview you mentioned so I understand the full scope before we finalize anything: the deliverables, posting expectations, usage rights, timeline, and payment structure. That way the agreement reflects everything clearly on both sides.

Thank you again, I am genuinely grateful for the opportunity to be considered among so many talented creators.

Respectfully,
Julianne Silla
💌: julianne.mktg@gmail.com
🔗: www.juliannesilla.com`,
  },
];
