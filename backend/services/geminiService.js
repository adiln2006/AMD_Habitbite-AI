import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.7,
  },
});

// 1. Generate recipes from ingredients + cuisine
export const generateRecipes = async (ingredients, cuisine) => {
  const prompt = `You are a professional nutritionist and chef. Generate 4 healthy recipes using these ingredients: ${ingredients.join(', ')}.
  Cuisine preference: ${cuisine}.
  Each recipe should be quick (under 15 minutes prep time).
  
  Return a JSON array of recipes with this exact structure:
  [
    {
      "title": "Recipe Name",
      "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
      "steps": ["Step 1 description", "Step 2 description"],
      "prepTime": "10 min",
      "calories": 250,
      "healthTip": "A brief health benefit of this recipe",
      "difficulty": "Easy"
    }
  ]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
};

// 2. Generate diet roadmap
export const generateRoadmap = async (goal, cuisine, duration) => {
  const prompt = `You are a certified dietitian. Create a ${duration}-month diet and exercise roadmap.
  Goal: ${goal}
  Preferred Cuisine: ${cuisine}
  Duration: ${duration} month(s)
  
  Return a JSON object with this structure:
  {
    "summary": "Brief overview of the plan",
    "dailyCalorieTarget": 1800,
    "weeks": [
      {
        "week": 1,
        "theme": "Getting Started",
        "meals": {
          "breakfast": "Oats with fruits and nuts",
          "lunch": "Grilled chicken salad with brown rice",
          "dinner": "Lentil soup with whole wheat roti",
          "snack": "Greek yogurt with honey"
        },
        "exercise": {
          "name": "Morning Walk + Stretching",
          "duration": "20 min",
          "steps": ["5 min warm-up walk", "10 min brisk walk", "5 min cool-down stretching"]
        },
        "tip": "Start by drinking 8 glasses of water daily"
      }
    ]
  }
  
  Generate ${Math.min(duration * 4, 8)} weeks of plans. Make each week progressively more challenging.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
};

// 3. Get smart alternative for junk food pattern
export const getSmartAlternative = async (junkFood, time) => {
  const prompt = `A user frequently eats junk food "${junkFood}" around ${time}. 
  Suggest ONE healthy alternative they can easily switch to.
  
  Return JSON:
  {
    "alternative": "Healthy food name",
    "reason": "Why this is better (1 sentence)",
    "calories": 150,
    "emoji": "🥗",
    "preparationTime": "5 min"
  }`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
};

// 4. Estimate calories for food
export const estimateCalories = async (foodName, quantity) => {
  const prompt = `Estimate the nutritional content for: "${quantity} of ${foodName}".
  
  Return JSON:
  {
    "calories": 250,
    "protein": 12,
    "carbs": 30,
    "fat": 8,
    "fiber": 3,
    "healthScore": 7,
    "category": "healthy"
  }
  
  healthScore is 1-10 (10 = very healthy). category is either "healthy" or "junk".`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
};

// 5. Suggest exercises
export const suggestExercises = async (goal, timeAvailable) => {
  const prompt = `Suggest 5 simple exercises for someone with the goal: "${goal}".
  Available time: ${timeAvailable} minutes.
  These should be doable at home without equipment.
  
  Return a JSON array:
  [
    {
      "name": "Exercise Name",
      "duration": "3 min",
      "reps": "10 reps x 2 sets",
      "steps": ["Step 1", "Step 2"],
      "targetArea": "Core",
      "difficulty": "Beginner",
      "caloriesBurned": 25,
      "emoji": "🏃"
    }
  ]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
};
