import RNHTMLtoPDF from "react-native-html-to-pdf";
import * as Sharing from "expo-sharing";
import { Platform, Image } from "react-native";
import * as FileSystem from "expo-file-system";

const imageToBase64 = async (imagePath: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imagePath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return "";
  }
};

export const generatePDF = async (invoice) => {
  if (Platform.OS === "web") {
    alert(
      "PDF export only works in mobile APK. Build and install the app to use this feature."
    );
    return;
  }

  const logoBase64 = await imageToBase64(
    require("../assets/images/Wattsun.png")
  );

  const itemsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.qty}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">Rs ${parseFloat(
          item.price
        ).toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">Rs ${item.total.toFixed(
          2
        )}</td>
      </tr>
    `
    )
    .join("");

  const htmlContent = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            display: flex;
            margin-bottom: 20px;
            align-items: center;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin-right: 15px;
          }
          .company-info {
            flex: 1;
          }
          .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          .company-details {
            font-size: 12px;
            color: #34495e;
          }
          .invoice-title {
            text-align: center;
            font-size: 24px;
            margin: 20px 0;
            color: #2c3e50;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .info-block {
            flex: 1;
          }
          .info-label {
            font-weight: bold;
            margin-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #2c3e50;
            color: white;
            padding: 10px;
            text-align: left;
          }
          .grand-total {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            color: #27ae60;
            margin-top: 20px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoBase64 ? `<img src="${logoBase64}" class="logo" />` : ""}
          <div class="company-info">
            <div class="company-name">WATTSUN ENERGY</div>
            <div class="company-details">MAIN SAMUNDRI ROAD GOJRA PH# 03236677706</div>
          </div>
        </div>

        <div class="invoice-title">INVOICE</div>

        <div class="invoice-info">
          <div class="info-block">
            <div class="info-label">Invoice To:</div>
            <div>${invoice.to}</div>
            <div>${invoice.telephone}</div>
          </div>
          <div class="info-block" style="text-align: right;">
            <div class="info-label">Invoice #:</div>
            <div>${invoice.invoiceNumber}</div>
            <div class="info-label">Date:</div>
            <div>${invoice.date}</div>
            <div class="info-label">Type:</div>
            <div>${invoice.type}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 10%;">Qty</th>
              <th style="width: 50%;">Description</th>
              <th style="width: 20%;">Price</th>
              <th style="width: 20%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="grand-total">
          Grand Total: Rs ${invoice.total.toFixed(2)}
        </div>

        <div class="footer">
          Thank you for your business!<br>
          Wattsun Energy - MAIN SAMUNDRI ROAD GOJRA PH# 03236677706
        </div>
      </body>
    </html>
  `;

  try {
    const options = {
      html: htmlContent,
      fileName: `Invoice_${invoice.invoiceNumber}_${invoice.date.replace(
        /\//g,
        "-"
      )}`,
      directory: "Documents",
    };

    const file = await RNHTMLtoPDF.convert(options);

    if (file.filePath) {
      await Sharing.shareAsync(file.filePath, {
        mimeType: "application/pdf",
        dialogTitle: `Share Invoice ${invoice.invoiceNumber}`,
        UTI: "com.adobe.pdf",
      });
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
