fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    const tableBody = document.querySelector("#data-table tbody");

    let totalCurrent = 0;
    let totalYesterday = 0;
    let totalLastWeek = 0;

    const firstThreeItems = data.slice(0, 3);

    function calculateDailySums(
      cashArray,
      creditArray,
      nonCashArray,
      deliteArray
    ) {
      const maxLength = Math.max(
        cashArray.length,
        creditArray.length,
        nonCashArray.length
      );
      return Array.from({ length: maxLength }, (_, i) => {
        const cashValue = cashArray[i] ?? 0;
        const creditValue = creditArray[i] ?? 0;
        const nonCashValue = nonCashArray[i] ?? 0;
        const deliteValue = deliteArray[i] ?? 0;
        return cashValue + creditValue + nonCashValue - deliteValue;
      });
    }

    // Функция для вычисления процентного изменения
    function calculatePercentageChange(currentValue, previousValue) {
      if (previousValue === 0) return currentValue > 0 ? 100 : -100; // Если предыдущее значение 0, мы считаем 100% или -100%
      if (previousValue === undefined || currentValue === undefined) return 0; // Если одно из значений отсутствует, возвращаем 0%

      const percentageChange =
        ((currentValue - previousValue) / previousValue) * 100;
      return percentageChange;
    }
    function createValueCell(value, previousValue, isYesterday = false) {
      const valueCell = document.createElement("td");
      if (isYesterday) {
        const percentageChange = calculatePercentageChange(
          value,
          previousValue
        );

        const valueText = document.createElement("span");
        valueText.textContent = (value ?? "-").toLocaleString("ru-RU");

        const percentageText = document.createElement("span");
        percentageText.textContent = ` ${Math.floor(percentageChange)}%`;

        valueText.classList.add("value-text");
        percentageText.classList.add("percentage-text");
        if (percentageChange < 0) {
          percentageText.classList.add("red");
        } else if (percentageChange > 0) {
          percentageText.classList.add("green");
        } else {
          percentageText.classList.add("zero");
        }

        const wrapper = document.createElement("div");
        wrapper.classList.add("value-wrapper");
        wrapper.appendChild(valueText);
        wrapper.appendChild(percentageText);

        // Добавляем контейнер в ячейку
        valueCell.appendChild(wrapper);
      } else {
        valueCell.textContent = (value ?? "-").toLocaleString("ru-RU"); // Без процентов для других значений
      }
      return valueCell;
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

      [currentValue, yesterdayValue, lastWeekValue].forEach((value, index) => {
        let previousValue = currentValue;
        let isYesterday = false;

        // Если это значение для вчерашнего дня, вычисляем процентное изменение
        if (index === 1) {
          previousValue = currentValue; // Для yesterdayValue сравниваем с текущим
          isYesterday = true; // Указываем, что это значение для вчерашнего дня
        }

        const valueCell = createValueCell(value, previousValue, isYesterday);
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

    const cashValues = data.find((item) => item.category === "Наличные").values;
    const creditValues = data.find(
      (item) => item.category === "Кредитные карты"
    ).values;
    const nonCashValues = data.find(
      (item) => item.category === "Безналичный расчет"
    ).values;
    const deliteValues = data.find(
      (item) => item.category === "Удаление из чека (после оплаты), руб"
    ).values;

    const dailySums = calculateDailySums(
      cashValues,
      creditValues,
      nonCashValues,
      deliteValues
    );

    const totalRow = document.createElement("tr");
    totalRow.classList.add("total-row");

    const sumLabelCell = document.createElement("td");
    sumLabelCell.textContent = "Выручка, руб.";
    totalRow.appendChild(sumLabelCell);

    const indices = [
      dailySums.length - 1, // Последний элемент
      dailySums.length - 2, // Предпоследний элемент
    ];

    // Создаем ячейки с суммами на основе указанных индексов
    indices.forEach((index) => {
      const totalCell = document.createElement("td");
      // Проверяем, существует ли элемент по индексу, чтобы избежать ошибок
      totalCell.textContent = (dailySums[index] ?? 0).toLocaleString("ru-RU");
      totalRow.appendChild(totalCell);
    });

    // Считаем сумму последних семи элементов массива dailySums
    const lastSevenSum = dailySums
      .slice(-7) // Берем последние 7 элементов
      .reduce((sum, value) => sum + (value ?? 0), 0); // Суммируем их

    // Создаем третью ячейку для суммы последних семи элементов
    const totalCell = document.createElement("td");
    totalCell.textContent = lastSevenSum.toLocaleString("ru-RU");
    totalRow.appendChild(totalCell);

    // Добавляем итоговый ряд в таблицу
    tableBody.appendChild(totalRow);

    tableBody.appendChild(totalRow);
    // Добавляем строку для графика
    const chartRow = document.createElement("tr");
    const chartCell = document.createElement("td");
    chartCell.colSpan = 4; // Объединяем все колонки
    chartCell.innerHTML = `<div id="chart-container" style="width: 100%; height: 300px;"></div>`;
    chartRow.appendChild(chartCell);
    tableBody.appendChild(chartRow);

    drawChart("Выручка, руб", dailySums.slice(-7));
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
