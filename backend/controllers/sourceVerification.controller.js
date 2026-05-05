import SourceVerification from '../models/sourceVerificationSchema.model.js'
const DOMAIN_TIERS = {
  verified: [
    "fssai.gov.in", "mohfw.gov.in", "pib.gov.in", "india.gov.in",
    "mca.gov.in", "sebi.gov.in", "rbi.org.in", "uidai.gov.in",
    "who.int", "cdc.gov", "nih.gov", "fda.gov", "europa.eu",
    "sci.gov.in", "indiankanoon.org",
    "pubmed.ncbi.nlm.nih.gov", "scholar.google.com", "jstor.org",
    "researchgate.net", "arxiv.org", "thelancet.com", "nejm.org",
  ],
  credible: [
    "thehindu.com", "hindustantimes.com", "ndtv.com", "indianexpress.com",
    "timesofindia.indiatimes.com", "livemint.com", "business-standard.com",
    "scroll.in", "thewire.in", "theprint.in", "firstpost.com",
    "deccanherald.com", "telegraphindia.com",
    "bbc.com", "bbc.co.uk", "reuters.com", "apnews.com", "theguardian.com",
    "nytimes.com", "washingtonpost.com", "bloomberg.com", "ft.com",
    "aljazeera.com", "dw.com",
    "factchecker.in", "boomlive.in", "altnews.in", "snopes.com",
    "politifact.com",
  ],
  flagged: [
    "theonion.com", "fauxy.com", "postcard.news",
    "worldnewsdailyreport.com", "nationalreport.net",
  ],
};

// Labels
const TIER_LABELS = {
  verified: "Government / Academic Source",
  credible: "Established News Outlet",
  flagged: "Known Misinformation Source",
  unknown: "Unknown Source",
};

// Fast lookup map
const DOMAIN_MAP = {};

for (const [tier, domains] of Object.entries(DOMAIN_TIERS)) {
  domains.forEach((domain) => {
    DOMAIN_MAP[domain] = { tier, label: TIER_LABELS[tier] };
  });
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
const extractDomain = (url) => {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

const lookupDomain = (domain) => {
  if (DOMAIN_MAP[domain]) return DOMAIN_MAP[domain];

  // subdomain support
  const parts = domain.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    const parent = parts.slice(i).join(".");
    if (DOMAIN_MAP[parent]) return DOMAIN_MAP[parent];
  }

  // heuristic
  if (
    domain.endsWith(".gov.in") ||
    domain.endsWith(".gov") ||
    domain.endsWith(".edu") ||
    domain.endsWith(".ac.in") ||
    domain.endsWith(".edu.in")
  ) {
    return { tier: "verified", label: "Government / Educational Institution" };
  }

  return { tier: "unknown", label: TIER_LABELS.unknown };
};



// ✅ POST verify
export const verifySource = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url?.trim())
      return res.status(400).json({ message: "URL is required" });

    const domain = extractDomain(url);
    if (!domain)
      return res.status(400).json({ message: "Invalid URL" });

    // cache (7 days)
    const cached = await SourceVerification.findOne({
      domain,
      checkedAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    if (cached) {
      return res.json({
        tier: cached.tier,
        label: cached.label,
        domain,
        url,
      });
    }

    const { tier, label } = lookupDomain(domain);

    await SourceVerification.findOneAndUpdate(
      { domain },
      { url, domain, tier, label, checkedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.json({ tier, label, domain, url });
  } catch (err) {
    console.error("verifySource error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET verify (query param)
export const verifySourceGet = async (req, res) => {
  req.body = { url: req.query.url };
  return verifySource(req, res);
};