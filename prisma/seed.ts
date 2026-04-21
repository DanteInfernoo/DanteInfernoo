import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const platforms = [
  { type: 'INSTAGRAM', name: 'Instagram', username: '@yourhandle', connected: true, color: '#E1306C', followerCount: 12400 },
  { type: 'FACEBOOK', name: 'Facebook', username: 'Your Page', connected: true, color: '#1877F2', followerCount: 8900 },
  { type: 'TWITTER', name: 'Twitter / X', username: '@yourhandle', connected: true, color: '#000000', followerCount: 5200 },
  { type: 'TIKTOK', name: 'TikTok', username: '@yourhandle', connected: true, color: '#69C9D0', followerCount: 31000 },
  { type: 'LINKEDIN', name: 'LinkedIn', username: 'Your Company', connected: true, color: '#0A66C2', followerCount: 3800 },
  { type: 'YOUTUBE', name: 'YouTube', username: 'Your Channel', connected: false, color: '#FF0000', followerCount: 0 },
  { type: 'PINTEREST', name: 'Pinterest', username: '', connected: false, color: '#E60023', followerCount: 0 },
]

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(Math.floor(Math.random() * 12) + 7, [0, 15, 30, 45][Math.floor(Math.random() * 4)], 0, 0)
  return d
}

function daysAgo(days: number): Date {
  return daysFromNow(-days)
}

async function main() {
  console.log('Seeding database...')

  await prisma.postPlatform.deleteMany()
  await prisma.post.deleteMany()
  await prisma.platform.deleteMany()

  const createdPlatforms = await Promise.all(
    platforms.map(p => prisma.platform.create({ data: p }))
  )

  const [instagram, facebook, twitter, tiktok, linkedin] = createdPlatforms

  const posts = [
    // Published posts (past)
    {
      content: "Excited to share our latest product launch! 🚀 After months of hard work, we're finally here. Check out the link in bio for more details. What do you think?",
      contentType: 'IMAGE',
      status: 'PUBLISHED',
      scheduledAt: daysAgo(60),
      publishedAt: daysAgo(60),
      hashtags: JSON.stringify(['#launch', '#product', '#excited', '#new']),
      platformIds: [instagram.id, facebook.id],
    },
    {
      content: "Monday motivation 💪 Remember: consistency beats perfection every single time. Keep showing up, keep improving. Your future self will thank you.",
      contentType: 'IMAGE',
      status: 'PUBLISHED',
      scheduledAt: daysAgo(55),
      publishedAt: daysAgo(55),
      hashtags: JSON.stringify(['#motivation', '#monday', '#mindset', '#growth']),
      platformIds: [instagram.id, twitter.id, linkedin.id],
    },
    {
      content: "Behind the scenes of our team photoshoot! 📸 Meet the amazing people who make everything possible. We're hiring — link in bio!",
      contentType: 'CAROUSEL',
      status: 'PUBLISHED',
      scheduledAt: daysAgo(48),
      publishedAt: daysAgo(48),
      hashtags: JSON.stringify(['#teamwork', '#behindthescenes', '#hiring', '#culture']),
      platformIds: [instagram.id, linkedin.id],
    },
    {
      content: "Tutorial Tuesday! 🎥 Learn how to set up your workflow in under 3 minutes. Save this for later! Which tip was most useful?",
      contentType: 'REEL',
      status: 'PUBLISHED',
      scheduledAt: daysAgo(42),
      publishedAt: daysAgo(42),
      hashtags: JSON.stringify(['#tutorial', '#tips', '#workflow', '#productivity']),
      platformIds: [instagram.id, tiktok.id],
    },
    {
      content: "We just hit 10,000 followers! 🎉 Thank you so much for your support. To celebrate, we're giving away 3 premium subscriptions. Follow + retweet to enter!",
      contentType: 'IMAGE',
      status: 'PUBLISHED',
      scheduledAt: daysAgo(35),
      publishedAt: daysAgo(35),
      hashtags: JSON.stringify(['#giveaway', '#milestone', '#thankyou', '#10k']),
      platformIds: [twitter.id, instagram.id, facebook.id],
    },
    {
      content: "Hot take: Most people overcomplicate social media. Here's what actually works in 2025:\n\n1. Show up consistently\n2. Create value, not noise\n3. Engage genuinely\n4. Track what resonates\n5. Iterate and improve\n\nThat's it. Thread 🧵",
      contentType: 'THREAD',
      status: 'PUBLISHED',
      scheduledAt: daysAgo(28),
      publishedAt: daysAgo(28),
      hashtags: JSON.stringify(['#socialmedia', '#marketing', '#growth', '#tips']),
      platformIds: [twitter.id, linkedin.id],
    },
    {
      content: "Flash sale alert! ⚡ 30% off everything this weekend only. Use code SOCIAL30 at checkout. Link in bio. Don't miss out!",
      contentType: 'STORY',
      status: 'PUBLISHED',
      scheduledAt: daysAgo(21),
      publishedAt: daysAgo(21),
      hashtags: JSON.stringify(['#sale', '#discount', '#limitedtime', '#shopping']),
      platformIds: [instagram.id, facebook.id],
    },
    {
      content: "We asked, you answered! 📊 Here are the results of our latest poll on what content you want to see more of. Reels and tutorials win by a landslide!",
      contentType: 'IMAGE',
      status: 'PUBLISHED',
      scheduledAt: daysAgo(14),
      publishedAt: daysAgo(14),
      hashtags: JSON.stringify(['#poll', '#community', '#feedback', '#content']),
      platformIds: [instagram.id, twitter.id],
    },
    {
      content: "Weekend reads 📚 5 books that changed how I think about business:\n1. The Lean Startup\n2. Zero to One\n3. Good to Great\n4. The E-Myth\n5. Purple Cow\n\nWhat would you add to this list?",
      contentType: 'IMAGE',
      status: 'PUBLISHED',
      scheduledAt: daysAgo(7),
      publishedAt: daysAgo(7),
      hashtags: JSON.stringify(['#books', '#reading', '#business', '#learning']),
      platformIds: [linkedin.id, twitter.id, facebook.id],
    },

    // Scheduled posts (future)
    {
      content: "New blog post is live! 📝 'How to Build a Content Calendar That Actually Works' — everything you need to plan your entire year of content. Read it now, link in bio.",
      contentType: 'IMAGE',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(2),
      hashtags: JSON.stringify(['#contentmarketing', '#blog', '#planning', '#socialmedia']),
      platformIds: [instagram.id, linkedin.id, facebook.id],
    },
    {
      content: "POV: You planned your content a month in advance 😌✨ This is your sign to start batch-creating content. Your future self will thank you!",
      contentType: 'REEL',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(4),
      hashtags: JSON.stringify(['#contentcreator', '#batchcreating', '#productivity', '#contentplan']),
      platformIds: [instagram.id, tiktok.id],
    },
    {
      content: "Q&A Time! 💬 Drop your questions below about content creation, social media strategy, or growing your brand. I'll answer the top 10 in Friday's post!",
      contentType: 'IMAGE',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(5),
      hashtags: JSON.stringify(['#qanda', '#askme', '#community', '#socialmediatips']),
      platformIds: [instagram.id, twitter.id],
    },
    {
      content: "Case study: How we grew our Instagram from 0 to 12K in 8 months without paid ads. Full breakdown in the article — link in comments.",
      contentType: 'ARTICLE',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(7),
      hashtags: JSON.stringify(['#casestudy', '#instagramgrowth', '#organicgrowth', '#marketing']),
      platformIds: [linkedin.id],
    },
    {
      content: "Mid-week check-in! How's your content week going? 🙋 We're curious what type of content has been performing best for you lately. Let us know below 👇",
      contentType: 'IMAGE',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(9),
      hashtags: JSON.stringify(['#contentcreators', '#midweek', '#socialmedia', '#engagement']),
      platformIds: [instagram.id, facebook.id, twitter.id],
    },
    {
      content: "🎬 Step-by-step: How to film a reel with just your phone. No fancy equipment needed! Save this tutorial and try it this weekend.",
      contentType: 'VIDEO',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(12),
      hashtags: JSON.stringify(['#reels', '#videotips', '#phonecamera', '#contentcreation']),
      platformIds: [tiktok.id, instagram.id],
    },
    {
      content: "Big announcement coming soon... 👀 We've been working on something special for our community. Stay tuned. Drop a 🔔 if you want to be the first to know.",
      contentType: 'STORY',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(14),
      hashtags: JSON.stringify(['#comingsoon', '#announcement', '#excited', '#news']),
      platformIds: [instagram.id, facebook.id],
    },
    {
      content: "Monthly round-up! 📅 Here's everything that happened in our world this month. What was your favorite piece of content we shared?",
      contentType: 'CAROUSEL',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(18),
      hashtags: JSON.stringify(['#monthly', '#roundup', '#recap', '#community']),
      platformIds: [instagram.id, linkedin.id],
    },
    {
      content: "Unpopular opinion: Follower count is the most overrated metric in social media. Here's what you should be tracking instead 👇",
      contentType: 'THREAD',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(21),
      hashtags: JSON.stringify(['#opinion', '#metrics', '#analytics', '#socialmediamarketing']),
      platformIds: [twitter.id, linkedin.id],
    },
    {
      content: "Summer content strategy is here! ☀️ Whether you're in fashion, food, travel, or business — we've got templates and tips for every niche. Which industry are you in?",
      contentType: 'IMAGE',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(25),
      hashtags: JSON.stringify(['#summervibes', '#contentstrategy', '#contentcalendar', '#planning']),
      platformIds: [instagram.id, facebook.id],
    },
    {
      content: "Collaboration alert! 🤝 We're partnering with @brandname to bring you something incredible. Two worlds colliding in the best possible way.",
      contentType: 'IMAGE',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(30),
      hashtags: JSON.stringify(['#collab', '#partnership', '#collaboration', '#exciting']),
      platformIds: [instagram.id, facebook.id, twitter.id],
    },
    {
      content: "How to write captions that convert: A step-by-step framework used by top creators. Bookmark this — you'll come back to it often.",
      contentType: 'CAROUSEL',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(35),
      hashtags: JSON.stringify(['#captions', '#copywriting', '#socialmediatips', '#contentcreator']),
      platformIds: [instagram.id, linkedin.id],
    },
    {
      content: "Independence Day special content 🎆 What freedom means to us as a brand and community. Share what independence means to you in the comments.",
      contentType: 'VIDEO',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(45),
      hashtags: JSON.stringify(['#july4th', '#freedom', '#community', '#celebration']),
      platformIds: [instagram.id, facebook.id, tiktok.id],
    },
    {
      content: "Back-to-school season prep! 📚 If your audience includes students, parents, or educators — here's your content roadmap for August-September.",
      contentType: 'ARTICLE',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(60),
      hashtags: JSON.stringify(['#backtoschool', '#contentplan', '#education', '#fall']),
      platformIds: [linkedin.id, facebook.id],
    },
    {
      content: "Fall content ideas just dropped 🍂 60+ ideas for October, November, and December. Your Q4 content calendar is sorted. Save this now!",
      contentType: 'CAROUSEL',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(90),
      hashtags: JSON.stringify(['#fall', '#Q4', '#contentideas', '#planning']),
      platformIds: [instagram.id],
    },
    {
      content: "Holiday campaign prep starts NOW 🎄 It's never too early to plan your Christmas and New Year's content. Here's our strategy template — free for the community!",
      contentType: 'IMAGE',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(120),
      hashtags: JSON.stringify(['#holiday', '#christmas', '#contentplan', '#marketing']),
      platformIds: [instagram.id, facebook.id, linkedin.id, twitter.id],
    },
    {
      content: "Year in review 🔥 What an incredible year it's been. Here are our top 10 moments, milestones, and memories from this year. Thank you for being part of the journey.",
      contentType: 'VIDEO',
      status: 'SCHEDULED',
      scheduledAt: daysFromNow(250),
      hashtags: JSON.stringify(['#yearinreview', '#2025', '#milestones', '#thankyou']),
      platformIds: [instagram.id, facebook.id, tiktok.id, linkedin.id],
    },

    // Draft posts
    {
      content: "Draft: Weekly tips carousel — need to finalize the 5 tips before posting. Consider adding case studies for each tip.",
      contentType: 'CAROUSEL',
      status: 'DRAFT',
      hashtags: JSON.stringify(['#tips', '#weekly', '#carousel']),
      platformIds: [instagram.id, linkedin.id],
    },
    {
      content: "Draft: Product feature spotlight — filming is done, need to edit. Aim for 30-second format for TikTok and Reels.",
      contentType: 'REEL',
      status: 'DRAFT',
      hashtags: JSON.stringify(['#product', '#feature', '#spotlight']),
      platformIds: [tiktok.id, instagram.id],
    },
    {
      content: "Draft: Customer success story from @jane — waiting for approval from client before publishing. Check photos from Dropbox folder.",
      contentType: 'IMAGE',
      status: 'DRAFT',
      hashtags: JSON.stringify(['#testimonial', '#success', '#customer']),
      platformIds: [instagram.id, linkedin.id, facebook.id],
    },
  ]

  for (const postData of posts) {
    const { platformIds, ...rest } = postData
    const validPlatformIds = platformIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
    await prisma.post.create({
      data: {
        ...rest,
        platforms: {
          create: validPlatformIds.map(platformId => ({
            platformId,
            status: rest.status === 'PUBLISHED' ? 'PUBLISHED' : 'PENDING',
          })),
        },
      },
    })
  }

  console.log(`Seeded ${platforms.length} platforms and ${posts.length} posts.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
