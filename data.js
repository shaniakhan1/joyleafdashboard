// JOYLEAF DASHBOARD DATA FILE
// ============================================================
// Managed by the self-contained GitHub Actions daily refresh. See automation/github-actions/.
// Stale-source policy: unavailable or failed values are retained, never zeroed.
// ============================================================

const DASHBOARD_DATA = {
  "period": {
    "label": "Oct 14 – Nov 10, 2026",
    "month": "November 2026"
  },
  "google": {
    "searches": 19126,
    "searches_change": null,
    "direction_requests": 1448,
    "direction_change": null,
    "phone_calls": 218,
    "phone_change": null,
    "website_clicks": 5123,
    "website_change": null,
    "photo_views": 8400,
    "photo_change": null,
    "search_history": [
      4250,
      4090,
      4820,
      0,
      0,
      0
    ],
    "search_history_labels": [
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr"
    ]
  },
  "instagram": {
    "views": 27475,
    "views_change": null,
    "reach": 3300,
    "reach_change": null,
    "interactions": 772,
    "interactions_change": null,
    "new_follows": 75,
    "follows_change": null,
    "non_follower_reach": 2267,
    "non_follower_change": null,
    "views_history": [
      8200,
      10500,
      13200,
      16800,
      14300,
      26600
    ],
    "reach_history": [
      820,
      990,
      1100,
      1400,
      1240,
      3300
    ],
    "history_labels": [
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr"
    ]
  },
  "facebook": {
    "views": 5122,
    "views_change": null,
    "interactions": 121,
    "interactions_change": null,
    "page_visits": 486,
    "page_visits_change": null,
    "new_follows": 3,
    "follows_change": null,
    "views_history": [
      1400,
      1600,
      1900,
      2100,
      1760,
      2400
    ],
    "history_labels": [
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr"
    ]
  },
  "youtube": {
    "views": 6114,
    "subscribers": 44,
    "new_subs": 3,
    "views_history": [
      720,
      690,
      808,
      11249,
      8811,
      7267
    ],
    "history_labels": [
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr"
    ]
  },
  "linkedin": {
    "impressions": 948,
    "reactions": 34,
    "followers": 705
  },
  "leafly": {
    "sessions": 298,
    "sessions_change": null,
    "reviews": 4,
    "orders": 25,
    "orders_change": null,
    "deal_orders": 16,
    "deal_orders_change": null,
    "gmv": 3059.96,
    "gmv_change": null,
    "sessions_history": [
      210,
      240,
      255,
      270,
      290,
      298
    ],
    "gmv_history": [
      820,
      940,
      1050,
      1100,
      1170,
      1237
    ],
    "history_labels": [
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr"
    ]
  },
  "weedmaps": {
    "dispensary_clicks": 129,
    "delivery_clicks": 164,
    "listing_visitors": 134,
    "contact_clicks": 17,
    "monthly_spend": 595,
    "dispensary_spend": 376,
    "delivery_spend": 31,
    "gmv": 30.41,
    "unique_shoppers": 315,
    "orders": 1
  },
  "yelp": {
    "impressions": 1400,
    "page_visits": 50,
    "leads": 13,
    "website_visits": 8,
    "direction_views": 5,
    "calls": 0
  },
  "reviews": {
    "rating": 4.900000095367432,
    "five_star_pct": 78,
    "four_star_pct": 14,
    "three_star_pct": 5,
    "one_two_star_pct": 3,
    "joyleaf_count": 3220,
    "budzooka_count": 4627,
    "breakwater_count": 400,
    "botera_count": 180,
    "ayr_count": 220
  },
  "seo": {
    "overall_score": 82,
    "overall_grade": "B+",
    "review_authority_score": 78,
    "review_authority_grade": "B+",
    "gbp_score": 91,
    "gbp_grade": "A-",
    "onpage_score": 80,
    "onpage_grade": "B",
    "citation_score": 84,
    "citation_grade": "B+",
    "ai_visibility_score": 95,
    "ai_visibility_grade": "A",
    "score_history": [
      74,
      76,
      78,
      80,
      81,
      82
    ],
    "history_labels": [
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr"
    ]
  },
  "content": {
    "posts_delivered": 20,
    "posts_agreed": 20,
    "platforms": 5,
    "google_posts": "Weekly"
  },
  "ai_search": {
    "schema_version": 1,
    "status": "measured",
    "collected_at": "2026-11-11T17:11:30.200Z",
    "checked_date": "2026-11-11",
    "collection_method": "manual-browser-check",
    "title": "AI answer presence baseline",
    "prompts": [
      {
        "id": "local_roselle",
        "kind": "discovery",
        "text": "List cannabis dispensaries physically located in Roselle, New Jersey. Give each business name and official website. Use current public web sources."
      },
      {
        "id": "nearby_roselle_park",
        "kind": "discovery",
        "text": "Which dispensary businesses serve Roselle Park, New Jersey? Give each business name and official website. Use current public web sources."
      },
      {
        "id": "independent_union_county",
        "kind": "discovery",
        "text": "List independently owned cannabis dispensary businesses in Union County, New Jersey. Give each business name and official website. Use current public web sources."
      },
      {
        "id": "branded_details",
        "kind": "branded_accuracy",
        "text": "What is the official website and street address of Joyleaf in Roselle, New Jersey? Use current public web sources."
      }
    ],
    "method": {
      "repetitions_per_prompt": 1,
      "language": "English",
      "geography": "Roselle, Roselle Park and Union County, New Jersey, explicitly named in each applicable prompt",
      "fresh_conversation_per_prompt": true,
      "web_sources_requested": true,
      "metrics": {
        "brand_mentions": "Number of completed nonbranded discovery answers naming Joyleaf or Joy Leaf and clearly identifying the Roselle business, including qualified mentions.",
        "website_links": "Number of completed nonbranded discovery answers containing a direct link to joyleaf.com. Prompts explicitly request official websites.",
        "branded_accuracy": "Separate website/address check; excluded from discovery counts."
      },
      "limitations": [
        "One dated manual check of three local discovery prompts per accessible assistant, not a representative sample of all searches.",
        "Mention counts include qualified mentions and do not mean a recommendation, endorsement or verified independent ownership.",
        "Website links were requested in the prompts; this does not measure unsolicited citation frequency.",
        "ChatGPT was logged out with its default model not identified by the interface. Gemini used Flash in temporary chats while signed in. Claude used Sonnet 5.5 Medium in fresh incognito chats while signed in on its free plan. These surfaces are not controlled equivalents.",
        "No traffic, impressions, reach, market share, search volume, persistent ranking or growth is inferred.",
        "No automation is active. Future comparisons must repeat the same prompt set and record surface/mode changes.",
        "Outputs may contain errors about other businesses. This baseline records Joyleaf presence, not the correctness of each entire answer.",
        "Claude's three discovery mentions include two qualified mentions where it could not verify Joyleaf's official website; its county query did not confirm independent ownership. Its branded website/address answer was correct but based on secondhand sources."
      ]
    },
    "engines": [
      {
        "id": "chatgpt",
        "name": "ChatGPT",
        "status": "measured",
        "surface": "Logged-out ChatGPT web app",
        "model": "Default; version not shown",
        "discovery_completed": 3,
        "discovery_planned": 3,
        "brand_mentions": 3,
        "website_links": 2,
        "checks": [
          {
            "prompt_id": "local_roselle",
            "status": "completed",
            "brand_mentioned": true,
            "website_linked": true,
            "observed_joyleaf_address": "711 E 1st Ave, Roselle, NJ 07203",
            "owned_urls": [
              "https://joyleaf.com/",
              "https://joyleaf.com/contact-us"
            ],
            "summary": "Joyleaf appeared in the Roselle list with its website and address."
          },
          {
            "prompt_id": "nearby_roselle_park",
            "status": "completed",
            "brand_mentioned": true,
            "website_linked": true,
            "owned_urls": [
              "https://joyleaf.com/"
            ],
            "summary": "Joyleaf appeared under nearby Roselle businesses serving Roselle Park, with a website link."
          },
          {
            "prompt_id": "independent_union_county",
            "status": "completed",
            "brand_mentioned": true,
            "website_linked": false,
            "owned_urls": [],
            "summary": "Joy Leaf — Roselle appeared only under potentially independent businesses, outside the confirmed independent shortlist. The answer could not sufficiently verify independent ownership and official website details.",
            "mention_qualification": "potentially_independent_not_verified"
          },
          {
            "prompt_id": "branded_details",
            "status": "completed",
            "brand_mentioned": true,
            "website_linked": true,
            "website_correct": true,
            "address_correct": true,
            "observed_joyleaf_address": "711 E 1st Ave, Roselle, NJ 07203",
            "owned_urls": [
              "https://joyleaf.com/",
              "https://joyleaf.com/contact-us"
            ],
            "summary": "Returned the correct official website and Roselle street address."
          }
        ]
      },
      {
        "id": "gemini",
        "name": "Gemini",
        "status": "measured",
        "surface": "Signed-in Gemini web app, temporary chats",
        "model": "Flash; version not shown",
        "discovery_completed": 3,
        "discovery_planned": 3,
        "brand_mentions": 3,
        "website_links": 3,
        "checks": [
          {
            "prompt_id": "local_roselle",
            "status": "completed",
            "brand_mentioned": true,
            "website_linked": true,
            "observed_joyleaf_address": "711 E 1st Ave, Roselle, NJ 07203",
            "owned_urls": [
              "https://joyleaf.com/"
            ],
            "summary": "Joyleaf appeared in the Roselle list with its website, address and joyleaf.com source citations."
          },
          {
            "prompt_id": "nearby_roselle_park",
            "status": "completed",
            "brand_mentioned": true,
            "website_linked": true,
            "owned_urls": [
              "https://joyleaf.com/"
            ],
            "summary": "Joyleaf appeared under nearby dispensaries serving Roselle Park with its website and joyleaf.com citations."
          },
          {
            "prompt_id": "independent_union_county",
            "status": "completed",
            "brand_mentioned": true,
            "website_linked": true,
            "owned_urls": [
              "https://joyleaf.com/"
            ],
            "summary": "Joyleaf appeared in the independent/local operator table with its website. The baseline does not independently verify the answer's ownership classification."
          },
          {
            "prompt_id": "branded_details",
            "status": "completed",
            "brand_mentioned": true,
            "website_linked": true,
            "website_correct": true,
            "address_correct": true,
            "observed_joyleaf_address": "711 E 1st Ave, Roselle, NJ 07203",
            "owned_urls": [
              "https://joyleaf.com/"
            ],
            "summary": "Returned the correct official website and Roselle street address."
          }
        ]
      },
      {
        "id": "claude",
        "name": "Claude",
        "status": "measured",
        "surface": "Signed-in Claude web app, fresh incognito chats",
        "model": "Sonnet 5.5 Medium",
        "checked_date": "2026-11-11",
        "discovery_planned": 3,
        "discovery_completed": 3,
        "checks": [
          {
            "prompt_id": "local_roselle",
            "status": "completed",
            "brand_mentioned": true,
            "website_linked": true,
            "owned_urls": [
              "https://joyleaf.com/"
            ],
            "observed_joyleaf_address": "711 E 1st Ave, Roselle, NJ 07203",
            "summary": "Named Joyleaf and linked joyleaf.com. Explicitly said its website identification was secondhand and that it had not opened Joyleaf's own site. Do not treat its full list as independently verified.",
            "evidence_basis": "secondhand_sources"
          },
          {
            "prompt_id": "nearby_roselle_park",
            "status": "completed",
            "brand_mentioned": true,
            "website_linked": false,
            "owned_urls": [],
            "summary": "Mentioned neighboring Roselle has Joyleaf, but said it had not found its official website and could not confirm delivery to Roselle Park. This is a qualified mention, not a confirmed service recommendation.",
            "mention_qualification": "neighboring_business_service_unconfirmed"
          },
          {
            "prompt_id": "independent_union_county",
            "status": "completed",
            "brand_mentioned": true,
            "website_linked": false,
            "owned_urls": [],
            "summary": "Listed Joy Leaf (Roselle) under licensed businesses whose ownership and official websites it could not verify, outside the confirmed independent shortlist. This is a qualified mention.",
            "mention_qualification": "potentially_independent_not_verified"
          },
          {
            "prompt_id": "branded_details",
            "status": "completed",
            "brand_mentioned": true,
            "website_linked": true,
            "website_correct": true,
            "address_correct": true,
            "observed_joyleaf_address": "711 East 1st Avenue, Roselle, NJ 07203",
            "owned_urls": [
              "https://joyleaf.com/"
            ],
            "summary": "Returned the correct official website and equivalent Roselle street address. Explicitly said it used news coverage/company directories and did not open Joyleaf's site.",
            "evidence_basis": "secondhand_sources"
          }
        ],
        "brand_mentions": 3,
        "website_links": 1,
        "collected_at": "2026-11-11T17:39:14.466Z",
        "branded_accuracy": {
          "website_correct": true,
          "address_correct": true,
          "note": "Matches the official-site truth source; Claude itself relied on secondhand sources."
        }
      }
    ],
    "branded_truth_source": {
      "official_website": "https://joyleaf.com/",
      "street_address": "711 E 1st Ave, Roselle, NJ 07203",
      "verification_url": "https://joyleaf.com/contact-us",
      "checked_date": "2026-11-11"
    },
    "ai_referral_traffic": {
      "status": "not_connected",
      "sessions": null,
      "note": "Website visits are separate from answer presence. Joyleaf GA4 property access has not been verified."
    },
    "updated_at": "2026-11-11T17:39:14.466Z",
    "original_collected_at": "2026-11-11T17:11:30.200Z"
  },
  "rankings": [
    {
      "market": "Roselle",
      "drive": "Home",
      "pop": "22K",
      "dispensary": 1,
      "near_me": 2,
      "weed": 1,
      "cannabis": 1,
      "open_now": 1
    },
    {
      "market": "Roselle Park",
      "drive": "5 min",
      "pop": "14K",
      "dispensary": 2,
      "near_me": 3,
      "weed": 2,
      "cannabis": 3,
      "open_now": 2
    },
    {
      "market": "Garwood",
      "drive": "10 min",
      "pop": "4.2K",
      "dispensary": 3,
      "near_me": 4,
      "weed": 3,
      "cannabis": 4,
      "open_now": 3
    },
    {
      "market": "Cranford",
      "drive": "7 min",
      "pop": "24K",
      "dispensary": 4,
      "near_me": 5,
      "weed": 4,
      "cannabis": 5,
      "open_now": 4
    },
    {
      "market": "Union",
      "drive": "8 min",
      "pop": "58K",
      "dispensary": 5,
      "near_me": 6,
      "weed": 5,
      "cannabis": 6,
      "open_now": 5
    },
    {
      "market": "Elizabeth",
      "drive": "10 min",
      "pop": "137K",
      "dispensary": 6,
      "near_me": 7,
      "weed": 6,
      "cannabis": 7,
      "open_now": 6
    },
    {
      "market": "Linden",
      "drive": "12 min",
      "pop": "43K",
      "dispensary": 7,
      "near_me": 8,
      "weed": 7,
      "cannabis": 8,
      "open_now": 7
    },
    {
      "market": "Clark",
      "drive": "12 min",
      "pop": "16K",
      "dispensary": 8,
      "near_me": 9,
      "weed": 8,
      "cannabis": 9,
      "open_now": 8
    },
    {
      "market": "Westfield",
      "drive": "15 min",
      "pop": "31K",
      "dispensary": 9,
      "near_me": 10,
      "weed": 9,
      "cannabis": 10,
      "open_now": 9
    },
    {
      "market": "Newark/EWR",
      "drive": "20 min",
      "pop": "Traveler",
      "dispensary": 0,
      "near_me": 0,
      "weed": 0,
      "cannabis": 0,
      "open_now": 0
    }
  ],
  "automation": {
    "version": 2,
    "cadence": "daily",
    "stale_after_hours": 36,
    "last_attempt": "2026-11-11T17:42:23.748Z",
    "last_success": "2026-11-11T17:42:23.748Z",
    "trigger": "deployment",
    "metrics_updated": 9,
    "updated_sources": [
      "google",
      "youtube",
      "reviews"
    ],
    "stale_sources": [
      "leafly",
      "weedmaps",
      "yelp"
    ],
    "source_status": {
      "google": {
        "status": "partial",
        "last_attempt": "2026-11-11T17:42:23.748Z",
        "metric_status": {
          "searches": {
            "status": "fresh",
            "last_success": "2026-11-11T17:42:23.748Z",
            "period": {
              "start_date": "2026-10-12",
              "end_date": "2026-11-08",
              "label": "Oct 12 – Nov 8, 2026",
              "month": "November 2026"
            }
          },
          "direction_requests": {
            "status": "fresh",
            "last_success": "2026-11-11T17:42:23.748Z",
            "period": {
              "start_date": "2026-10-12",
              "end_date": "2026-11-08",
              "label": "Oct 12 – Nov 8, 2026",
              "month": "November 2026"
            }
          },
          "phone_calls": {
            "status": "fresh",
            "last_success": "2026-11-11T17:42:23.748Z",
            "period": {
              "start_date": "2026-10-12",
              "end_date": "2026-11-08",
              "label": "Oct 12 – Nov 8, 2026",
              "month": "November 2026"
            }
          },
          "website_clicks": {
            "status": "fresh",
            "last_success": "2026-11-11T17:42:23.748Z",
            "period": {
              "start_date": "2026-10-12",
              "end_date": "2026-11-08",
              "label": "Oct 12 – Nov 8, 2026",
              "month": "November 2026"
            }
          },
          "photo_views": {
            "status": "stale"
          },
          "searches_change": {
            "status": "stale"
          },
          "direction_change": {
            "status": "stale"
          },
          "phone_change": {
            "status": "stale"
          },
          "website_change": {
            "status": "stale"
          },
          "photo_change": {
            "status": "stale"
          }
        },
        "snapshots": [
          {
            "collected_at": "2026-11-09T18:40:56.471Z",
            "period": {
              "start_date": "2026-10-10",
              "end_date": "2026-11-06",
              "label": "Oct 10 – Nov 6, 2026",
              "month": "November 2026"
            },
            "metrics": {
              "searches": 19228,
              "direction_requests": 1442,
              "phone_calls": 234,
              "website_clicks": 4878
            }
          },
          {
            "collected_at": "2026-11-10T20:28:04.664Z",
            "period": {
              "start_date": "2026-10-11",
              "end_date": "2026-11-07",
              "label": "Oct 11 – Nov 7, 2026",
              "month": "November 2026"
            },
            "metrics": {
              "searches": 19563,
              "direction_requests": 1437,
              "phone_calls": 225,
              "website_clicks": 5302
            }
          },
          {
            "collected_at": "2026-11-11T17:42:23.748Z",
            "period": {
              "start_date": "2026-10-12",
              "end_date": "2026-11-08",
              "label": "Oct 12 – Nov 8, 2026",
              "month": "November 2026"
            },
            "metrics": {
              "searches": 19126,
              "direction_requests": 1448,
              "phone_calls": 218,
              "website_clicks": 5123
            }
          }
        ],
        "last_success": "2026-11-11T17:42:23.748Z",
        "period": {
          "start_date": "2026-10-12",
          "end_date": "2026-11-08",
          "label": "Oct 12 – Nov 8, 2026",
          "month": "November 2026"
        },
        "source_label": "Joyleaf Weed Dispensary",
        "updated_metrics": [
          "searches",
          "direction_requests",
          "phone_calls",
          "website_clicks"
        ],
        "authorization_blocked": false,
        "reason": "Refreshed 4 of 5 metrics. Photo views are not provided by Google Performance API; missing measures remain historical."
      },
      "instagram": {
        "status": "partial",
        "last_attempt": "2026-11-11T16:03:17.261Z",
        "updated_metrics": [
          "views",
          "interactions",
          "new_follows"
        ],
        "metric_status": {
          "views": {
            "status": "fresh",
            "last_success": "2026-11-11T16:03:17.261Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            },
            "provider_field": "views"
          },
          "reach": {
            "status": "stale"
          },
          "interactions": {
            "status": "fresh",
            "last_success": "2026-11-11T16:03:17.261Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            },
            "provider_field": "total_interactions"
          },
          "new_follows": {
            "status": "fresh",
            "last_success": "2026-11-11T16:03:17.261Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            },
            "provider_field": "follower_count_1d"
          },
          "non_follower_reach": {
            "status": "stale"
          },
          "views_change": {
            "status": "stale"
          },
          "reach_change": {
            "status": "stale"
          },
          "interactions_change": {
            "status": "stale"
          },
          "follows_change": {
            "status": "stale"
          },
          "non_follower_change": {
            "status": "stale"
          }
        },
        "authorization_blocked": false,
        "snapshots": [
          {
            "collected_at": "2026-11-11T16:03:17.261Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            },
            "metric_periods": {},
            "metric_fields": {
              "views": "views",
              "interactions": "total_interactions",
              "new_follows": "follower_count_1d"
            },
            "metrics": {
              "views": 27475,
              "interactions": 772,
              "new_follows": 75
            }
          }
        ],
        "last_success": "2026-11-11T16:03:17.261Z",
        "period": {
          "start_date": "2026-10-14",
          "end_date": "2026-11-10",
          "label": "Oct 14 – Nov 10, 2026",
          "month": "November 2026"
        },
        "source_label": "Windsor.ai · Joyleaf Instagram",
        "managed_by": "windsor-connected-app",
        "reason": "Unique 28-day reach and non-follower reach are unavailable; daily unique reach is never summed."
      },
      "facebook": {
        "status": "fresh",
        "last_attempt": "2026-11-11T16:03:17.261Z",
        "updated_metrics": [
          "views",
          "interactions",
          "page_visits",
          "new_follows"
        ],
        "metric_status": {
          "views": {
            "status": "fresh",
            "last_success": "2026-11-11T16:03:17.261Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            },
            "provider_field": "page_impressions"
          },
          "interactions": {
            "status": "fresh",
            "last_success": "2026-11-11T16:03:17.261Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            },
            "provider_field": "page_post_engagements"
          },
          "page_visits": {
            "status": "fresh",
            "last_success": "2026-11-11T16:03:17.261Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            },
            "provider_field": "page_views_total"
          },
          "new_follows": {
            "status": "fresh",
            "last_success": "2026-11-11T16:03:17.261Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            },
            "provider_field": "page_daily_follows"
          },
          "views_change": {
            "status": "stale"
          },
          "interactions_change": {
            "status": "stale"
          },
          "page_visits_change": {
            "status": "stale"
          },
          "follows_change": {
            "status": "stale"
          }
        },
        "authorization_blocked": false,
        "snapshots": [
          {
            "collected_at": "2026-11-11T16:03:17.261Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            },
            "metric_periods": {},
            "metric_fields": {
              "views": "page_impressions",
              "interactions": "page_post_engagements",
              "page_visits": "page_views_total",
              "new_follows": "page_daily_follows"
            },
            "metrics": {
              "views": 5122,
              "interactions": 121,
              "page_visits": 486,
              "new_follows": 3
            }
          }
        ],
        "last_success": "2026-11-11T16:03:17.261Z",
        "period": {
          "start_date": "2026-10-14",
          "end_date": "2026-11-10",
          "label": "Oct 14 – Nov 10, 2026",
          "month": "November 2026"
        },
        "source_label": "Windsor.ai · Joy Leaf Facebook",
        "managed_by": "windsor-connected-app"
      },
      "youtube": {
        "status": "fresh",
        "last_attempt": "2026-11-11T17:42:23.748Z",
        "last_success": "2026-11-11T17:42:23.748Z",
        "snapshots": [
          {
            "collected_at": "2026-11-09T18:40:56.471Z",
            "period": {
              "start_date": "2026-10-12",
              "end_date": "2026-11-08",
              "label": "Oct 12 – Nov 8, 2026",
              "month": "November 2026"
            },
            "metrics": {
              "views": 6407,
              "subscribers": 44,
              "new_subs": 3
            }
          },
          {
            "collected_at": "2026-11-10T20:28:04.664Z",
            "period": {
              "start_date": "2026-10-13",
              "end_date": "2026-11-09",
              "label": "Oct 13 – Nov 9, 2026",
              "month": "November 2026"
            },
            "metrics": {
              "views": 6417,
              "subscribers": 44,
              "new_subs": 3
            }
          },
          {
            "collected_at": "2026-11-11T17:42:23.748Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            },
            "metric_periods": {
              "subscribers": {
                "label": "Current snapshot 2026-11-11"
              }
            },
            "metrics": {
              "views": 6114,
              "subscribers": 44,
              "new_subs": 3
            }
          }
        ],
        "period": {
          "start_date": "2026-10-14",
          "end_date": "2026-11-10",
          "label": "Oct 14 – Nov 10, 2026",
          "month": "November 2026"
        },
        "source_label": "Joyleaf YouTube channel",
        "updated_metrics": [
          "views",
          "subscribers",
          "new_subs"
        ],
        "metric_status": {
          "views": {
            "status": "fresh",
            "last_success": "2026-11-11T17:42:23.748Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            }
          },
          "subscribers": {
            "status": "fresh",
            "last_success": "2026-11-11T17:42:23.748Z",
            "period": {
              "label": "Current snapshot 2026-11-11"
            }
          },
          "new_subs": {
            "status": "fresh",
            "last_success": "2026-11-11T17:42:23.748Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            }
          }
        },
        "authorization_blocked": false
      },
      "linkedin": {
        "status": "fresh",
        "last_attempt": "2026-11-11T16:03:17.261Z",
        "updated_metrics": [
          "impressions",
          "reactions",
          "followers"
        ],
        "metric_status": {
          "impressions": {
            "status": "fresh",
            "last_success": "2026-11-11T16:03:17.261Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            },
            "provider_field": "account_analytics_impression_count"
          },
          "reactions": {
            "status": "fresh",
            "last_success": "2026-11-11T16:03:17.261Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            },
            "provider_field": "account_analytics_like_count"
          },
          "followers": {
            "status": "fresh",
            "last_success": "2026-11-11T16:03:17.261Z",
            "period": {
              "label": "Current snapshot 2026-11-11"
            },
            "provider_field": "organization_follower_count"
          }
        },
        "authorization_blocked": false,
        "snapshots": [
          {
            "collected_at": "2026-11-11T16:03:17.261Z",
            "period": {
              "start_date": "2026-10-14",
              "end_date": "2026-11-10",
              "label": "Oct 14 – Nov 10, 2026",
              "month": "November 2026"
            },
            "metric_periods": {
              "followers": {
                "label": "Current snapshot 2026-11-11"
              }
            },
            "metric_fields": {
              "impressions": "account_analytics_impression_count",
              "reactions": "account_analytics_like_count",
              "followers": "organization_follower_count"
            },
            "metrics": {
              "impressions": 948,
              "reactions": 34,
              "followers": 705
            }
          }
        ],
        "last_success": "2026-11-11T16:03:17.261Z",
        "period": {
          "start_date": "2026-10-14",
          "end_date": "2026-11-10",
          "label": "Oct 14 – Nov 10, 2026",
          "month": "November 2026"
        },
        "source_label": "Windsor.ai · JoyLeaf LinkedIn",
        "managed_by": "windsor-connected-app"
      },
      "leafly": {
        "status": "stale",
        "last_attempt": "2026-11-11T17:42:23.748Z",
        "metric_status": {
          "sessions": {
            "status": "stale"
          },
          "reviews": {
            "status": "stale"
          },
          "orders": {
            "status": "stale",
            "period": {
              "start_date": "2026-07-01",
              "end_date": "2026-08-01",
              "label": "Jul 1 – Aug 1, 2026"
            }
          },
          "deal_orders": {
            "status": "stale",
            "period": {
              "start_date": "2026-07-01",
              "end_date": "2026-08-01",
              "label": "Jul 1 – Aug 1, 2026"
            }
          },
          "gmv": {
            "status": "stale",
            "period": {
              "start_date": "2026-07-01",
              "end_date": "2026-08-01",
              "label": "Jul 1 – Aug 1, 2026"
            }
          },
          "sessions_change": {
            "status": "stale"
          },
          "orders_change": {
            "status": "stale"
          },
          "deal_orders_change": {
            "status": "stale"
          },
          "gmv_change": {
            "status": "stale"
          }
        },
        "updated_metrics": [],
        "authorization_blocked": false,
        "reason": "No source endpoint configuration was supplied."
      },
      "weedmaps": {
        "status": "stale",
        "last_attempt": "2026-11-11T17:42:23.748Z",
        "metric_status": {
          "dispensary_clicks": {
            "status": "stale"
          },
          "delivery_clicks": {
            "status": "stale"
          },
          "listing_visitors": {
            "status": "stale"
          },
          "contact_clicks": {
            "status": "stale"
          },
          "monthly_spend": {
            "status": "stale",
            "collection_method": "manual-export",
            "imported_at": "2026-11-11T16:32:57.284Z",
            "period": {
              "start_date": "2026-10-01",
              "end_date": "2026-10-31"
            },
            "provider_field": "Total spend"
          },
          "dispensary_spend": {
            "status": "stale"
          },
          "delivery_spend": {
            "status": "stale"
          },
          "gmv": {
            "status": "stale",
            "collection_method": "manual-export",
            "imported_at": "2026-11-11T16:32:57.284Z",
            "period": {
              "start_date": "2026-10-01",
              "end_date": "2026-10-31"
            },
            "provider_field": "Order GMV"
          },
          "unique_shoppers": {
            "status": "stale",
            "collection_method": "manual-export",
            "imported_at": "2026-11-11T16:32:57.284Z",
            "period": {
              "start_date": "2026-10-01",
              "end_date": "2026-10-31"
            },
            "provider_field": "Unique shoppers"
          },
          "orders": {
            "status": "stale",
            "collection_method": "manual-export",
            "imported_at": "2026-11-11T16:32:57.284Z",
            "period": {
              "start_date": "2026-10-01",
              "end_date": "2026-10-31"
            },
            "provider_field": "Orders"
          }
        },
        "updated_metrics": [],
        "authorization_blocked": false,
        "source_label": "Weedmaps · Joyleaf Weed Dispensary · imported CSV",
        "period": {
          "start_date": "2026-10-01",
          "end_date": "2026-10-31"
        },
        "manual_import": {
          "imported_at": "2026-11-11T16:32:57.284Z",
          "period": {
            "start_date": "2026-10-01",
            "end_date": "2026-10-31"
          },
          "listing": "Joyleaf Weed Dispensary",
          "period_basis": "Report filename",
          "metrics": {
            "unique_shoppers": 315,
            "orders": 1,
            "gmv": 30.41,
            "monthly_spend": 595
          }
        },
        "reason": "No source endpoint configuration was supplied."
      },
      "yelp": {
        "status": "stale",
        "last_attempt": "2026-11-11T17:42:23.748Z",
        "updated_metrics": [],
        "metric_status": {
          "impressions": {
            "status": "stale"
          },
          "page_visits": {
            "status": "stale"
          },
          "leads": {
            "status": "stale"
          },
          "website_visits": {
            "status": "stale"
          },
          "direction_views": {
            "status": "stale"
          },
          "calls": {
            "status": "stale"
          }
        },
        "authorization_blocked": false,
        "reason": "No source endpoint configuration was supplied."
      },
      "reviews": {
        "status": "partial",
        "last_attempt": "2026-11-11T17:42:23.748Z",
        "updated_metrics": [
          "rating",
          "joyleaf_count"
        ],
        "metric_status": {
          "rating": {
            "status": "fresh",
            "last_success": "2026-11-11T17:42:23.748Z",
            "period": {
              "label": "Snapshot 2026-11-11"
            }
          },
          "joyleaf_count": {
            "status": "fresh",
            "last_success": "2026-11-11T17:42:23.748Z",
            "period": {
              "label": "Snapshot 2026-11-11"
            }
          }
        },
        "authorization_blocked": false,
        "snapshots": [
          {
            "collected_at": "2026-11-11T16:23:08.309Z",
            "period": {
              "label": "Snapshot 2026-11-11"
            },
            "metrics": {
              "rating": 4.900000095367432,
              "joyleaf_count": 3220
            }
          },
          {
            "collected_at": "2026-11-11T16:25:31.962Z",
            "period": {
              "label": "Snapshot 2026-11-11"
            },
            "metrics": {
              "rating": 4.900000095367432,
              "joyleaf_count": 3220
            }
          },
          {
            "collected_at": "2026-11-11T16:52:40.553Z",
            "period": {
              "label": "Snapshot 2026-11-11"
            },
            "metrics": {
              "rating": 4.900000095367432,
              "joyleaf_count": 3220
            }
          },
          {
            "collected_at": "2026-11-11T17:04:28.029Z",
            "period": {
              "label": "Snapshot 2026-11-11"
            },
            "metrics": {
              "rating": 4.900000095367432,
              "joyleaf_count": 3220
            }
          },
          {
            "collected_at": "2026-11-11T17:16:22.410Z",
            "period": {
              "label": "Snapshot 2026-11-11"
            },
            "metrics": {
              "rating": 4.900000095367432,
              "joyleaf_count": 3220
            }
          },
          {
            "collected_at": "2026-11-11T17:42:23.748Z",
            "period": {
              "label": "Snapshot 2026-11-11"
            },
            "metrics": {
              "rating": 4.900000095367432,
              "joyleaf_count": 3220
            }
          }
        ],
        "last_success": "2026-11-11T17:42:23.748Z",
        "period": {
          "label": "Snapshot 2026-11-11"
        },
        "source_label": "Google Business Profile · Joyleaf Weed Dispensary",
        "reason": "Joyleaf Google rating/count only. Competitor counts and star distribution remain historical, not refreshed."
      }
    },
    "generated_insight": {
      "title": "Google Search and YouTube Engagement Snapshot",
      "body": "In the latest period, Joyleaf recorded 19,228 searches and 4,878 website clicks from Google, alongside 6,407 views and 44 subscribers on YouTube. However, data from Instagram, Facebook, LinkedIn, Leafly, Weedmaps, Yelp, and reviews are unavailable or failed.",
      "tone": "gold",
      "source_keys": [
        "google",
        "youtube"
      ],
      "status": "stale",
      "generated_at": "2026-11-09T18:38:00.933Z"
    }
  },
  "top_content": {
    "status": "fresh",
    "source": "Windsor.ai · Joyleaf Instagram",
    "collected_at": "2026-11-11T16:38:41.000Z",
    "publication_period": {
      "start_date": "2026-10-14",
      "end_date": "2026-11-10",
      "label": "Oct 14 – Nov 10, 2026",
      "month": "November 2026"
    },
    "groups": [
      {
        "platform": "Instagram",
        "label": "Top Instagram content",
        "scope": "Published 2026-10-14 to 2026-11-10 · Ranked by lifetime views",
        "coverage": "Top 5 of 20 owned posts returned. Older posts have had longer to accumulate views.",
        "ranking_metric": "media_views",
        "corpus_size": 20,
        "items": [
          {
            "id": "18359006449247404",
            "title": "Shots fired by the Joyleaf team!",
            "caption": "Shots fired by the Joyleaf team! Abraham is a new hire and apparently not getting along with anybody 💀 #retailhumor #workhumor #retaillife #joyleaf",
            "url": "https://www.instagram.com/reel/DeuEziKKFyY/",
            "published_at": "2026-10-20T14:44:04.000Z",
            "format": "Reel",
            "badges": [
              "Top reel"
            ],
            "metrics": [
              {
                "label": "Lifetime views",
                "value": 3970
              },
              {
                "label": "Engagements",
                "value": 102
              },
              {
                "label": "Shares",
                "value": 12
              }
            ],
            "provider_fetched_at": "2026-11-11T16:38:41.000Z"
          },
          {
            "id": "18091887572229964",
            "title": "Came to Joyleaf to work.",
            "caption": "Came to Joyleaf to work. Ended up playing mini golf all day. ⛳️😂 Games are back tonight! Come hang with us, bring a friend, and challenge the team. Clearly, we’ve been practicing. #Joyleaf #FridayGameNight #RoselleNJ #Go",
            "url": "https://www.instagram.com/reel/De10qwCq6xi/",
            "published_at": "2026-10-23T14:57:08.000Z",
            "format": "Reel",
            "badges": [],
            "metrics": [
              {
                "label": "Lifetime views",
                "value": 2514
              },
              {
                "label": "Engagements",
                "value": 55
              },
              {
                "label": "Shares",
                "value": 0
              }
            ],
            "provider_fetched_at": "2026-11-11T16:38:41.000Z"
          },
          {
            "id": "18376120981246472",
            "title": "October’s Joyleaf camera roll is mostly dogs.",
            "caption": "October’s Joyleaf camera roll is mostly dogs. We stand by our editorial decisions. 🐾 Meet a few of the pups who stopped by last month. We’d recognize those faces anywhere. Their humans might have to remind us of their na",
            "url": "https://www.instagram.com/p/DfZ_0u1FX41/",
            "published_at": "2026-11-06T16:06:38.000Z",
            "format": "Carousel",
            "badges": [],
            "metrics": [
              {
                "label": "Lifetime views",
                "value": 1410
              },
              {
                "label": "Engagements",
                "value": 36
              },
              {
                "label": "Shares",
                "value": 4
              }
            ],
            "provider_fetched_at": "2026-11-11T16:38:41.000Z"
          },
          {
            "id": "18013935824766930",
            "title": "The group chat finally has a Friday plan.",
            "caption": "The group chat finally has a Friday plan. 💜🚚 Food Truck Fridays are back at Joyleaf! Good food, familiar faces, and a reason to turn “we should hang out” into an actual evening. Catch the lineup above, Fridays from 5–8 P",
            "url": "https://www.instagram.com/p/DfUyz9fqvWV/",
            "published_at": "2026-11-04T15:37:05.000Z",
            "format": "Image",
            "badges": [
              "Most shared"
            ],
            "metrics": [
              {
                "label": "Lifetime views",
                "value": 1281
              },
              {
                "label": "Engagements",
                "value": 77
              },
              {
                "label": "Shares",
                "value": 26
              }
            ],
            "provider_fetched_at": "2026-11-11T16:38:41.000Z"
          },
          {
            "id": "18082192490373965",
            "title": "Your ex was scary enough.",
            "caption": "Your ex was scary enough. Please wear an actual costume. 💀💜 Joy’s expecting a little chaos this Halloween weekend. 👻 🎃 Friday & Saturday | 5–8 PM 🎧 DJ bringing the energy 🎲 Games, laughs & questionable dance moves 🥘 Food",
            "url": "https://www.instagram.com/p/DfH0zIlKCO0/",
            "published_at": "2026-10-30T14:44:53.000Z",
            "format": "Image",
            "badges": [],
            "metrics": [
              {
                "label": "Lifetime views",
                "value": 1230
              },
              {
                "label": "Engagements",
                "value": 37
              },
              {
                "label": "Shares",
                "value": 7
              }
            ],
            "provider_fetched_at": "2026-11-11T16:38:41.000Z"
          }
        ]
      }
    ],
    "imported_at": "2026-11-11T16:48:12.956Z"
  },
  "review_benchmark": {
    "collected_at": "2026-11-11T16:44:40Z",
    "peers": [
      {
        "name": "Budzooka · Elizabeth",
        "rating": 5,
        "review_count": 6447,
        "url": "https://maps.google.com/?cid=10489408539509163036"
      },
      {
        "name": "Ayr · Union",
        "rating": 4.7,
        "review_count": 1440,
        "url": "https://maps.google.com/?cid=4572311775065296294"
      },
      {
        "name": "Botera · Union",
        "rating": 4.9,
        "review_count": 1213,
        "url": "https://maps.google.com/?cid=12045809006380092120"
      },
      {
        "name": "Breakwater · Roselle Park",
        "rating": 4.8,
        "review_count": 478,
        "url": "https://maps.google.com/?cid=13732885580366226478"
      }
    ]
  }
};
