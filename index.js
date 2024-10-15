d3.csv("./data/Billionaires_Data.csv")
  .then((_data) => {
    // Prepare data for the sunburst chart
    const parents = [];
    const labels = [];
    const values = [];
    const industryMap = {};

    // Extracting unique industries and organisations with their net worth
    _data.forEach((row) => {
      const industry = row.Industry;
      const organisation = row.Organization;
      const netWorth = parseFloat(row["Net Worth"]);

      // Initialise industry in the map if not already present
      if (!industryMap[industry]) {
        industryMap[industry] = { organisations: {}, total: 0 };
      }

      // Add organisation and its net worth
      if (!industryMap[industry].organisations[organisation]) {
        industryMap[industry].organisations[organisation] = 0;
      }
      industryMap[industry].organisations[organisation] += netWorth;
      industryMap[industry].total += netWorth;
    });

    // Populate the checkboxes with unique industries
    const industryCheckboxes = d3.select("#industry-checkboxes");
    Object.keys(industryMap).forEach((industry) => {
      industryCheckboxes.append("div").attr("class", "form-check").html(`
          <input class="form-check-input" type="checkbox" value="${industry}" id="${industry}">
          <label class="form-check-label" for="${industry}">${industry}</label>
        `);
    });

    // Function to draw the sunburst chart based on selected industries
    function drawSunburst(selectedIndustries) {
      parents.length = 0;
      labels.length = 0;
      values.length = 0;

      Object.keys(industryMap).forEach((industry) => {
        if (
          selectedIndustries.includes("all") ||
          selectedIndustries.includes(industry)
        ) {
          parents.push("");
          labels.push(industry);
          values.push(industryMap[industry].total);

          Object.keys(industryMap[industry].organisations).forEach(
            (organisation) => {
              if (organisation) {
                parents.push(industry);
                labels.push(organisation);
                values.push(industryMap[industry].organisations[organisation]);
              }
            }
          );
        }
      });

      const hovertext = labels.map((label, index) => {
        const valueInBillions = (values[index] / 1e9).toFixed(0);
        const formattedValue = valueInBillions
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ","); // format with thousand separators
        if (parents[index] !== "") {
          return `Organisation: <b>${label}</b><br>Net Worth: <b>$${formattedValue}B</b>`;
        } else {
          return `Industry: <b>${label}</b><br>Total Net Worth: <b>$${formattedValue}B</b>`;
        }
      });

      const trace = {
        type: "sunburst",
        labels: labels,
        parents: parents,
        values: values,
        branchvalues: "total",
        hoverinfo: "text",
        hovertext: hovertext,
        insidetextorientation: "radial",
      };

      const data = [trace];

      const layout = {
        title:
          "Distribution of Billionaires' Wealth by Industry and Organisation",
        margin: { l: 0, r: 0, b: 0, t: 50 },
        width: 800,
        height: 800,
      };

      Plotly.newPlot("sunburst", data, layout);
    }

    // Initial draw of the sunburst chart
    drawSunburst(["all"]);

    // Update the chart when a checkbox changes
    d3.selectAll("input[type='checkbox']").on("change", function () {
      Array.from(d3.selectAll("input[type='checkbox']:checked").nodes()).map(
        (option) => option.value
      );

      // If "All" is checked, clear all other selections
      if (this.value === "all" && this.checked) {
        d3.selectAll("input[type='checkbox']")
          .filter(function () {
            return this.value !== "all";
          })
          .property("checked", false); // Uncheck all options except "All"
      } else if (this.value !== "all" && this.checked) {
        // If any other industry is checked, uncheck "All"
        d3.select("#checkAll").property("checked", false);
      }

      // Update the sunburst chart based on selected options
      const updatedSelectedOptions = Array.from(
        d3.selectAll("input[type='checkbox']:checked").nodes()
      ).map((option) => option.value);

      drawSunburst(updatedSelectedOptions);
    });
  })
  .catch((error) => console.error("Error loading or processing data:", error));
