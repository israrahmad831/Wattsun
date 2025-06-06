import RNHTMLtoPDF from "react-native-html-to-pdf";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export const generatePDF = async (invoice) => {
  if (Platform.OS === "web") {
    alert(
      "PDF export only works in mobile APK. Build and install the app to use this feature."
    );
    return;
  }

  const itemsHtml = invoice.items
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td>${item.qty}</td><td>${item.price}</td><td>${item.total}</td></tr>`
    )
    .join("");

  const htmlContent = `
    <h1>Invoice #${invoice.id}</h1>
    <table border="1" style="width:100%; border-collapse: collapse;">
      <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
      ${itemsHtml}
    </table>
    <h2>Total: Rs ${invoice.total}</h2>
  `;

  const file = await RNHTMLtoPDF.convert({
    html: htmlContent,
    fileName: `invoice-${invoice.id}`,
    directory: "Documents",
  });

  await Sharing.shareAsync(file.filePath || "");
};
