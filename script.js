fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    const tableBody = document.querySelector("#data-table tbody");

    const remainingItems = data;

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

    const totalRowObj = {
      category: "Выручка, руб",
      values: dailySums,
    };
    const totalRow = createRow(totalRowObj, true);
    tableBody.appendChild(totalRow);

    const chartRow = document.createElement("tr");
    chartRow.classList.add("chart-row");

    const chartCell = document.createElement("td");
    chartCell.colSpan = 4;
    chartCell.innerHTML = `<div id="chart-container" style="width: 100%; height: 300px;"></div>`;

    chartRow.appendChild(chartCell);

    totalRow.after(chartRow);

    drawChart(totalRowObj.category, totalRowObj.values.slice(-7));

    remainingItems.forEach((item) => {
      const row = createRow(item, true);

      tableBody.appendChild(row);
    });

    function createRow(item, isClickable = false) {
      const row = document.createElement("tr");

      const categoryCell = document.createElement("td");
      categoryCell.textContent = item.category;

      row.appendChild(categoryCell);
      let isTotalRow = false;
      if (item.category === "Выручка, руб") {
        isTotalRow = true;
      }

      const values = item.values;

      const lastIndex = values.length - 1;

      const currentValue = values[lastIndex];
      const yesterdayValue = values[lastIndex - 1];
      const lastWeekValue = values[lastIndex - 7];

      [currentValue, yesterdayValue, lastWeekValue].forEach((value, index) => {
        let previousValue = currentValue;
        let isYesterday = false;
        if (index === 1) {
          isYesterday = true;
        }
        let isLastTdTotalRow = false;
        if (isTotalRow && index === 2) {
          isLastTdTotalRow = true;
        }
        const valueCell = createValueCell(
          value,
          previousValue,
          isYesterday,
          isLastTdTotalRow
        );

        row.appendChild(valueCell);
      });

      if (isClickable) {
        row.addEventListener("click", () => {
          const existingChartRow = document.querySelector(".chart-row");
          if (existingChartRow) {
            existingChartRow.remove();
          }

          const chartRow = document.createElement("tr");
          chartRow.classList.add("chart-row");

          const chartCell = document.createElement("td");
          chartCell.colSpan = 4;
          chartCell.innerHTML = `<div id="chart-container" style="width: 100%; height: 300px;"></div>`;

          chartRow.appendChild(chartCell);

          row.after(chartRow);

          drawChart(item.category, values.slice(-7));
        });
      }

      return row;
    }

    function createValueCell(
      value,
      previousValue,
      isYesterday = false,
      isLastTdTotalRow = false
    ) {
      const valueCell = document.createElement("td");

      if (isYesterday) {
        const percentageChange = calculatePercentageChange(
          value,
          previousValue
        );

        const valueText = document.createElement("span");
        valueText.textContent = (value ?? "-").toLocaleString("ru-RU");

        const percentageText = document.createElement("span");
        percentageText.textContent = `${Math.floor(percentageChange)}%`;

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

        valueCell.appendChild(wrapper);
      } else if (isLastTdTotalRow) {
        const lastSevenSum = totalRowObj["values"]
          .slice(-7)
          .reduce((sum, value) => sum + (value ?? 0), 0);
        valueCell.textContent = (lastSevenSum ?? "-").toLocaleString("ru-RU");
      } else {
        valueCell.textContent = (value ?? "-").toLocaleString("ru-RU");
      }

      return valueCell;
    }

    function calculatePercentageChange(currentValue, previousValue) {
      if (previousValue === 0) return currentValue > 0 ? 100 : -100;
      if (previousValue === undefined || currentValue === undefined) return 0;

      const percentageChange =
        ((currentValue - previousValue) / previousValue) * 100;
      return percentageChange;
    }

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

    function drawChart(category, recentValues) {
      Highcharts.chart("chart-container", {
        chart: { type: "line" },
        title: { text: `${category}` },
        xAxis: {
          gridLineColor: "transperent",
          lineColor: "#333333",

          tickWidth: 5,
          tickLength: 5,
          tickColor: "#333333",
          labels: {
            enabled: false,
          },
        },
        yAxis: {
          lineWidth: 1,
          gridLineColor: "transperent",
          lineColor: "#333333",

          tickWidth: 5,
          tickLength: 5,
          tickColor: "#333333",
          labels: {
            enabled: false,
          },
          title: {
            text: null,
          },
        },
        legend: {
          enabled: false,
        },
        tooltip: {
          useHTML: true,
          formatter: function () {
            return `<strong>${category}</strong>: ${this.y}`;
          },
          backgroundColor: "#333",
          borderColor: "#000",
          style: {
            color: "#fff",
            fontSize: "12px",
          },
        },
        series: [
          {
            name: category,
            data: recentValues,
            lineWidth: 2,
            lineColor: "#217C52",
            marker: {
              symbol: "round",
              radius: 4,
              fillColor: "#217C52",
              lineWidth: 1,
              lineColor: "#217C52",
            },
          },
        ],
        credits: {
          enabled: false,
        },
      });
    }
  })
  .catch((error) => console.error("Ошибка загрузки данных:", error));
