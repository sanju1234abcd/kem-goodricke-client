const downloadExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Goodricke Stock");

  // ===== HEADER ROWS =====
  const headerRow1: any[] = ["Date", "Product"];
  locations.forEach(() => {
    headerRow1.push("", "", ""); // placeholder for merged cells
  });
  sheet.addRow(headerRow1);

  // Merge cells for location headers
  let startCol = 3;
  locations.forEach((loc) => {
    sheet.mergeCells(1, startCol, 1, startCol + 2); // merge 3 columns per location
    const cell = sheet.getCell(1, startCol);
    cell.value = loc;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFB300" } };
    startCol += 3;
  });

  // Header row 2: Opening, Closing, Sales
  const headerRow2: any[] = ["", ""];
  locations.forEach(() => {
    headerRow2.push("Opening", "Closing", "Sales");
  });
  sheet.addRow(headerRow2);

  // Style row 2
  sheet.getRow(2).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6B46C1" } };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // ===== DATA ROWS =====
  // Gather all products
  const productSet = new Set<string>();
  entries.forEach((entry) => entry.stock.forEach((item: any) => productSet.add(item.product)));
  const allProducts = Array.from(productSet);

  allProducts.forEach((product) => {
    const row: any[] = [entries[0]?.date || "", product];

    locations.forEach((loc) => {
      const entry = entries.find((e) => e.location === loc);
      const item = entry?.stock.find((s: any) => s.product === product);
      const opening = item?.opening || 0;
      const closing = item?.closing || 0;
      const priceObj = products.find((p) => p.name === product);
      const price = priceObj?.price || 0;
      const sales = (opening - closing) * price;

      row.push(opening, closing, sales);
    });

    sheet.addRow(row);
  });

  // Set column widths
  sheet.columns.forEach((col) => (col.width = 15));

  // Generate buffer & download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Goodricke_Stock_${moment(date).format("DD-MM-YYYY")}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};