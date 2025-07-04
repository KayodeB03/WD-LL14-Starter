// Populate the area dropdown when the page loads
window.addEventListener("DOMContentLoaded", async function () {
  const areaSelect = document.getElementById("area-select");
  areaSelect.innerHTML = '<option value="">Select Area</option>';

  // Fetch the list of areas using async/await
  try {
    const response = await fetch("https://www.themealdb.com/api/json/v1/1/list.php?a=list");
    const data = await response.json();
    if (data.meals) {
      data.meals.forEach((areaObj) => {
        const option = document.createElement("option");
        option.value = areaObj.strArea;
        option.textContent = areaObj.strArea;
        areaSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error fetching areas:", error);
  }
});

// When the user selects an area, fetch and display meals for that area
// Use async/await and add click event to each meal card

document.getElementById("area-select").addEventListener("change", async function () {
  const area = this.value;
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear previous results

  if (!area) return;

  try {
    // Fetch meals for the selected area
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`
    );
    const data = await response.json();
    if (data.meals) {
      data.meals.forEach((meal) => {
        // Create a Bootstrap card for each meal
        const mealDiv = document.createElement("div");
        mealDiv.className = "meal col-12 col-sm-6 col-md-4 col-lg-3";
        mealDiv.style.cursor = "pointer";
        mealDiv.setAttribute("data-mealid", meal.idMeal);

        mealDiv.innerHTML = `
          <div class="card h-100 shadow-sm">
            <img src="${meal.strMealThumb}" class="card-img-top mx-auto d-block mt-3" alt="${meal.strMeal}" style="width: 80%;">
            <div class="card-body d-flex flex-column justify-content-between">
              <h5 class="card-title text-center w-100">${meal.strMeal}</h5>
            </div>
          </div>
        `;
        resultsDiv.appendChild(mealDiv);

        // Add click event to fetch and display meal details
        mealDiv.addEventListener("click", async function () {
          const mealId = this.getAttribute("data-mealid");
          await showMealDetails(mealId);
        });
      });
    } else {
      resultsDiv.textContent = "No meals found for this area.";
    }
  } catch (error) {
    resultsDiv.textContent = "Error fetching meals.";
    console.error("Error fetching meals:", error);
  }
});

// Function to fetch and display meal details by ID
async function showMealDetails(mealId) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "Loading meal details...";

  try {
    // Fetch meal details using the meal ID
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
    const data = await response.json();
    if (data.meals && data.meals[0]) {
      const meal = data.meals[0];
      // Display meal details
      // Split instructions into sentences and list them
      const instructionsList = meal.strInstructions
        .split(/(?<=[.!?])\s+/)
        .filter(sentence => sentence.trim().length > 0)
        .map(sentence => `<li>${sentence.trim()}</li>`)
        .join("");

      // Gather all ingredients for this meal
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
          ingredients.push(`${ingredient}${measure && measure.trim() !== "" ? ` - ${measure}` : ""}`);
        }
      }

      // Display meal details, instructions (as a paragraph), and ingredients
      resultsDiv.innerHTML = `
        <div class="meal-details card mx-auto p-4" style="max-width:600px;">
          <h2 class="mb-3">${meal.strMeal}</h2>
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="mb-3 img-fluid rounded">
          <p><strong>Category:</strong> ${meal.strCategory}</p>
          <p><strong>Area:</strong> ${meal.strArea}</p>
          <p><strong>Ingredients:</strong></p>
          <ul>${ingredients.map(ing => `<li>${ing}</li>`).join("")}</ul>
          <p><strong>Instructions:</strong></p>
          <p>${meal.strInstructions}</p>
          <button id="back-btn" class="btn btn-secondary mt-3">Back to meals</button>
        </div>
      `;
      // Add a back button to return to the meal list
      document.getElementById("back-btn").addEventListener("click", function () {
        document.getElementById("area-select").dispatchEvent(new Event("change"));
      });
    } else {
      resultsDiv.textContent = "Meal details not found.";
    }
  } catch (error) {
    resultsDiv.textContent = "Error fetching meal details.";
    console.error("Error fetching meal details:", error);
  }
}
