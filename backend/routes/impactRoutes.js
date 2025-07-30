const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Add this to your .env file
});

// Sample fallback data in case OpenAI fails
const fallbackCampaigns = [
  {
    type: "Child Hunger",
    fact: "Every 10 seconds, a child dies from hunger-related causes worldwide. 48% of underprivileged children face life-threatening malnutrition.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop",
    title: "Help Feed Hungry Children",
    description: "Provide nutritious meals to children in need"
  },
  {
    type: "Medical Emergency",
    fact: "In India, 55% of medical expenses are paid out-of-pocket, pushing families into poverty during health emergencies.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
    title: "Support Medical Treatment",
    description: "Help families afford life-saving medical procedures"
  },
  {
    type: "Animal Welfare",
    fact: "Over 30 million stray animals in India lack basic food and medical care. Your donation can save precious lives.",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop",
    title: "Care for Stray Animals",
    description: "Provide food, shelter and medical care for abandoned animals"
  },
  {
    type: "Education",
    fact: "6 million children in India are still out of school. Education is the most powerful tool to break the cycle of poverty.",
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop",
    title: "Support Education for All",
    description: "Help underprivileged children access quality education"
  }
];

// ADDED: Test route to verify the routes are working
router.get('/impact-test', (req, res) => {
  console.log('🧪 Impact test route accessed');
  res.json({
    success: true,
    message: 'Impact routes are working!',
    openai_configured: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString(),
    routes_available: [
      '/api/impact-test',
      '/api/generate-impact-content',
      '/api/campaign/:type'
    ]
  });
});

// Generate impact content with OpenAI
router.get('/generate-impact-content', async (req, res) => {
  try {
    console.log('🎯 Generating impact content with OpenAI...');

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ OpenAI API key not found, using fallback data');
      return res.json({
        success: true, // ADDED: Success flag
        campaigns: fallbackCampaigns,
        source: 'fallback',
        message: 'Using fallback data - OpenAI API key not configured'
      });
    }

    // Generate content using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a compassionate social impact expert. Generate impactful, factual content about social causes that inspire donations. Focus on real statistics and compelling stories."
        },
        {
          role: "user",
          content: `Generate 4 different social impact campaigns with real statistics. For each campaign, provide:
          1. Type (category like "Child Hunger", "Medical Emergency", etc.)
          2. Fact (a compelling statistic about the issue)
          3. Title (campaign title)
          4. Description (brief description of how donations help)
          
          Return as JSON array with these exact keys: type, fact, title, description.
          Make the facts compelling and accurate, focusing on issues in India or globally.`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    let generatedCampaigns;
    try {
      // Parse the OpenAI response
      const content = completion.choices[0].message.content;
      generatedCampaigns = JSON.parse(content);
      
      // Add stock images to each campaign
      const imageUrls = [
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop"
      ];

      generatedCampaigns = generatedCampaigns.map((campaign, index) => ({
        ...campaign,
        image: imageUrls[index % imageUrls.length]
      }));

      console.log('✅ Successfully generated impact content with OpenAI');

    } catch (parseError) {
      console.error('❌ Error parsing OpenAI response:', parseError);
      console.log('🔄 Using fallback data due to parsing error');
      generatedCampaigns = fallbackCampaigns;
    }

    res.json({
      success: true, // ADDED: Success flag
      campaigns: generatedCampaigns,
      source: 'openai',
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating impact content:', error);
    
    // Return fallback data if OpenAI fails
    res.json({
      success: true, // ADDED: Success flag (still successful with fallback)
      campaigns: fallbackCampaigns,
      source: 'fallback',
      error: 'OpenAI generation failed',
      message: 'Using fallback data due to OpenAI error'
    });
  }
});

// Get specific campaign details
router.get('/campaign/:type', async (req, res) => {
  try {
    const campaignType = req.params.type;
    
    // ADDED: Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        success: false,
        error: 'OpenAI API key not configured',
        type: campaignType,
        message: 'Please configure OPENAI_API_KEY in environment variables'
      });
    }
    
    // Generate specific content for the campaign type
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Generate detailed information about a specific social cause for donation campaigns."
        },
        {
          role: "user",
          content: `Generate detailed content for a "${campaignType}" donation campaign including:
          - 3 compelling statistics
          - Impact story example
          - How donations help
          
          Return as JSON with keys: statistics, impactStory, donationImpact`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    const campaignDetails = JSON.parse(content);

    res.json({
      success: true, // ADDED: Success flag
      type: campaignType,
      details: campaignDetails,
      source: 'openai'
    });

  } catch (error) {
    console.error('❌ Error generating campaign details:', error);
    res.status(500).json({
      success: false, // ADDED: Success flag
      error: 'Failed to generate campaign details',
      message: error.message
    });
  }
});

module.exports = router;