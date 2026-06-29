// Mock user data for development
export const mockUsers = [
  {
    id: '1',
    firstName: 'Amar',
    lastName: 'Biswas',
    fullName: 'Amar Biswas',
    email: 'amar@friendix.com',
    password: '123456',
    avatar: 'https://i.pravatar.cc/150?img=11',
    coverPhoto: 'https://picsum.photos/seed/cover1/900/300',
    bio: 'Living life to the fullest 🌟',
    location: 'Dhaka, Bangladesh',
    work: 'FRIENDIX Inc.',
    education: 'University of Dhaka',
    relationship: 'Single',
    joined: '2024-01-15',
    followers: 1240,
    following: 380,
    friends: ['2', '3', '4'],
    isAdmin: true,
  },
  {
    id: '2',
    firstName: 'Rahim',
    lastName: 'Uddin',
    fullName: 'Rahim Uddin',
    email: 'rahim@friendix.com',
    password: '123456',
    avatar: 'https://i.pravatar.cc/150?img=12',
    coverPhoto: 'https://picsum.photos/seed/cover2/900/300',
    bio: 'Software Engineer | Tech Enthusiast 💻',
    location: 'Chittagong, Bangladesh',
    work: 'Tech Corp',
    education: 'BUET',
    relationship: 'Married',
    joined: '2024-02-10',
    followers: 890,
    following: 210,
    friends: ['1', '3'],
    isAdmin: false,
  },
  {
    id: '3',
    firstName: 'Sadia',
    lastName: 'Islam',
    fullName: 'Sadia Islam',
    email: 'sadia@friendix.com',
    password: '123456',
    avatar: 'https://i.pravatar.cc/150?img=25',
    coverPhoto: 'https://picsum.photos/seed/cover3/900/300',
    bio: 'Photographer & Travel Lover 📸✈️',
    location: 'Sylhet, Bangladesh',
    work: 'Freelance',
    education: 'RUET',
    relationship: 'In a relationship',
    joined: '2024-03-05',
    followers: 2100,
    following: 560,
    friends: ['1', '2', '4'],
    isAdmin: false,
  },
  {
    id: '4',
    firstName: 'Karim',
    lastName: 'Ahmed',
    fullName: 'Karim Ahmed',
    email: 'karim@friendix.com',
    password: '123456',
    avatar: 'https://i.pravatar.cc/150?img=15',
    coverPhoto: 'https://picsum.photos/seed/cover4/900/300',
    bio: 'Entrepreneur | Food Lover 🍕',
    location: 'Rajshahi, Bangladesh',
    work: 'Ahmed Enterprises',
    education: 'RU',
    relationship: 'Married',
    joined: '2024-04-20',
    followers: 540,
    following: 180,
    friends: ['1', '3'],
    isAdmin: false,
  },
  {
    id: '5',
    firstName: 'Nasrin',
    lastName: 'Akter',
    fullName: 'Nasrin Akter',
    email: 'nasrin@friendix.com',
    password: '123456',
    avatar: 'https://i.pravatar.cc/150?img=29',
    coverPhoto: 'https://picsum.photos/seed/cover5/900/300',
    bio: 'Writer | Book Lover 📚',
    location: 'Khulna, Bangladesh',
    work: 'Daily Star',
    education: 'JU',
    relationship: 'Single',
    joined: '2024-05-12',
    followers: 780,
    following: 290,
    friends: [],
    isAdmin: false,
  },
];

export const mockPosts = [
  {
    id: 'p1',
    authorId: '2',
    content: 'Today was a wonderful day! Spent some great time with my closest friends. Welcome to FRIENDIX everyone! 😊',
    image: 'https://picsum.photos/seed/post1/600/400',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likes: ['1', '3', '4'],
    reactions: { like: 15, love: 8, haha: 3, wow: 2, sad: 0, angry: 0 },
    comments: [
      { id: 'c1', authorId: '1', content: 'Beautiful pictures! 😍', createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
      { id: 'c2', authorId: '3', content: 'Awesome buddy! 🔥', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    ],
    shares: 5,
    privacy: 'public',
    feeling: '😊 feeling happy',
  },
  {
    id: 'p2',
    authorId: '3',
    content: 'Sharing some beautiful moments from Sylhet Tea Gardens. The beauty of nature is absolutely unmatched 🍵🌿',
    image: 'https://picsum.photos/seed/post2/600/400',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likes: ['1', '2'],
    reactions: { like: 42, love: 28, haha: 0, wow: 15, sad: 0, angry: 0 },
    comments: [
      { id: 'c3', authorId: '2', content: 'Stunning photography! 📸', createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
    ],
    shares: 12,
    privacy: 'public',
    feeling: null,
  },
  {
    id: 'p3',
    authorId: '1',
    content: 'A warm welcome to everyone joining the FRIENDIX platform! 🎉 This is the beginning of a brand new era. Together we will build a beautiful community. Connect, share, and enjoy every moment of life! #FRIENDIX #NewEra',
    image: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likes: ['2', '3', '4', '5'],
    reactions: { like: 87, love: 53, haha: 4, wow: 21, sad: 0, angry: 0 },
    comments: [
      { id: 'c4', authorId: '3', content: 'Congratulations! This platform is going to be amazing! 🚀', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
      { id: 'c5', authorId: '2', content: 'Super excited to be here! 🎊', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString() },
      { id: 'c6', authorId: '4', content: 'Great initiative! Best of luck! 💪', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    ],
    shares: 34,
    privacy: 'public',
    bgColor: 'linear-gradient(135deg, #1877F2, #7B2FBE)',
    feeling: null,
  },
  {
    id: 'p4',
    authorId: '4',
    content: 'Eating the famous sweet mangoes of Rajshahi right now 🥭 If you do not visit this season, you will miss out!',
    image: 'https://picsum.photos/seed/post4/600/400',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    likes: ['1'],
    reactions: { like: 23, love: 11, haha: 7, wow: 5, sad: 0, angry: 0 },
    comments: [],
    shares: 3,
    privacy: 'public',
    feeling: '😋 feeling delicious',
  },
  {
    id: 'p5',
    authorId: '5',
    content: 'Just finished reading a masterpiece - "The Alchemist" by Paulo Coelho. Highly recommended for everyone to read at least once. Truly inspiring! 📖✨',
    image: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    likes: ['1', '3'],
    reactions: { like: 31, love: 18, haha: 0, wow: 8, sad: 0, angry: 0 },
    comments: [
      { id: 'c7', authorId: '1', content: 'My favorite book of all time! 💙', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString() },
    ],
    shares: 8,
    privacy: 'public',
    feeling: '📚 feeling inspired',
  },
];

export const mockStories = [
  {
    id: 's1',
    authorId: '2',
    image: 'https://picsum.photos/seed/story1/300/500',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    viewed: false,
  },
  {
    id: 's2',
    authorId: '3',
    image: 'https://picsum.photos/seed/story2/300/500',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    viewed: true,
  },
  {
    id: 's3',
    authorId: '4',
    image: 'https://picsum.photos/seed/story3/300/500',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    viewed: false,
  },
  {
    id: 's4',
    authorId: '5',
    image: 'https://picsum.photos/seed/story4/300/500',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    viewed: true,
  },
];

export const mockNotifications = [
  {
    id: 'n1',
    type: 'like',
    fromUserId: '2',
    postId: 'p3',
    message: 'Rahim Uddin liked your post.',
    messageEn: 'Rahim Uddin liked your post.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'n2',
    type: 'comment',
    fromUserId: '3',
    postId: 'p3',
    message: 'Sadia Islam commented on your post.',
    messageEn: 'Sadia Islam commented on your post.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'n3',
    type: 'friend_request',
    fromUserId: '5',
    postId: null,
    message: 'Nasrin Akter sent you a friend request.',
    messageEn: 'Nasrin Akter sent you a friend request.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'n4',
    type: 'birthday',
    fromUserId: '4',
    postId: null,
    message: 'Today is Karim Ahmed\'s birthday! 🎂',
    messageEn: 'Today is Karim Ahmed\'s birthday! 🎂',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export const mockMessages = {
  '2': [
    { id: 'm1', senderId: '2', content: 'Hey! How are you doing?', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: 'm2', senderId: '1', content: 'Hey! I am doing great. How about you?', createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString() },
    { id: 'm3', senderId: '2', content: 'Doing good too. FRIENDIX layout looks amazing! 🔥', createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
    { id: 'm4', senderId: '1', content: 'Yes! Thank you so much 😊', createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  ],
  '3': [
    { id: 'm5', senderId: '3', content: 'Your latest post is wonderful!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    { id: 'm6', senderId: '1', content: 'Thank you Sadia! Your travel photos are beautiful as well!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString() },
  ],
  '4': [
    { id: 'm7', senderId: '4', content: 'What\'s up brother?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  ],
};

export const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;

  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US');
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
