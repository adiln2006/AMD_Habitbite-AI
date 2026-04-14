import { useState } from 'react';
import { generateRecipes as apiGenerateRecipes, saveRecipe } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineClock, HiOutlineFire, HiOutlineHeart, HiOutlineBookmark, HiX } from 'react-icons/hi';

const cuisines = [
  { name: 'Indian', emoji: '🇮🇳' },
  { name: 'Italian', emoji: '🇮🇹' },
  { name: 'Mexican', emoji: '🇲🇽' },
  { name: 'Chinese', emoji: '🇨🇳' },
  { name: 'Japanese', emoji: '🇯🇵' },
  { name: 'Thai', emoji: '🇹🇭' },
  { name: 'Mediterranean', emoji: '🫒' },
  { name: 'American', emoji: '🇺🇸' },
  { name: 'Korean', emoji: '🇰🇷' },
  { name: 'Middle Eastern', emoji: '🧆' },
];

const Recipes = () => {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [cuisine, setCuisine] = useState('Indian');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRecipe, setExpandedRecipe] = useState(null);

  const addIngredient = () => {
    const val = inputValue.trim();
    if (val && !ingredients.includes(val)) {
      setIngredients([...ingredients, val]);
      setInputValue('');
    }
  };

  const removeIngredient = (ing) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addIngredient(); }
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      toast.error('Add at least one ingredient');
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiGenerateRecipes({ ingredients, cuisine });
      setRecipes(data.recipes || []);
      toast.success(`Generated ${data.recipes?.length || 0} recipes!`);
    } catch (err) {
      toast.error('Failed to generate recipes');
    }
    setLoading(false);
  };

  const handleSave = async (recipe) => {
    try {
      await saveRecipe({ ...recipe, cuisine });
      toast.success('Recipe saved!');
    } catch (err) {
      toast.error('Failed to save recipe');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <p className="section-label">Feature 01</p>
        <h1 className="section-title">AI Recipe Generator</h1>
        <p className="section-subtitle">
          Enter your available ingredients and preferred cuisine — AI will craft healthy recipes in under 15 minutes.
        </p>
      </div>

      {/* Input Area */}
      <div className="card recipe-input-area fade-in fade-in-delay-1">
        <div className="input-group">
          <label>Ingredients</label>
          <div className="ingredient-input-row">
            <input className="input" placeholder="Type an ingredient and press Enter..."
              value={inputValue} onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown} />
            <button className="btn btn-outline btn-sm" onClick={addIngredient} type="button">Add</button>
          </div>
          <div className="ingredient-tags">
            {ingredients.map(ing => (
              <span key={ing} className="tag">
                {ing}
                <span className="tag-remove" onClick={() => removeIngredient(ing)}>×</span>
              </span>
            ))}
            {ingredients.length === 0 && (
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                e.g., Egg, Rice, Tomato, Onion...
              </span>
            )}
          </div>
        </div>

        <div className="input-group">
          <label>Select Cuisine</label>
          <div className="cuisine-grid">
            {cuisines.map(c => (
              <div key={c.name}
                className={`cuisine-card ${cuisine === c.name ? 'selected' : ''}`}
                onClick={() => setCuisine(c.name)}>
                <span className="emoji">{c.emoji}</span>
                {c.name}
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={loading}
          style={{ alignSelf: 'flex-start' }}>
          {loading ? (
            <>
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
              Generating...
            </>
          ) : '🍳 Generate Recipes'}
        </button>
      </div>

      {/* Results */}
      {recipes.length > 0 && (
        <>
          <h2 style={{ margin: '32px 0 16px', fontSize: '1.2rem' }}>Generated Recipes</h2>
          <div className="recipe-results">
            {recipes.map((recipe, idx) => (
              <div key={idx} className={`recipe-card fade-in fade-in-delay-${idx + 1}`}>
                <div className="recipe-card-header">
                  <h3 className="recipe-card-title">{recipe.title}</h3>
                  <div className="recipe-card-meta">
                    <span><HiOutlineClock /> {recipe.prepTime}</span>
                    <span><HiOutlineFire /> {recipe.calories} cal</span>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{recipe.difficulty || 'Easy'}</span>
                  </div>
                </div>
                <div className="recipe-card-body">
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Ingredients
                    </strong>
                    <div className="ingredient-tags" style={{ paddingTop: '6px' }}>
                      {recipe.ingredients?.map((ing, i) => (
                        <span key={i} className="tag">{ing}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Steps
                    </strong>
                    <ol className="recipe-steps">
                      {recipe.steps?.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {recipe.healthTip && (
                    <div className="recipe-health-tip">
                      💡 {recipe.healthTip}
                    </div>
                  )}
                </div>
                <div className="recipe-card-footer">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSave(recipe)}>
                    <HiOutlineBookmark /> Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loader" style={{ marginTop: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p style={{ color: 'var(--color-text-muted)' }}>AI is crafting delicious recipes...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;
