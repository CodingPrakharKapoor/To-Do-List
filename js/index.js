$(document).ready(function () {
  $(".start-logo").click(function () {
    $(".side-bar").toggleClass("open");
  });

  $(document).on("click", ".xp-power", function () {
    $(".side-bar").removeClass("open");
  });

  function updateClock() {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    let day = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    day = day < 10 ? "0" + day : day;
    month = month < 10 ? "0" + month : month;

    $("#taskbar-clock").html(`
      <div class="clock-time">${hours}:${minutes} ${ampm}</div>
      <div class="clock-date">${day}/${month}/${year}</div>
    `);
  }

  updateClock();
  setInterval(updateClock, 1000);

  let todoList = [];
  let items = [];
  let searchQuery = "";

  function makeId(title) {
    return title.toLowerCase().trim().replace(/\s+/g, "-");
  }

  function renderList() {
    $(".container").empty();

    const filteredList = todoList.filter((todo) =>
      todo.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredList.length === 0) {
      $("#no-results").show();
    } else {
      $("#no-results").hide();
    }

    filteredList.forEach((todo) => {
      const tbody = todo.items
        .map((i) => {
          return `
            <tr>
              <td>
                <input type="checkbox">
                <span class="task-text">${i}</span>
                <button class="item-delete-btn" style="display:none;">X</button>
              </td>
            </tr>
          `;
        })
        .join("");

      $(".container").append(`
        <div class="card window" data-id="${todo.id}">
          <div class="window-topbar">
            <div class="window-title">${todo.title}</div>

            <div class="window-controls">
              <button class="win-btn minimize" title="Minimize"></button>
              <button class="win-btn maximize" title="Maximize"></button>
              <button class="win-btn close delete-btn" title="Close"></button>
            </div>
          </div>

          <div class="window-content">
            <div class="window-actions">
              <button class="edit-btn">Edit</button>
            </div>

            <table>
              <tbody>${tbody}</tbody>
            </table>
          </div>
        </div>
      `);
    });
  }

  function addItem() {
    const title = $("#todo-title").val().trim();
    if (!title || items.length === 0) return;

    const id = makeId(title);

    const alreadyExists = todoList.some((t) => t.id === id);
    if (alreadyExists) {
      alert("A To-Do with the same title already exists. Use a different title.");
      return;
    }

    todoList.push({
      title: title,
      items: [...items],
      id: id,
    });

    items = [];
    $("#todo-title").val("");
    $("#todo-item").val("");
    $(".added-items").empty();

    renderList();
  }

  function deleteItem(id) {
    todoList = todoList.filter((t) => t.id !== id);
    renderList();
  }

  $("#search-input").on("input", function () {
    searchQuery = $(this).val().trim();
    renderList();
  });

  $(".add-btn").click(function () {
    const item = $("#todo-item").val().trim();
    if (!item) return;

    items.push(item);
    $(".added-items").append(`<div>${item}</div>`);
    $("#todo-item").val("");
  });

  $(".save-btn").click(function () {
    addItem();
  });

  $(document).on("click", ".delete-btn", function () {
    const card = $(this).closest(".card");
    const id = card.attr("data-id");
    deleteItem(id);
  });

  $(document).on("click", ".edit-btn", function () {
    const btn = $(this);
    const card = btn.closest(".card");
    const tbody = card.find("tbody");

    if (btn.text() === "Edit") {
      tbody.find(".task-text").each(function () {
        const text = $(this).text();
        $(this).replaceWith(
          `<input type="text" class="edit-input" value="${text}">`
        );
      });

      tbody.find(".item-delete-btn").show();

      if (tbody.find(".add-row").length === 0) {
        tbody.append(`
          <tr class="add-row">
            <td>
              <input type="text" class="new-item-input" placeholder="New task">
              <button class="add-item-btn">+</button>
            </td>
          </tr>
        `);
      }

      btn.text("Save");
    } else {
      const id = card.attr("data-id");

      tbody.find(".edit-input").each(function () {
        const text = $(this).val().trim();
        $(this).replaceWith(`<span class="task-text">${text}</span>`);
      });

      tbody.find(".add-row").remove();
      tbody.find(".item-delete-btn").hide();

      const newItems = [];
      tbody.find("tr").each(function () {
        const taskText = $(this).find(".task-text").text().trim();
        if (taskText) newItems.push(taskText);
      });

      if (newItems.length === 0) {
        deleteItem(id);
        return;
      }

      todoList = todoList.map((t) => {
        if (t.id === id) {
          return { ...t, items: newItems };
        }
        return t;
      });

      renderList();
    }
  });

  $(document).on("click", ".add-item-btn", function () {
    const tbody = $(this).closest("tbody");
    const input = tbody.find(".new-item-input");
    const value = input.val().trim();
    if (!value) return;

    $(`
      <tr>
        <td>
          <input type="checkbox">
          <span class="task-text">${value}</span>
          <button class="item-delete-btn">X</button>
        </td>
      </tr>
    `).insertBefore(tbody.find(".add-row"));

    input.val("");
  });

  $(document).on("click", ".item-delete-btn", function () {
    $(this).closest("tr").remove();
  });
});
