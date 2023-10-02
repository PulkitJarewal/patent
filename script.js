document.addEventListener("DOMContentLoaded", () => {
  searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const resultsList = document.getElementById("results");
  const totalPages = document.getElementById("totalPages");
  const currentPage = document.getElementById("currentPage");
  const plusButton = document.getElementById("plusButton");
  const searchBarsContainer = document.getElementById("searchBarsContainer");
  const globalOperatorSelect = document.getElementById("globalOperator");
  //const searchBars = [document.querySelector(".search-Input")];
  const searchSection = [document.querySelector("#searchItem")];

  let searchBarCount = 1;
  let claimText;
  let fullText;
  let currentPageNumber = 1;
  const resultsPerPage = 10;

  // plusButton.addEventListener("click", () => {
  //   const newSearchBarContainer = document.createElement("div");
  //   newSearchBarContainer.className = "search";

  //   // Create a new search bar
  //   const newSearchBar = document.createElement("input");
  //   const newSearchBarId = "searchInput" + searchBarCount; // Unique id
  //   newSearchBar.type = "search";
  //   newSearchBar.className = "search-input";
  //   newSearchBar.placeholder = "Search patents...";
  //   newSearchBar.id = newSearchBarId; // Set the unique id
  //   newSearchBar.name = newSearchBarId; // Set the unique name

  //   // Increment the search bar count
  //   searchBarCount++;

  //   // Append the search bar to the container
  //   newSearchBarContainer.appendChild(newSearchBar);

  //   // Append the container to the searchBarsContainer
  //   searchBarsContainer.appendChild(newSearchBarContainer);
  // });

  plusButton.addEventListener("click", () => {
    // // Create a new search bar
    // const newSearchBar = document.createElement("input");
    // newSearchBar.type = "search";
    // newSearchBar.id = "searchInput";
    // newSearchBar.className = "search-Input";
    // newSearchBar.placeholder = "Search patents...";

    // // Append the container to the searchBarsContainer
    // searchBars.push(newSearchBar);
    // searchBarsContainer.appendChild(newSearchBar);
    // //searchBarsContainer.innerHTML += "<br>";

    let searchItem = document.querySelector("#searchItem");
    let clonedSearchItem = searchItem.cloneNode(true);
    clonedSearchItem.style.display = "block";

    searchBarsContainer.appendChild(clonedSearchItem);
    //searchBars.push(clonedSearchItem.querySelector("#searchInput"));
    searchSection.push(clonedSearchItem);
  });

  searchButton.addEventListener("click", () => {
    const globalOperator = globalOperatorSelect.value;

    // Construct the query
    const queries = [];
    searchSection.forEach((search) => {
      let searchText = search.querySelector("#searchInput");
      let searchField = search.querySelector("#document-section").value;

      const query = searchText.value.trim();
      if (query) {
        let url;
        if (searchField === "All Fields") {
          url = `${query}`;
        } else if (searchField === "Title, Claims & Abstract") {
          url = `(title:(${query})%20OR%20abstract:(${query})%20OR%20claim:(${query}))`;
        } else if (searchField === "Claims") {
          url = `claim:${query}`;
        } else if (searchField === "Full Text") {
          url = `full_text:${query}`;
        } else {
          console.log(searchField.toLowerCase());
          url = `${searchField.toLowerCase()}:${query}`;
        }
        queries.push(`(${url})`);
      }
      searchInput = queries.join(` ${globalOperator} `);
      const finalQuery = searchInput;
      console.log("Search Query:", finalQuery);
    });
  });

  // Function to update the results based on the current page
  const updateResults = async () => {
    const query = searchInput.trim();
    if (query === "") {
      return;
    }
    // const searchSection = document.getElementById("document-section").value;
    let apiUrl =
      "https://api.lens.org/patent/search?token=P2bqXKNCDGWxsPcMeZwNCeOQR9gsB9CPYrZFUi33bMilgKQ0b20X";

    // Append the appropriate query parameter based on the selected search section

    // else if (searchSection === "Title") {
    //   apiUrl += `&query=title:${query}`;
    // } else if (searchSection === "Abstract") {
    //   apiUrl += `&query=abstract:${query}`;
    // } else if (searchSection === "Description") {
    //   apiUrl += `&query=description:${query}`;
    // }
    // Append the size and from parameters
    apiUrl += `&query=${query}&size=${resultsPerPage}&from=${
      currentPageNumber - 1
    }`;

    try {
      console.log(apiUrl);
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();
      console.log(data);

      //Function to get Claims Data
      async function getClaims(patentId) {
        console.log(patentId);
        claimsUrl = `https://www.lens.org/lens/patent/` + patentId + `/claims`;
        try {
          const response = await fetch(claimsUrl);
          if (!response.ok) {
            throw new Error(
              `Claims API request failed with status ${response.status}`
            );
          }
          claimText = await response.text();
          //document.getElementById("results").innerHTML = claimText;
        } catch (error) {
          console.error("Error fetching  claims:", error);
        }
      } //end of function claim

      //Function to get Full Text Data
      async function getFullText(jur, ID, kind) {
        console.log(jur);
        console.log(ID);
        console.log(kind);
        // FullTextUrl = `https://www.lens.org/lens/patent/` + patentId + `/fulltext/content`;
        FullTextUrl = `https://www.lens.org/images/patent/${jur}/${ID}/${kind}/${jur}_${ID}_${kind}.pdf`;
        try {
          const response = await fetch(FullTextUrl);
          if (!response.ok) {
            throw new Error(
              `Claims API request failed with status ${response.status}`
            );
          }
          fullText = await response.text();
          //document.getElementById("results").innerHTML = claimText;
        } catch (error) {
          console.error("Error fetching  FullText:", error);
        }
      }

      const totalResults = data.total;
      const totalPagesCount = Math.ceil(totalResults / resultsPerPage);

      document.getElementById("totalValue").textContent =
        "Total: " + totalResults;
      totalPages.textContent = "Total Pages: " + totalPagesCount;
      currentPage.textContent = "Current Page: " + currentPageNumber;

      resultsList.innerHTML = "";

      for (const patent of data.data) {
        const claimsPromise = getClaims(patent.lens_id); // Call Get Claims Function
        const fullTextPromise = getFullText(
          patent.jurisdiction,
          patent.doc_number,
          patent.kind
        ); // Call Get FullText Function
        await Promise.all([claimsPromise, fullTextPromise]);
        const listItem = document.createElement("li");

        listItem.innerHTML = `
      <h3>Title : ${patent.biblio.invention_title[0].text}</h3>
      <p> Patent Number : ${patent.jurisdiction + patent.doc_number}</p>
      <p>Publishing Date : ${patent.date_published}</p>
      ${
        patent.abstract && patent.abstract.length > 0
          ? `<details><summary>Abstract :</summary><p>${patent.abstract[0].text}</p></details>`
          : "<p>No abstract available</p>"
      }   
      <details><summary>Claims :</summary><p>${claimText}<p></details>
       
      <details><summary>Cited By Patents:</summary>
    <ul>
      ${
        patent.biblio.cited_by.patents &&
        patent.biblio.cited_by.patents.length > 0
          ? patent.biblio.cited_by.patents
              .map(
                (patentItem) => `
              <li style="display: inline-block">${
                patentItem.document_id.jurisdiction +
                patentItem.document_id.doc_number
              } | </li>
            `
              )
              .join("")
          : "<li>No citation data available</li>"
      }
    </ul>
    </details>

     


    `;

        // Create a view full text link that opens in a new tab
        const viewFullTextLink = document.createElement("a");
        viewFullTextLink.className = "view-full-text";
        viewFullTextLink.href = FullTextUrl;
        viewFullTextLink.target = "_blank";
        viewFullTextLink.textContent = "View Full Text";

        // Append the link to the list item
        listItem.appendChild(viewFullTextLink);

        resultsList.appendChild(listItem);
      }

      // Enable or disable navigation buttons based on the current page
      prevButton.disabled = currentPageNumber === 1;
      nextButton.disabled = currentPageNumber === totalPagesCount;
    } catch (error) {
      console.error("Error:", error);
      resultsList.innerHTML = "<li>Error fetching data from API.</li>";
    }
  };

  // Click event for the "Previous" button
  prevButton.addEventListener("click", () => {
    if (currentPageNumber > 1) {
      currentPageNumber--;
      updateResults();
    }
  });

  // Click event for the "Next" button
  nextButton.addEventListener("click", () => {
    currentPageNumber++;
    updateResults();
  });

  // Click event for the "Search" button
  searchButton.addEventListener("click", () => {
    currentPageNumber = 1; // Reset to the first page when performing a new search
    updateResults();
  });
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      // If the "Enter" key is pressed, trigger a click on the search button
      searchButton.click();
    }
  });
});
