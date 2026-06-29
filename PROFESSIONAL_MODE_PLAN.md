# Facebook Professional Mode - Friendix Implementation Plan

## Facebook Professional Mode কী?

Facebook-এর Professional Mode (Pro Mode) হলো একটা ফিচার যেটা ব্যবহারকারীকে তার পার্সোনাল প্রোফাইলকে প্রফেশনাল ক্রিয়েটর প্রোফাইলে রূপান্তরিত করতে দেয় — আলাদা পেজ তৈরি না করেই।

---

## Facebook-এ কী কী আছে (রিসার্চ ফলাফল)

### ১. নরমাল অ্যাকাউন্ট vs প্রফেশনাল মোড

| বৈশিষ্ট্য | নরমাল অ্যাকাউন্ট | প্রফেশনাল মোড |
|---|---|---|
| **বন্ধু সীমা** | সর্বোচ্চ ৫,০০০ | সর্বোচ্চ ৫,০০০ (বন্ধু) |
| **ফলোয়ার** | নেই | অসীমিত ফলোয়ার |
| **ফলো বাটন** | নেই | হ্যাঁ, যেকোনো ইউজার ফলো করতে পারবে |
| **পোস্ট রিচ** | শুধু বন্ধুদের কাছে | পাবলিক — সবাই দেখতে পারবে |
| **প্রফেশনাল ড্যাশবোর্ড** | নেই | হ্যাঁ, বিস্তারিত অ্যানালিটিক্স |
| **কনটেন্ট মনিটাইজেশন** | নেই | হ্যাঁ (যোগ্যতা থাকলে) |
| **পোস্ট বুস্টিং** | নেই | হ্যাঁ |
| **প্রোফাইল ক্যাটাগরি** | নেই | "Digital Creator" বা অন্য |
| **কনটেন্ট রিকমেন্ডেশন** | নেই | Facebook রিকমেন্ড করে |

### ২. ফলো সিস্টেম
- **নরমাল**: শুধু ফ্রেন্ড রিকোয়েস্ট (পার্শ্বাভিমুখী — দুজন পরস্পর বন্ধু)
- **প্রফেশনাল**: ফলো বাটন যোগ হয় (একমুখী — কেউ আপনাকে ফলো করতে পারে)
- **বন্ধু + ফলোয়ার**: বন্ধুরা স্বয়ংক্রিয়ভাবে ফলোয়ার, কিন্তু ফলোয়ার সবাই বন্ধু নয়
- **ফলোয়ার কাউন্ট**: মোট ফলোয়ার = বন্ধু + পাবলিক ফলোয়ার

### ৩. প্রফেশনাল ড্যাশবোর্ড
- **Performance Overview (৯০ দিন)**:
  - Reach (অনন্য দর্শক সংখ্যা)
  - Engagement (রিঅ্যাকশন + কমেন্ট + শেয়ার)
  - Net Followers (নতুন ফলোয়ার - আনফলো)
  - 3-সেকেন্ড ভিডিও ভিউ
- **Content-Level Insights**: প্রতিটা পোস্টের আলাদা পারফরম্যান্স
- **Audience Demographics**: বয়স, লিঙ্গ, অবস্থান
- **Growth Tracking**: সাপ্তাহিক অগ্রগতি
- **Top Content**: সবচেয়ে ভালো পারফর্ম করা কনটেন্ট
- **Video Analytics**: ভিউ রেট, রিটেনশন, ড্রপ-অফ

---

## Friendix-এ কীভাবে ইমপ্লিমেন্ট করবো

### Phase 1: Database Model Changes

#### User Model আপডেট:
```javascript
{
  // ... existing fields ...
  
  // Professional Mode
  isProfessional: { type: Boolean, default: false },
  profileCategory: { type: String, default: 'Personal' },
  // Categories: 'Personal', 'Digital Creator', 'Gaming Creator', 'Music Artist',
  //             'Public Figure', 'Educator', 'Business', 'Health & Fitness'
  
  // Followers System
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Profile Stats (cached for performance)
  stats: {
    totalReach: { type: Number, default: 0 },
    totalEngagement: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
  }
}
```

#### Post Model আপডেট:
```javascript
{
  // ... existing fields ...
  
  // Analytics
  analytics: {
    reach: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 },
    videoViews: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
  },
  
  // Privacy (enhanced)
  privacy: { 
    type: String, 
    enum: ['public', 'friends', 'followers', 'only_me'], 
    default: 'public' 
  },
}
```

#### PostAnalytics Model (নতুন):
```javascript
{
  postId: ObjectId,
  userId: ObjectId,       // কে দেখেছে
  type: String,           // 'view', 'reaction', 'comment', 'share'
  createdAt: Date
}
```

### Phase 2: Backend API Routes

#### Professional Mode Routes:
```
POST   /api/users/professional/toggle    → প্রফেশনাল মোড অন/অফ
PUT    /api/users/professional/category   → প্রোফাইল ক্যাটাগরি পরিবর্তন
GET    /api/users/professional/dashboard  → ড্যাশবোর্ড ডাটা
```

#### Follow System Routes:
```
POST   /api/users/:id/follow             → ফলো করুন
DELETE /api/users/:id/unfollow           → আনফলো করুন
GET    /api/users/:id/followers          → ফলোয়ার তালিকা
GET    /api/users/:id/following          → যাদের ফলো করছেন
```

#### Analytics Routes:
```
POST   /api/analytics/view               → পোস্ট ভিউ ট্র্যাক
GET    /api/analytics/post/:postId       → পোস্ট অ্যানালিটিক্স
GET    /api/analytics/my-posts           → আমার সব পোস্টের অ্যানালিটিক্স
```

### Phase 3: Frontend Components

#### 1. Profile Page Updates
- **Follow বাটন যোগ**: প্রফেশনাল ইউজারদের প্রোফাইলে "Follow" বাটন দেখাবে
- **ফলোয়ার কাউন্ট দেখানো**: "1.2K followers · 500 following"
- **প্রোফাইল ক্যাটাগরি**: "Digital Creator" ব্যাজ দেখাবে
- **প্রফেশনাল ব্যাজ**: ব্লু চেকমার্কের মতো ব্যাজ

#### 2. Profile Page Layout (ফলোয়ারদের জন্য)
```
┌─────────────────────────────┐
│      [Cover Photo]          │
│  [Avatar]  Name             │
│            Category Badge   │
│  Bio here...                │
│  📍 Location | 🎓 Education  │
│                             │
│  [Message]  [Follow] [More] │  ← ফলোয়ারদের জন্য
│  1.2K followers · 500 following │
└─────────────────────────────┘
```

#### 3. Profile Page Layout (বন্ধুদের জন্য)
```
┌─────────────────────────────┐
│      [Cover Photo]          │
│  [Avatar]  Name             │
│            Category Badge   │
│  Bio here...                │
│                             │
│  [Message]  [Friends ✓] [More] │  ← বন্ধুদের জন্য
│  1.2K followers · 500 following │
└─────────────────────────────┘
```

#### 4. Professional Dashboard Page
```
┌─────────────────────────────────────┐
│  Professional Dashboard             │
│  ─────────────────────────          │
│                                     │
│  📊 Performance (Last 90 days)      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │Reach│ │Engag│ │ Net │ │Views│  │
│  │ 12K │ │ 3.4K│ │+230 │ │ 8.1K│  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│                                     │
│  📈 Growth Chart                    │
│  [Line graph showing 90-day trend]  │
│                                     │
│  📋 Top Content                     │
│  ┌─────────────────────────────┐   │
│  │ Post 1: 5.2K reach          │   │
│  │ Post 2: 3.8K reach          │   │
│  │ Post 3: 2.1K reach          │   │
│  └─────────────────────────────┘   │
│                                     │
│  👥 Audience                        │
│  - Age: 18-24 (35%), 25-34 (28%)   │
│  - Gender: Male 60%, Female 40%     │
│  - Top Cities: Dhaka, Chittagong    │
│                                     │
│  ⚙️ Tools                           │
│  - [Content Library]               │
│  - [Comments Manager]              │
│  - [Fan Engagement Tools]          │
│  - [Turn Off Professional Mode]    │
└─────────────────────────────────────┘
```

### Phase 4: UI/UX Changes

#### Navbar Updates
- Profile menu এ "Turn on Professional Mode" অপশন
- Dashboard link (প্রফেশনাল ইউজারদের জন্য)

#### Profile Button Logic
```
if (isViewingMyProfile) {
  → [Edit Profile] button
} else if (isProfessional && isFriend) {
  → [Message] [Friends ✓] [More]
} else if (isProfessional && !isFriend) {
  → [Message] [Follow] [More]
} else if (!isProfessional && isFriend) {
  → [Message] [Friends ✓] [More]  
} else {
  → [Add Friend] [Message]
}
```

---

## কাজের ধাপসমূহ (Implementation Steps)

### Step 1: Backend - User Model Update
- [ ] `isProfessional`, `profileCategory`, `followers[]`, `following[]`, `stats` fields যোগ
- [ ] Professional mode toggle endpoint
- [ ] Follow/unfollow endpoints (symmetrical updates)
- [ ] Follower/following list endpoints

### Step 2: Backend - Analytics System
- [ ] PostAnalytics model তৈরি
- [ ] Post view tracking endpoint
- [ ] Professional dashboard data endpoint
- [ ] Post-level analytics endpoint

### Step 3: Backend - Posts Update
- [ ] Analytics fields যোগ (reach, impressions, engagement)
- [ ] Privacy তে 'followers' option যোগ
- [ ] Feed algorithm update (professional posts get priority)

### Step 4: Frontend - Profile Page
- [ ] Follow/Unfollow button
- [ ] Follower/Following count display
- [ ] Professional badge/category display
- [ ] Profile button logic (friend vs follower vs stranger)

### Step 5: Frontend - Professional Dashboard
- [ ] Dashboard page তৈরি
- [ ] Performance metrics cards
- [ ] Growth chart (Chart.js বা Recharts)
- [ ] Content list with insights
- [ ] Audience demographics

### Step 6: Frontend - Settings
- [ ] Professional Mode toggle
- [ ] Category selector
- [ ] Dashboard link

### Step 7: Testing & Deploy
- [ ] Backend deploy
- [ ] Frontend deploy
- [ ] Full flow testing

---

## গুরুত্বপূর্ণ নোট

1. **বন্ধু সীমা**: প্রফেশনাল মোডেও বন্ধু ৫,০০০ থাকবে, কিন্তু ফলোয়ার অসীমিত
2. **ডাটা মাইগ্রেশন**: পুরোনো ইউজারদের বন্ধু তালিকাকে ফলোয়ার হিসেবে মাইগ্রেট করতে হবে না — বন্ধুরা স্বয়ংক্রিয়ভাবে ফলোয়ার
3. **Analytics Tracking**: প্রতিটা পোস্ট ভিউ, রিঅ্যাকশন, কমেন্ট ট্র্যাক করতে হবে
4. **Privacy**: প্রফেশনাল মোডে পোস্ট ডিফল্টে পাবলিক হবে
5. **Performance**: Dashboard data caching করতে হবে (Redis বা in-memory) যাতে বারবার DB query না লাগে
