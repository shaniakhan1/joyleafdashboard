// ============================================================
// JOYLEAF DASHBOARD DATA FILE
// ============================================================
// Update this file monthly. Every number you change here
// automatically updates every chart and scorecard on the dashboard.
// No coding needed. Just update the numbers and push to GitHub.
// ============================================================

const DASHBOARD_DATA = {

  // REPORTING PERIOD
  period: {
    label: "Mar 24 – Apr 20, 2026",
    month: "April 2026"
  },

  // GOOGLE BUSINESS PROFILE
  // (Will auto-update once Google API access is granted)
  google: {
    searches: 4820,
    searches_change: 18,
    direction_requests: 1240,
    direction_change: 22,
    phone_calls: 380,
    phone_change: 15,
    website_clicks: 920,
    website_change: 31,
    photo_views: 8400,
    photo_change: 44,
    // Monthly history for charts (last 6 months, oldest first)
    search_history: [3800, 3950, 4100, 4250, 4090, 4820],
    search_history_labels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]
  },

  // INSTAGRAM
  instagram: {
    views: 26600,
    views_change: 85.3,
    reach: 3300,
    reach_change: 168.7,
    interactions: 750,
    interactions_change: 111.3,
    new_follows: 115,
    follows_change: 33.7,
    non_follower_reach: 2267,
    non_follower_change: 349.8,
    // Monthly history
    views_history: [8200, 10500, 13200, 16800, 14300, 26600],
    reach_history: [820, 990, 1100, 1400, 1240, 3300],
    history_labels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]
  },

  // FACEBOOK
  facebook: {
    views: 2400,
    views_change: 36.1,
    interactions: 85,
    interactions_change: 44.1,
    page_visits: 340,
    page_visits_change: 9,
    new_follows: 5,
    follows_change: 150,
    // Monthly history
    views_history: [1400, 1600, 1900, 2100, 1760, 2400],
    history_labels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]
  },

  // YOUTUBE
  youtube: {
    views: 808,
    subscribers: 11,
    new_subs: 1,
    views_history: [420, 510, 600, 720, 690, 808],
    history_labels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]
  },

  // LINKEDIN
  linkedin: {
    impressions: 582,
    reactions: 8,
    followers: 682
  },

  // LEAFLY
  leafly: {
    sessions: 298,
    sessions_change: 3,
    reviews: 4,
    orders: 12,
    orders_change: -14,
    deal_orders: 10,
    deal_orders_change: 67,
    gmv: 1237,
    gmv_change: 6,
    sessions_history: [210, 240, 255, 270, 290, 298],
    gmv_history: [820, 940, 1050, 1100, 1170, 1237],
    history_labels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]
  },

  // WEEDMAPS
  weedmaps: {
    dispensary_clicks: 129,
    delivery_clicks: 164,
    listing_visitors: 134,
    contact_clicks: 17,
    monthly_spend: 408,
    dispensary_spend: 376,
    delivery_spend: 31,
    gmv: 123
  },

  // YELP
  yelp: {
    impressions: 1400,
    page_visits: 50,
    leads: 13,
    website_visits: 8,
    direction_views: 5,
    calls: 0
  },

  // REVIEW MANAGEMENT
  reviews: {
    rating: 4.9,
    five_star_pct: 78,
    four_star_pct: 14,
    three_star_pct: 5,
    one_two_star_pct: 3,
    // Competitor review counts
    joyleaf_count: 2309,
    budzooka_count: 4627,
    breakwater_count: 400,
    botera_count: 180,
    ayr_count: 220
  },

  // SEO HEALTH SCORES (update monthly)
  seo: {
    overall_score: 82,
    overall_grade: "B+",
    review_authority_score: 78,
    review_authority_grade: "B+",
    gbp_score: 91,
    gbp_grade: "A-",
    onpage_score: 80,
    onpage_grade: "B",
    citation_score: 84,
    citation_grade: "B+",
    ai_visibility_score: 95,
    ai_visibility_grade: "A",
    // Score history for trend chart
    score_history: [74, 76, 78, 80, 81, 82],
    history_labels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]
  },

  // CONTENT DELIVERY
  content: {
    posts_delivered: 20,
    posts_agreed: 20,
    platforms: 5,
    google_posts: "Weekly"
  },

  // AI SEARCH VISIBILITY (update monthly via manual audit)
  ai_search: {
    platforms_ranking: 3,
    platforms_total: 4,
    audit_month: "April 2026",
    chatgpt_result: "Joyleaf listed as dispensary in Roselle NJ. Noted for in-store experience and product variety.",
    chatgpt_rank: "Mentioned",
    gemini_result: "Joyleaf appears in local results for Roselle NJ dispensary searches.",
    gemini_rank: "Mentioned",
    claude_result: "Joyleaf listed as primary in-Roselle option. Breakwater noted for craft/medical consistency.",
    claude_rank: "Mentioned",
    manus_result: "Pending audit",
    manus_rank: "Pending"
  },

  // NEIGHBORHOOD RANKINGS (update monthly from Local Falcon)
  rankings: [
    { market: "Roselle", drive: "Home", pop: "22K", dispensary: 1, near_me: 2, weed: 1, cannabis: 1, open_now: 1 },
    { market: "Roselle Park", drive: "5 min", pop: "14K", dispensary: 2, near_me: 3, weed: 2, cannabis: 3, open_now: 2 },
    { market: "Garwood", drive: "10 min", pop: "4.2K", dispensary: 3, near_me: 4, weed: 3, cannabis: 4, open_now: 3 },
    { market: "Cranford", drive: "7 min", pop: "24K", dispensary: 4, near_me: 5, weed: 4, cannabis: 5, open_now: 4 },
    { market: "Union", drive: "8 min", pop: "58K", dispensary: 5, near_me: 6, weed: 5, cannabis: 6, open_now: 5 },
    { market: "Elizabeth", drive: "10 min", pop: "137K", dispensary: 6, near_me: 7, weed: 6, cannabis: 7, open_now: 6 },
    { market: "Linden", drive: "12 min", pop: "43K", dispensary: 7, near_me: 8, weed: 7, cannabis: 8, open_now: 7 },
    { market: "Clark", drive: "12 min", pop: "16K", dispensary: 8, near_me: 9, weed: 8, cannabis: 9, open_now: 8 },
    { market: "Westfield", drive: "15 min", pop: "31K", dispensary: 9, near_me: 10, weed: 9, cannabis: 10, open_now: 9 },
    { market: "Newark/EWR", drive: "20 min", pop: "Traveler", dispensary: 0, near_me: 0, weed: 0, cannabis: 0, open_now: 0 }
  ]

};
