fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    const tableBody = document.querySelector("#data-table tbody");

    let totalCurrent = 0;
    let totalYesterday = 0;
    let totalLastWeek = 0;

    const firstThreeItems = data.slice(0, 3);

    // Функция для подсчета сумм
    function calculateSums(items) {
      items.forEach((item) => {
        const values = item.values;
        const lastIndex = values.length - 1;
        totalCurrent += values[lastIndex] ?? 0;
        totalYesterday += values[lastIndex - 1] ?? 0;
        totalLastWeek += values[lastIndex - 7] ?? 0;
      });
    }

    // Функция для создания строки таблицы
    function createRow(item, isClickable = false) {
      const row = document.createElement("tr");

      // Добавляем категорию
      const categoryCell = document.createElement("td");
      categoryCell.textContent = item.category;
      row.appendChild(categoryCell);

      // Получаем значения
      const values = item.values;
      const lastIndex = values.length - 1;
      const currentValue = values[lastIndex]; // Текущий день
      const yesterdayValue = values[lastIndex - 1]; // Вчера
      const lastWeekValue = values[lastIndex - 7]; // Такой же день на прошлой неделе

      // Добавляем значения в ячейки
      [currentValue, yesterdayValue, lastWeekValue].forEach((value) => {
        const valueCell = document.createElement("td");
        valueCell.textContent = (value ?? "-").toLocaleString("ru-RU");
        row.appendChild(valueCell);
      });

      // Если строка кликабельна, добавляем обработчик
      if (isClickable) {
        row.addEventListener("click", () => {
          drawChart(item.category, values.slice(-7));
        });
      }

      return row;
    }

    // Функция для построения графика
    function drawChart(category, recentValues) {
      Highcharts.chart("chart-container", {
        chart: { type: "line" },
        title: { text: `${category}` },
        xAxis: {
          gridLineColor: "transperent", // Цвет линий сетки
          lineColor: "#333333", // Цвет оси Y
          //tickInterval: Math.ceil(Math.max(...recentValues) / 7), // Интервал отметок
          tickWidth: 5,
          tickLength: 5,
          tickColor: "#333333",
          labels: {
            enabled: false, // Убираем подписи оси Y
          },
        },
        yAxis: {
          //visible: true, // Включаем ось Y
          lineWidth: 1,
          gridLineColor: "transperent", // Цвет линий сетки
          lineColor: "#333333", // Цвет оси Y
          //tickInterval: Math.ceil(Math.max(...recentValues) / 7), // Интервал отметок
          tickWidth: 5,
          tickLength: 5,
          tickColor: "#333333",
          labels: {
            enabled: false, // Убираем подписи оси Y
          },
          title: {
            text: null, // Убираем текст "Values"
          },
        },
        legend: {
          enabled: false, // Убираем легенду
        },
        tooltip: {
          useHTML: true, // Используем HTML для гибкости
          formatter: function () {
            return `<strong>${category}</strong>: ${this.y}`; // Текст тултипа
          },
          backgroundColor: "#333", // Цвет фона
          borderColor: "#000", // Цвет рамки
          style: {
            color: "#fff", // Цвет текста
            fontSize: "12px",
          },
        },
        series: [
          {
            name: category,
            data: recentValues,
            lineWidth: 2, // Толщина линии
            lineColor: "#217C52",
            marker: {
              symbol: "round", // Форма маркеров: квадрат
              radius: 4, // Размер квадрата
              fillColor: "#217C52", // Цвет квадрата
              lineWidth: 1,
              lineColor: "#217C52", // Цвет границы квадрата
            },
          },
        ],
        credits: {
          enabled: false, // Убираем подпись Highcharts
        },
      });
    }

    // Создаем строку с суммами
    calculateSums(firstThreeItems);

    const totalRow = document.createElement("tr");
    totalRow.classList.add("total-row");

    const sumLabelCell = document.createElement("td");
    sumLabelCell.textContent = "Выручка, руб.";
    totalRow.appendChild(sumLabelCell);

    [totalCurrent, totalYesterday, totalLastWeek].forEach((total) => {
      const totalCell = document.createElement("td");
      totalCell.textContent = total.toLocaleString("ru-RU");
      totalRow.appendChild(totalCell);
    });

    tableBody.appendChild(totalRow);
    // Добавляем строку для графика
    const chartRow = document.createElement("tr");
    const chartCell = document.createElement("td");
    chartCell.colSpan = 4; // Объединяем все колонки
    chartCell.innerHTML = `<div id="chart-container" style="width: 100%; height: 300px;"></div>`;
    chartRow.appendChild(chartCell);
    tableBody.appendChild(chartRow);

    // Добавляем первые три строки под строкой с суммами
    firstThreeItems.forEach((item) => {
      const row = createRow(item, true); // Кликабельная строка
      tableBody.appendChild(row);
    });

    // Добавляем остальные элементы
    const remainingItems = data.slice(3);
    remainingItems.forEach((item) => {
      const row = createRow(item, true); // Кликабельная строка
      tableBody.appendChild(row);
    });
  })
  .catch((error) => console.error("Ошибка загрузки данных:", error));
