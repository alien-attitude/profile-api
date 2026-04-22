# Profiles API 

A REST API that enriches names with demographic data, stores profiles in MongoDB, and supports advanced filtering, sorting, pagination, and natural language search.

---

## Stack

| Layer        | Choice                        |
|--------------|-------------------------------|
| Runtime      | Node.js (ESM)                 |
| Framework    | Express.js                    |
| Database     | MongoDB + Mongoose            |
| ID scheme    | UUID v7 (time-sortable)       |
| HTTP client  | Axios                         |

---

## Project Structure

```
profiles-api/
├── app.js
├── server.js
├── seed_profiles.json
├── vercel.json
├── scripts/
│   └── seed.js                     # DB seeding script
├── config/
│   └── env.js
├── database/
│   └── mongodb.js
├── controllers/
│   └── profile.controller.js
├── models/
│   └── profile.model.js
├── routes/
│   └── profile.route.js
└── services/
    ├── externalApis.service.js
    └── nlpParser.service.js        # Rule-based NLP parser
```

---

## Quick Start

```bash
npm install

# Local dev
cp .env.development.local.example .env.development.local
# Set MONGODB_URI in that file

npm run dev

# Seed the database (run once, or re-run safely — duplicates are skipped)
node scripts/seed.js
```

---

## API Reference

### POST `/api/profiles`
Creates a profile by enriching a name via Genderize, Agify, and Nationalize APIs.

### GET `/api/profiles`
Returns paginated, filtered, sorted profiles.

**Filters:** `gender`, `age_group`, `country_id`, `min_age`, `max_age`, `min_gender_probability`, `min_country_probability`

**Sorting:** `sort_by=age|created_at|gender_probability` + `order=asc|desc`

**Pagination:** `page` (default: 1), `limit` (default: 10, max: 50)

```
GET /api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc&page=1&limit=10
```

### GET `/api/profiles/search?q=...`
Natural language query endpoint. See NLP section below.

### GET `/api/profiles/:id`
Returns a single profile by UUID.

### DELETE `/api/profiles/:id`
Deletes a profile. Returns `204 No Content`.

---

## Natural Language Parsing Approach

The `/api/profiles/search` endpoint accepts plain English queries via the `q` parameter and converts them to structured database filters using **rule-based keyword matching only** — no AI, no LLMs.

### How it works

The parser (`services/nlpParser.service.js`) lowercases the query, splits it into tokens, and matches against predefined keyword sets and regex patterns in this order:

1. **Gender detection** — token set matching
2. **Age group detection** — token set matching
3. **"young" keyword** — maps to `min_age=16, max_age=24`
4. **Age range patterns** — regex matching
5. **Country detection** — substring match against a country name map (longest match first)

If nothing matches, the endpoint returns `{ "status": "error", "message": "Unable to interpret query" }`.

### Supported keywords and mappings

#### Gender
| Keywords | Maps to |
|----------|---------|
| male, males, man, men, boy, boys, guy, guys | `gender=male` |
| female, females, woman, women, girl, girls, lady, ladies | `gender=female` |
| "male and female" (both present) | no gender filter |

#### Age groups
| Keywords | Maps to |
|----------|---------|
| child, children, kid, kids, infant, infants | `age_group=child` |
| teenager, teenagers, teen, teens, adolescent, adolescents, youth | `age_group=teenager` |
| adult, adults | `age_group=adult` |
| senior, seniors, elderly, elder, elders, old | `age_group=senior` |

#### Special age keyword
| Keyword | Maps to |
|---------|---------|
| young | `min_age=16, max_age=24` |

#### Age range patterns (regex)
| Pattern | Maps to |
|---------|---------|
| `between X and Y` / `between X to Y` | `min_age=X, max_age=Y` |
| `above X` / `over X` / `older than X` / `at least X` | `min_age=X` |
| `below X` / `under X` / `younger than X` / `at most X` | `max_age=X` |
| `aged X` / `age X` / `exactly X` | `min_age=X, max_age=X` |

#### Countries
All 65 countries in the dataset are supported by full name, plus common aliases:

| Query term | Maps to |
|------------|---------|
| nigeria | NG |
| kenya | KE |
| south africa | ZA |
| ghana | GH |
| ethiopia | ET |
| egypt | EG |
| tanzania | TZ |
| uganda | UG |
| ivory coast / côte d'ivoire | CI |
| dr congo / democratic republic of congo / drc | CD |
| united states / usa / america | US |
| united kingdom / uk / britain / england | GB |
| ... (all 65 dataset countries + aliases) | |

### Example query mappings

| Query | Result filters |
|-------|----------------|
| `young males from nigeria` | `gender=male, min_age=16, max_age=24, country_id=NG` |
| `females above 30` | `gender=female, min_age=30` |
| `people from angola` | `country_id=AO` |
| `adult males from kenya` | `gender=male, age_group=adult, country_id=KE` |
| `male and female teenagers above 17` | `age_group=teenager, min_age=17` |
| `elderly women in ghana` | `gender=female, age_group=senior, country_id=GH` |
| `boys between 13 and 18` | `gender=male, min_age=13, max_age=18` |

---

## Limitations & Edge Cases Left Out

### Parser limitations

1. **No negation support** — queries like "not from nigeria" or "excluding males" are not handled. The parser ignores negative constructs entirely.

2. **No OR logic for countries** — "people from nigeria or ghana" will only match Nigeria (first country found). Multiple countries in one query are not supported.

3. **Ambiguous "young adult"** — if a query contains both "young" (→ ages 16–24) and "adult" (→ age_group=adult), the age_group takes priority and "young" age range is ignored.

4. **No partial name matching** — country names must appear exactly as known aliases. "Naija" (slang for Nigeria) won't match.

5. **No ordinal or relative terms** — "the oldest", "top 5", "most common" are not parsed.

6. **No compound conjunctions** — "males from nigeria and kenya" or "teenagers and adults" are not supported.

7. **Typo tolerance is zero** — "nigria" instead of "nigeria" will not match. No fuzzy matching.

8. **"young" is not an age_group** — it maps to `min_age=16, max_age=24` for filtering only. It is not stored in the database and cannot be used as an age_group filter value.

9. **Number words not supported** — "thirty year olds" won't parse. Only digits work: "above 30".

10. **No confidence filters via NLP** — queries like "highly confident female profiles" do not map to `min_gender_probability`. Only structured query params support probability filters.
