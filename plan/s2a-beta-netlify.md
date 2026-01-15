# S2A Ledger Beta - Netlify Deployment Plan
## Target: cc122.netlify.app | Users: ≤10

---

## Executive Summary

Simplified beta deployment of S2A Ledger web app for internal testing with up to 10 users. Focus on core functionality validation before wider rollout.

---

## I. BETA SCOPE (≤10 Users)

### Target Users
- 5-10 internal testers (staff, family, trusted partners)
- Vietnamese household business owners (Group 2: 500M-3B VND revenue)
- Mix of technical and non-technical users for UX feedback

### Core Features (Beta)
| Feature | Status | Priority |
|---------|--------|----------|
| Quick Entry Form (5 fields) | Required | HIGH |
| Auto Code Generation (BL/AN/DV/LS) | Required | HIGH |
| Tax Rate Auto-Assignment (4.5%/7%) | Required | HIGH |
| Daily Dashboard | Required | HIGH |
| Three Report Views | Required | MEDIUM |
| CSV Export | Required | MEDIUM |
| localStorage Persistence | Required | HIGH |
| Vietnamese UI | Required | HIGH |
| Mobile Responsive | Required | HIGH |

### Excluded from Beta
- User authentication (single browser per user)
- Cloud sync (local storage only)
- Multi-ledger support
- Platform integrations (Shopee, Lazada)
- Edit functionality (delete only)
- Batch import

---

## II. NETLIFY DEPLOYMENT CONFIGURATION

### Target URL
```
Production: https://cc122.netlify.app
```

### Project Structure
```
D:\Antigravity\cham cong\
├── src/                    # React + TypeScript source
├── public/                 # Static assets
├── dist/                   # Build output (Vite)
├── netlify.toml           # Netlify configuration
├── package.json           # Dependencies
└── plan/
    └── s2a-beta-netlify.md # This plan
```

### netlify.toml Configuration
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"

# SPA routing - redirect all routes to index.html
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## III. DEPLOYMENT STEPS

### Prerequisites
- [ ] GitHub repository connected to Netlify
- [ ] Netlify account with cc122 site configured
- [ ] Node.js 20+ installed locally

### Step 1: Create Netlify Configuration
```bash
# Create netlify.toml in project root
# (See configuration above)
```

### Step 2: Build Verification
```bash
# Test build locally
npm run build

# Verify dist/ folder contains:
# - index.html
# - assets/ (JS, CSS bundles)
```

### Step 3: Connect to Netlify
```bash
# Option A: Netlify CLI
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod

# Option B: GitHub Integration
# 1. Go to app.netlify.com
# 2. Add new site > Import existing project
# 3. Connect GitHub repo
# 4. Set build command: npm run build
# 5. Set publish directory: dist
```

### Step 4: Verify Deployment
- [ ] Visit https://cc122.netlify.app
- [ ] Test on mobile device
- [ ] Verify localStorage persistence
- [ ] Test all form inputs
- [ ] Verify CSV export works

---

## IV. BETA TESTING CHECKLIST

### Functional Testing
| Test Case | Expected Result | Pass/Fail |
|-----------|-----------------|-----------|
| Add transaction (all industries) | Entry saved, code generated | |
| View daily totals | Correct sums displayed | |
| Switch report views | Data renders correctly | |
| Export CSV | File downloads with correct data | |
| Delete transaction | Entry removed, totals updated | |
| Page refresh | Data persists from localStorage | |
| Clear browser data | Data cleared (expected) | |

### Cross-Browser Testing
| Browser | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Chrome | | | |
| Firefox | | | |
| Safari | | | |
| Edge | | | |

### Mobile Responsiveness
| Device | Screen Size | Status |
|--------|-------------|--------|
| iPhone SE | 375px | |
| iPhone 14 | 390px | |
| Android | 360px | |
| Tablet | 768px | |
| Desktop | 1280px+ | |

---

## V. BETA USER FEEDBACK COLLECTION

### Feedback Channels
1. **Google Form** - Structured feedback after 1 week
2. **Zalo/Messenger Group** - Real-time bug reports
3. **Direct Interview** - 15-min call with 3 power users

### Key Questions
1. How long does each transaction entry take? (Target: <2 min)
2. Did you encounter any errors? Describe.
3. What feature is missing that you need most?
4. Would you recommend this to other business owners?
5. Rate overall experience (1-10)

### Success Metrics (Beta)
| Metric | Target | Measurement |
|--------|--------|-------------|
| Form completion rate | >80% | Manual tracking |
| Average entry time | <2 minutes | User feedback |
| Critical bugs | 0 | Bug reports |
| User satisfaction | >7/10 | Survey |
| Feature requests | 5+ documented | Feedback form |

---

## VI. BETA TIMELINE

### Week 1: Setup & Deploy
- [x] Review implementation plan
- [ ] Create netlify.toml
- [ ] Deploy to cc122.netlify.app
- [ ] Smoke test all features
- [ ] Prepare user guide (simple 1-pager)

### Week 2: Soft Launch
- [ ] Invite 5 beta testers
- [ ] Create feedback Zalo group
- [ ] Monitor for critical bugs
- [ ] Daily check-in with testers

### Week 3: Expand & Iterate
- [ ] Expand to 10 testers
- [ ] Fix reported bugs
- [ ] Collect structured feedback
- [ ] Prioritize feature requests

### Week 4: Evaluation
- [ ] Analyze all feedback
- [ ] Document lessons learned
- [ ] Decide go/no-go for Phase 2
- [ ] Update roadmap based on learnings

---

## VII. ENVIRONMENT VARIABLES

### Required for Beta (None)
Beta uses localStorage only - no environment variables needed.

### Future (Phase 2+)
```env
# When authentication is added:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# When analytics is added:
VITE_GA_ID=G-XXXXXXXXXX
```

---

## VIII. ROLLBACK PLAN

### If Critical Bug Found
1. Identify commit with issue
2. Revert in GitHub: `git revert <commit>`
3. Netlify auto-deploys from main branch
4. Or use Netlify dashboard > Deploys > Rollback

### If Major Outage
1. Check Netlify status: status.netlify.com
2. Notify users via Zalo group
3. Document incident for post-mortem

---

## IX. POST-BETA NEXT STEPS

### If Beta Successful (Week 4+)
1. Fix all critical/high bugs
2. Implement top 3 feature requests
3. Plan Phase 2: Scale to 100 users
4. Consider authentication needs

### Graduation Criteria
- [ ] Zero critical bugs for 7 consecutive days
- [ ] 80%+ user satisfaction score
- [ ] All 10 testers actively using app
- [ ] Clear feature priority list established

---

## X. CONTACTS & RESOURCES

### Technical
- **Repository**: GitHub (connected to Netlify)
- **Hosting**: cc122.netlify.app
- **Monitoring**: Netlify Analytics (free tier)

### Support
- **Bug Reports**: Zalo beta group
- **Feedback Form**: Google Forms (TBD)
- **Emergency**: Direct contact to dev team

---

**Document Version**: 1.0
**Created**: January 12, 2026
**Target Deploy**: January 13, 2026
**Beta End Date**: February 9, 2026 (4 weeks)
