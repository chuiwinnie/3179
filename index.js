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
        industryMap[industry] = { organizations: {}, total: 0 };
      }

      // Add organisation and its net worth
      if (!industryMap[industry].organizations[organisation]) {
        industryMap[industry].organizations[organisation] = 0;
      }
      industryMap[industry].organizations[organisation] += netWorth;
      industryMap[industry].total += netWorth;
    });

    // Building arrays for Plotly
    Object.keys(industryMap).forEach((industry) => {
      parents.push(""); // Industry has no parent
      labels.push(industry);
      values.push(industryMap[industry].total);

      Object.keys(industryMap[industry].organizations).forEach(
        (organization) => {
          if (organization) {
            // If billionaire has an organisation
            parents.push(industry); // Organisation's parent is the industry
            labels.push(organization);
            values.push(industryMap[industry].organizations[organization]);
          }
        }
      );
    });

    // Format number with thousand separators
    function formatNumber(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Create arrays for hover text
    const hovertext = labels.map((label, index) => {
      const valueInBillions = (values[index] / 1e9).toFixed(0); // Convert to billions
      const formattedValue = formatNumber(valueInBillions);

      if (parents[index] !== "") {
        return `Organisation: <b>${label}</b><br>Net Worth: <b>$${formattedValue}B</b>`;
      } else {
        return `Industry: <b>${label}</b><br>Total Net Worth: <b>$${formattedValue}B</b>`;
      }
    });

    // Create the sunburst chart
    const trace = {
      type: "sunburst",
      labels: labels,
      parents: parents,
      values: values,
      branchvalues: "total",
      hoverinfo: "text", // Show custom hover text
      hovertext: hovertext, // Set custom hover text
      insidetextorientation: "radial",
    };

    const data = [trace];

    const layout = {
      title:
        "Distribution of Billionaires' Wealth by Industry and Organisation",
      margin: { l: 80, r: 0, b: 0, t: 100 },
      width: 800,
      height: 800,
    };

    Plotly.newPlot("sunburst", data, layout);
  })
  .catch((error) => console.error("Error loading or processing data:", error));
