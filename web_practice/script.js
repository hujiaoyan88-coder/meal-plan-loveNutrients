let draggedCard = null;
let currentDay = "sun"; // 初期表示は日曜
let firstmenu = "howto";

// ===== データ =====
const appData = {
  fridge: [],
  freezer: [],
  meals: {
    sun: { 朝: [], 昼: [], 夕: [] },
    mon: { 朝: [], 昼: [], 夕: [] },
    tue: { 朝: [], 昼: [], 夕: [] },
    wed: { 朝: [], 昼: [], 夕: [] },
    thu: { 朝: [], 昼: [], 夕: [] },
    fri: { 朝: [], 昼: [], 夕: [] },
    sat: { 朝: [], 昼: [], 夕: [] },
  }
};

// ===== タブ切り替え =====
const tabs = document.querySelectorAll(".tab");
const contents = document.querySelectorAll(".content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));

    tab.classList.add("active");
    currentDay = tab.dataset.day;
    document.getElementById(currentDay).classList.add("active");

    renderAll();
  });
});

const menus = document.querySelectorAll(".menu");
const containers = document.querySelectorAll(".container");

menus.forEach(menu => {
  menu.addEventListener("click", () => {
    // active 全解除
    menus.forEach(m => m.classList.remove("active"));
    containers.forEach(c => c.classList.remove("active"));

    // クリックしたメニューを active
    menu.classList.add("active");

    // 対応するコンテンツ表示
    const target = menu.dataset.menu;
    document.getElementById(target).classList.add("active");
  });
});



// ===== 食材追加 =====
const foodInput = document.getElementById("foodName");
const countInput = document.getElementById("count");
const addButtons = document.querySelectorAll(".addBtn");

addButtons.forEach(button => {
  button.addEventListener("click", () => {
    const foodName = foodInput.value.trim();
    const count = Number(countInput.value);

    if (!foodName || count <= 0) {
      alert("料理名と食数を入力してね");
      return;
    }

    const target = button.dataset.target;

    for (let i = 0; i < count; i++) {
      appData[target].push({ name: foodName, origin: target });
    }

    saveData();
    renderAll();

    foodInput.value = "";
    countInput.value = 1;
  });
});

// ===== 朝昼夕のカード作成 =====
const mealsArr = ["朝", "昼", "夕"];
document.querySelectorAll(".meals").forEach(mealsDiv => {
  mealsArr.forEach(meal => {
    const card = document.createElement("div");
    card.className = "meal-card";
    card.dataset.meal = meal;

    card.innerHTML = `
      <h3>${meal}</h3>
      <div class="actions">
        <button class="btn reset">リセット</button>
        <button class="btn eat">食べた</button>
      </div>
      <ul class="meal-list" data-meal="${meal}"></ul>
    `;

    mealsDiv.appendChild(card);
  });
});

// ===== ドラッグ＆ドロップ =====
document.addEventListener("dragover", e => {
  if (e.target.classList.contains("meal-list")) e.preventDefault();
});

document.querySelectorAll(".meal-list").forEach(list => {
  list.addEventListener("dragover", e => e.preventDefault());

  list.addEventListener("drop", e => {
    e.preventDefault();
    if (!draggedCard) return;

    const mealType = list.dataset.meal;

    // meals に追加
    appData.meals[currentDay][mealType].push(draggedCard);

    // 元の場所から削除
    appData[draggedCard.origin] = appData[draggedCard.origin].filter(f => f !== draggedCard);

    draggedCard = null;
    saveData();
    renderAll();
  });
});

// ===== 食べた／リセットボタン =====
document.addEventListener("click", e => {
  const target = e.target;

  // 食べた
  if (target.classList.contains("eat")) {
    const mealList = target.closest(".meal-card").querySelector(".meal-list");
    const mealType = mealList.dataset.meal;

    appData.meals[currentDay][mealType] = [];
    saveData();
    renderAll();
  }

  // リセット
  if (target.classList.contains("reset")) {
    const mealCard = target.closest(".meal-card");
    const mealType = mealCard.dataset.meal;
    const foods = appData.meals[currentDay][mealType];

    foods.forEach(food => appData[food.origin].push(food));

    appData.meals[currentDay][mealType] = [];
    saveData();
    renderAll();
  }
});

// ===== 保存・読み込み =====
function saveData() {
  localStorage.setItem("mealApp", JSON.stringify(appData));
}

function loadData() {
  const saved = localStorage.getItem("mealApp");
  if (saved) Object.assign(appData, JSON.parse(saved));
}

// ===== 描画 =====
function renderAll() {
  ["fridge", "freezer"].forEach(area => {
    const container = document.getElementById(area);

    // container.innerHTML = "";  ← これをやめる
    // 既存ラベル以外を消す
    container.querySelectorAll(".food-card").forEach(card => card.remove());

    appData[area].forEach(food => {
      const card = createFoodCard(food);
      container.appendChild(card);
    });
  });

  // 朝昼夕のリストも同様
  document.querySelectorAll(".meal-list").forEach(list => {
    const mealType = list.dataset.meal;
    list.innerHTML = "";

    appData.meals[currentDay][mealType].forEach(food => {
      const card = createFoodCard(food);
      list.appendChild(card);
    });
  });
}


// ===== 食材カード作成 =====
function createFoodCard(food) {
  const card = document.createElement("div");
  card.className = "food-card";
  card.textContent = food.name;
  card.draggable = true;

  card.addEventListener("dragstart", () => {
    draggedCard = food;
  });

  return card;
}

// ===== 初期化 =====
loadData();
renderAll();
