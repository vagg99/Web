document.addEventListener('DOMContentLoaded', () => {
  populateCategories();
});

// Sample data for categories, subcategories, and products
const items = {
  "products": [
  {
    "id": "0",
    "name": "Nestle Φρουτοπουρές 4 Φρούτα 90γρ",
    "category": "8016e637b54241f8ad242ed1699bf2da",
    "subcategory": "7e86994327f64e3ca967c09b5803966a",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/Nestle_%CE%A6%CF%81%CE%BF%CF%85%CF%84%CE%BF%CF%80%CE%BF%CF%85%CF%81%CE%AD%CF%82_4_%CE%A6%CF%81%CE%BF%CF%8D%CF%84%CE%B1_90%CE%B3%CF%81.jpg"
  },
  {
    "id": "1",
    "name": "Nutricia Biskotti 180γρ",
    "category": "8016e637b54241f8ad242ed1699bf2da",
    "subcategory": "7e86994327f64e3ca967c09b5803966a",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/BISKOTTI_NUTRICIA_180%CE%93%CE%A1.jpg"
  },
  {
    "id": "2",
    "name": "Nutricia Biskotti Ζωάκια 180γρ",
    "category": "8016e637b54241f8ad242ed1699bf2da",
    "subcategory": "7e86994327f64e3ca967c09b5803966a",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/Nutricia_Biskotti_%CE%96%CF%89%CE%AC%CE%BA%CE%B9%CE%B1_180%CE%B3%CF%81.jpg"
  },
  {
    "id": "3",
    "name": "Γιώτης Κρέμα Παιδική Φαρίν Λακτέ 300γρ",
    "category": "8016e637b54241f8ad242ed1699bf2da",
    "subcategory": "7e86994327f64e3ca967c09b5803966a",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%93%CE%B9%CF%8E%CF%84%CE%B7%CF%82_%CE%9A%CF%81%CE%AD%CE%BC%CE%B1_%CE%A0%CE%B1%CE%B9%CE%B4%CE%B9%CE%BA%CE%AE_%CE%A6%CE%B1%CF%81%CE%AF%CE%BD_%CE%9B%CE%B1%CE%BA%CF%84%CE%AD_300%CE%B3%CF%81.jpg"
  },
  {
    "id": "4",
    "name": "Γιώτης Άνθος Ορύζης 150γρ",
    "category": "8016e637b54241f8ad242ed1699bf2da",
    "subcategory": "7e86994327f64e3ca967c09b5803966a",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%93%CE%B9%CF%8E%CF%84%CE%B7%CF%82_%CE%91%CE%BD%CE%B8%CF%8C%CF%82_%CE%9F%CF%81%CF%8D%CE%B6%CE%B7%CF%82_150%CE%B3%CF%81.jpg"
  },
  {
    "id": "5",
    "name": "Babylino Πάνες Μωρού Sensitive 4 - 9 κιλ No 3 22τεμ",
    "category": "8016e637b54241f8ad242ed1699bf2da",
    "subcategory": "e0efaa1776714351a4c17a3a9d412602",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/Babylino_%CE%A0%CE%AC%CE%BD%CE%B5%CF%82_%CE%9C%CF%89%CF%81%CE%BF%CF%8D_Sensitive_4__9_%CE%BA%CE%B9%CE%BB_No_3_22%CF%84%CE%B5%CE%BC.jpg"
  },
  {
    "id": "6",
    "name": "Babylino Πάνες Μωρού Sensitive 9-20 κιλ Nο 4+ 19τεμ",
    "category": "8016e637b54241f8ad242ed1699bf2da",
    "subcategory": "e0efaa1776714351a4c17a3a9d412602",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/Babylino_%CE%A0%CE%AC%CE%BD%CE%B5%CF%82_%CE%9C%CF%89%CF%81%CE%BF%CF%8D_Sensitive_920_%CE%BA%CE%B9%CE%BB_N%CE%BF_4_19%CF%84%CE%B5%CE%BC.jpg"
  },
  {
    "id": "7",
    "name": "Babylino Πάνες Μωρού Sensitive 3-6κιλ Nο 2 26τεμ",
    "category": "8016e637b54241f8ad242ed1699bf2da",
    "subcategory": "e0efaa1776714351a4c17a3a9d412602",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/Babylino_%CE%A0%CE%AC%CE%BD%CE%B5%CF%82_%CE%9C%CF%89%CF%81%CE%BF%CF%8D_Sensitive_36%CE%BA%CE%B9%CE%BB_N%CE%BF_2_26%CF%84%CE%B5%CE%BC.jpg"
  },
  {
    "id": "8",
    "name": "Babylino Πάνες Μωρού Sensitive 16+ κιλ No 6 15τεμ",
    "category": "8016e637b54241f8ad242ed1699bf2da",
    "subcategory": "e0efaa1776714351a4c17a3a9d412602",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/Babylino_%CE%A0%CE%AC%CE%BD%CE%B5%CF%82_%CE%9C%CF%89%CF%81%CE%BF%CF%8D_Sensitive_16_%CE%BA%CE%B9%CE%BB_No_6_15%CF%84%CE%B5%CE%BC.jpg"
  },
  {
    "id": "9",
    "name": "Babylino Πάνες Μωρού Sensitive 11 - 25κιλ No 5 18τεμ",
    "category": "8016e637b54241f8ad242ed1699bf2da",
    "subcategory": "e0efaa1776714351a4c17a3a9d412602",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/Babylino_%CE%A0%CE%AC%CE%BD%CE%B5%CF%82_%CE%9C%CF%89%CF%81%CE%BF%CF%8D_Sensitive_11__25%CE%BA%CE%B9%CE%BB_No_5_18%CF%84%CE%B5%CE%BC.jpg"
  },
  {
    "id": "10",
    "name": "Whiskas Γατ/Φή Πουλ Σε Σάλτσα 100γρ",
    "category": "662418cbd02e435280148dbb8892782a",
    "subcategory": "926262c303fe402a8542a5d5cf3ac7eb",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%93%CE%B1%CF%84%CE%A6%CE%B7_Whiskas_%CE%A0%CE%BF%CF%85%CE%BB_%CE%A3%CE%B5_%CE%A3%CE%B1%CE%BB%CF%84%CF%83%CE%B1_100%CE%93%CE%A1.jpg"
  },
  {
    "id": "11",
    "name": "Purina Gold Gourmet Γατ/Φή Βοδ/Κοτ 85γρ",
    "category": "662418cbd02e435280148dbb8892782a",
    "subcategory": "926262c303fe402a8542a5d5cf3ac7eb",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%93%CE%B1%CF%84%CE%BF%CF%84%CF%81_%CE%92%CE%BF%CE%B4%CE%9A%CE%BF%CF%84_Duo_Gold_Gourmet_85%CE%93.jpg"
  },
  {
    "id": "12",
    "name": "Purina Gold Gourmet Γατ/Φή Μους Ψάρι 85γρ",
    "category": "662418cbd02e435280148dbb8892782a",
    "subcategory": "926262c303fe402a8542a5d5cf3ac7eb",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%93%CE%B1%CF%84%CE%A6%CE%B7_%CE%A8%CE%B1%CF%81%CE%B9_%CE%A9%CE%BA_%CE%9C%CE%BF%CF%85%CF%82_Gold_Gourmet85%CE%B3.jpg"
  },
  {
    "id": "13",
    "name": "Friskies Γατ/Φή Πατέ Κοτ/Λαχ 400γρ",
    "category": "662418cbd02e435280148dbb8892782a",
    "subcategory": "926262c303fe402a8542a5d5cf3ac7eb",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%93%CE%B1%CF%84%CE%A6%CE%B7_%CE%9A%CE%BF%CF%84%CE%9B%CE%B1%CF%87_%CE%A0%CE%B1%CF%84%CE%B5_Friskies_400%CE%93%CE%A1.jpg"
  },
  {
    "id": "14",
    "name": "Friskies Γατ/Φή Πατέ Μοσχάρι 400γρ",
    "category": "662418cbd02e435280148dbb8892782a",
    "subcategory": "926262c303fe402a8542a5d5cf3ac7eb",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%93%CE%B1%CF%84%CE%A6%CE%B7_%CE%9C%CE%BF%CF%83%CF%87%CE%B1%CF%81%CE%B9_%CE%A0%CE%B1%CF%84%CE%B5_Friskies_400%CE%93%CE%A1.jpg"
  },
  {
    "id": "15",
    "name": "Pedigree Schmackos Μπισκότα Σκύλου 43γρ",
    "category": "662418cbd02e435280148dbb8892782a",
    "subcategory": "0c6e42d52765495dbbd06c189a4fc80f",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%9C%CF%80%CE%B9%CF%83%CE%BA%CE%BF%CF%84%CE%B1_%CE%A3%CE%BA%CF%85%CE%BB%CE%BF%CF%85_Schmakos_43%CE%93%CE%A1.jpg"
  },
  {
    "id": "16",
    "name": "Friskies Σκυλ/Φή Βοδ/Κοτ/Λαχ 400γρ",
    "category": "662418cbd02e435280148dbb8892782a",
    "subcategory": "0c6e42d52765495dbbd06c189a4fc80f",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%A3%CE%BA%CF%85%CE%BB%CE%A6%CE%B7_%CE%9A%CE%BF%CF%84-%CE%9A%CE%B5%CF%86%CF%84_Friskies_400.jpg"
  },
  {
    "id": "17",
    "name": "Cesar Clasicos Σκυλ/Φή Μοσχ 150γρ",
    "category": "662418cbd02e435280148dbb8892782a",
    "subcategory": "0c6e42d52765495dbbd06c189a4fc80f",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%A3%CE%BA%CF%85%CE%BB%CE%A6%CE%B7_%CE%A3%CF%85%CE%BA%CF%89%CF%84-%CE%9C%CE%BF%CF%83%CF%87_Cesar_150%CE%93.jpg"
  },
  {
    "id": "18",
    "name": "Pedigree Υγ Σκυλ/Φή 3 Ποικ Πουλερικών 400γρ",
    "category": "662418cbd02e435280148dbb8892782a",
    "subcategory": "0c6e42d52765495dbbd06c189a4fc80f",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%A5%CE%B3_%CE%A3%CE%BA%CF%85%CE%BB%CE%A6%CE%B7_Pedigr%CE%B5e_5%CE%A0%CE%9F%CE%99%CE%9A_%CE%A0%CE%BF%CF%85%CE%BB400%CE%B3%CF%81.jpg"
  },
  {
    "id": "19",
    "name": "Pedigree Rodeo Σκυλ/Φή Μοσχ 70γρ",
    "category": "662418cbd02e435280148dbb8892782a",
    "subcategory": "0c6e42d52765495dbbd06c189a4fc80f",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%A3%CE%BA%CF%85%CE%BB%CE%A6%CE%B7_%CE%9C%CE%BF%CF%83%CF%87_Pedigree_Rodeo_70GR.jpg"
  },
  {
    "id": "20",
    "name": "Βεργίνα Μπύρα 500ml",
    "category": "a8ac6be68b53443bbd93b229e2f9cd34",
    "subcategory": "329bdd842f9f41688a0aa017b74ffde4",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%9C%CE%A0%CE%99%CE%A1%CE%91_%CE%92%CE%95%CE%A1%CE%93%CE%99%CE%9D%CE%91_%CE%A6%CE%99%CE%91%CE%9B%CE%97_0%2C50l.jpg"
  },
  {
    "id": "21",
    "name": "Fix Hellas Mπύρα 330ml",
    "category": "a8ac6be68b53443bbd93b229e2f9cd34",
    "subcategory": "329bdd842f9f41688a0aa017b74ffde4",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/M%CF%80%CE%B9%CF%81%CE%B1_Fix_Hellas_330ML_%CE%9A%CE%BF%CF%85%CF%84%CE%B9.jpg"
  },
  {
    "id": "22",
    "name": "Amstel Μπύρα 330ml",
    "category": "a8ac6be68b53443bbd93b229e2f9cd34",
    "subcategory": "329bdd842f9f41688a0aa017b74ffde4",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%9C%CF%80%CF%8D%CF%81%CE%B1_Amstel_%CE%9A%CE%BF%CF%85%CF%84%CE%AF_1.jpg"
  },
  {
    "id": "23",
    "name": "Mythos Μπύρα 330ml",
    "category": "a8ac6be68b53443bbd93b229e2f9cd34",
    "subcategory": "329bdd842f9f41688a0aa017b74ffde4",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%9C%CF%80%CE%B9%CF%81%CE%B1_Mythos_Can_330%CE%9C.jpg"
  },
  {
    "id": "24",
    "name": "Heineken Μπύρα 330ml",
    "category": "a8ac6be68b53443bbd93b229e2f9cd34",
    "subcategory": "329bdd842f9f41688a0aa017b74ffde4",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%9C%CF%80%CF%85%CF%81%CE%B1_Heineken_330ML_%CE%9C%CE%B5%CF%84_%CE%9A%CE%BF%CF%85%CF%84.jpg"
  },
  {
    "id": "25",
    "name": "Gordons Space Τζιν Original 275ml",
    "category": "a8ac6be68b53443bbd93b229e2f9cd34",
    "subcategory": "08f280dee57c4b679be0102a8ba1343b",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%A4%CE%B6%CE%B9%CE%BD_Gordons_Space_Original_275_Ml.jpg"
  },
  {
    "id": "26",
    "name": "Μίνι Ούζο Γλυκάνισο 200ml",
    "category": "a8ac6be68b53443bbd93b229e2f9cd34",
    "subcategory": "08f280dee57c4b679be0102a8ba1343b",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%9F%CF%8D%CE%B6%CE%BF_%CE%95%CF%80%CE%BF%CE%BC_%CE%9C%CE%AF%CE%BD%CE%B9_200ml.jpg"
  },
  {
    "id": "27",
    "name": "Τσιλιλή Τσίπουρο Χ Γλυκάνισο 200ml",
    "category": "a8ac6be68b53443bbd93b229e2f9cd34",
    "subcategory": "08f280dee57c4b679be0102a8ba1343b",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%A4%CF%83%CE%AF%CF%80%CE%BF%CF%85%CF%81%CE%BF_%CE%A4%CF%83%CE%B9%CE%BB%CE%B9%CE%BB%CE%B7_%CE%A7%CF%89%CF%81%CE%B9%CF%83_%CE%93%CE%BB%CF%85%CE%BA%CE%B1%CE%BD%CE%B9%CF%83200%CE%BC.jpg"
  },
  {
    "id": "28",
    "name": "Μεταξά 3 Μπράντυ 350ml",
    "category": "a8ac6be68b53443bbd93b229e2f9cd34",
    "subcategory": "08f280dee57c4b679be0102a8ba1343b",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%9C%CE%B5%CF%84%CE%B1%CE%BE%CE%B1_3_A%CF%83%CF%84%CE%B5%CF%81_350%CE%9C.jpg"
  },
  {
    "id": "29",
    "name": "Ούζο 12 0,7λιτ",
    "category": "a8ac6be68b53443bbd93b229e2f9cd34",
    "subcategory": "08f280dee57c4b679be0102a8ba1343b",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%9F%CF%8D%CE%B6%CE%BF_12_0%2C7lit.jpg"
  },
  {
    "id": "30",
    "name": "Bravo Καφές Κλασικός 95γρ",
    "category": "ee0022e7b1b34eb2b834ea334cda52e7",
    "subcategory": "b89cb8dd198748dd8c4e195e4ab2168e",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%9A%CE%B1%CF%86%CE%AD%CF%82_Bravo_%CE%9A%CE%BB%CE%B1%CF%83%CE%B9%CE%BA%CF%8C%CF%82_95%CE%B3%CF%81.jpg"
  },
  {
    "id": "31",
    "name": "Λουμίδης Καφές Ελληνικός 96γρ",
    "category": "ee0022e7b1b34eb2b834ea334cda52e7",
    "subcategory": "b89cb8dd198748dd8c4e195e4ab2168e",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%9A%CE%B1%CF%86%CE%AD%CF%82_%CE%95%CE%BB%CE%BB%CE%B7%CE%BD_%CE%9B%CE%BF%CF%85%CE%BC%CE%AF%CE%B4%CE%B7_96%CE%B3%CF%81.jpg"
  },
  {
    "id": "32",
    "name": "Nescafe Classic Στιγμιαίος Καφές 50γρ",
    "category": "ee0022e7b1b34eb2b834ea334cda52e7",
    "subcategory": "b89cb8dd198748dd8c4e195e4ab2168e",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/Nescafe_50%CE%B3%CF%81.jpg"
  },
  {
    "id": "33",
    "name": "Nescafe Cappuccino 10φακ 140γρ",
    "category": "ee0022e7b1b34eb2b834ea334cda52e7",
    "subcategory": "b89cb8dd198748dd8c4e195e4ab2168e",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/Nescafe_Cappuccino_10%CF%86%CE%B1%CE%BA_140%CE%B3%CF%81.jpg"
  },
  {
    "id": "34",
    "name": "Lavazza Καφές Rossa Espresso 250γρ",
    "category": "ee0022e7b1b34eb2b834ea334cda52e7",
    "subcategory": "b89cb8dd198748dd8c4e195e4ab2168e",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%9A%CE%B1%CE%98%CE%B5%CF%83_Lavazza_Rossa_Espresso_250g.jpg"
  },
  {
    "id": "35",
    "name": "Εδέμ Φασόλια Κόκκινα Σε Νερό 240γρ.",
    "category": "ee0022e7b1b34eb2b834ea334cda52e7",
    "subcategory": "50e8a35122854b2b9cf0e97356072f94",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/%CE%A6%CE%91%CE%A3%CE%9F%CE%9B%CE%99%CE%91_%CE%95%CE%94%CE%95%CE%9C_%CE%9A%CE%9F%CE%9A%CE%9A%CE%99%CE%9D%CE%91_%CE%A3%CE%A4%CE%92_240%CE%93%CE%A1.jpg"
  },
  {
    "id": "36",
    "name": "Agrino Φακές Ψιλές Εισαγωγής 500γρ",
    "category": "ee0022e7b1b34eb2b834ea334cda52e7",
    "subcategory": "50e8a35122854b2b9cf0e97356072f94",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/Agrino_%CE%A6%CE%B1%CE%BA%CE%AD%CF%82_%CE%A8%CE%B9%CE%BB%CE%AD%CF%82_%CE%95%CE%B9%CF%83%CE%B1%CE%B3%CF%89%CE%B3%CE%AE%CF%82_500%CE%B3%CF%81.jpg"
  },
  {
    "id": "37",
    "name": "3 Άλφα Φασόλια Χονδρά Εισαγωγής 500γρ",
    "category": "ee0022e7b1b34eb2b834ea334cda52e7",
    "subcategory": "50e8a35122854b2b9cf0e97356072f94",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/3%CE%91_%CE%A6%CE%B1%CF%83%CF%8C%CE%BB%CE%B9%CE%B1_%CE%BF%CE%BD%CE%B4%CF%81%CE%AC_%CE%95%CE%B9%CF%83%CE%B1%CE%B3%CF%89%CE%B3%CE%AE%CF%82_500%CE%B3%CF%81.jpg"
  },
  {
    "id": "38",
    "name": "3 Άλφα Φακές Ψιλές Εισαγωγής 500γρ",
    "category": "ee0022e7b1b34eb2b834ea334cda52e7",
    "subcategory": "50e8a35122854b2b9cf0e97356072f94",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/3_%CE%86%CE%BB%CF%86%CE%B1_%CE%A6%CE%B1%CE%BA%CE%AD%CF%82_%CE%A8%CE%B9%CE%BB%CE%AD%CF%82_%CE%95%CE%B9%CF%83%CE%B1%CE%B3%CF%89%CE%B3%CE%AE%CF%82_500gr.png"
  },
  {
    "id": "39",
    "name": "Agrino Φασόλια Μέτρια 500γρ",
    "category": "ee0022e7b1b34eb2b834ea334cda52e7",
    "subcategory": "50e8a35122854b2b9cf0e97356072f94",
    "img": "https://warply.s3.amazonaws.com/applications/ed840ad545884deeb6c6b699176797ed/products/Agrino_%CE%A6%CE%B1%CF%83%CF%8C%CE%BB%CE%B9%CE%B1_%CE%9C%CE%AD%CF%84%CF%81%CE%B9%CE%B1_500%CE%B3%CF%81.jpg"
  }
],
"categories": [
  {
    "id": "8016e637b54241f8ad242ed1699bf2da",
    "name": "Βρεφικά Είδη",
    "subcategories": [
      {
        "name": "Βρεφικές τροφές",
        "uuid": "7e86994327f64e3ca967c09b5803966a"
      },
      {
        "name": "Πάνες",
        "uuid": "e0efaa1776714351a4c17a3a9d412602"
      }
    ]
  },
  {
    "id": "662418cbd02e435280148dbb8892782a",
    "name": "Για κατοικίδια",
    "subcategories": [
      {
        "name": "Pet shop/Τροφή γάτας",
        "uuid": "926262c303fe402a8542a5d5cf3ac7eb"
      },
      {
        "name": "Pet shop/Τροφή σκύλου",
        "uuid": "0c6e42d52765495dbbd06c189a4fc80f"
      }
    ]
  },
  {
    "id": "a8ac6be68b53443bbd93b229e2f9cd34",
    "name": "Ποτά - Αναψυκτικά",
    "subcategories": [
      {
        "name": "Μπύρες",
        "uuid": "329bdd842f9f41688a0aa017b74ffde4"
      },
      {
        "name": "Ποτά",
        "uuid": "08f280dee57c4b679be0102a8ba1343b"
      }
    ]
  },
  {
    "id": "ee0022e7b1b34eb2b834ea334cda52e7",
    "name": "Τρόφιμα",
    "subcategories": [
      {
        "name": "Καφέδες",
        "uuid": "b89cb8dd198748dd8c4e195e4ab2168e"
      },
      {
        "name": "Όσπρια",
        "uuid": "50e8a35122854b2b9cf0e97356072f94"
      }
    ]
  }
]
}


function populateCategories() {
  const categorySelect = document.getElementById("category");

  // Clear existing options
  categorySelect.innerHTML = '<option value="0">Επιλέξτε κατηγορία</option>';
    
  // Populate categories
  for (const category of items.categories) {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  }
}

function populateSubcategories() {
  const categorySelect = document.getElementById("category");
  const subcategorySelect = document.getElementById("subcategory");
  const selectedCategoryId = categorySelect.value;

  // Clear existing options
  subcategorySelect.innerHTML = '<option value="0">Επιλέξτε υποκατηγορία</option>';

  // Populate subcategories based on the selected category
  if (selectedCategoryId) {
    const selectedCategory = items.categories.find(category => category.id === selectedCategoryId);
    for (const subcategory of selectedCategory.subcategories) {
      const option = document.createElement("option");
      option.value = subcategory.uuid;
      option.textContent = subcategory.name;
      subcategorySelect.appendChild(option);
    }
  }
}

function populateProducts() {
  const subcategorySelect = document.getElementById("subcategory");
  const productSelect = document.getElementById("product");
  const selectedSubcategoryUuid = subcategorySelect.value;

  // Clear existing options
  productSelect.innerHTML = '<option value="0">Επιλέξτε προϊόν</option>';

  // Populate products based on the selected subcategory
  if (selectedSubcategoryUuid) {
    for (const product of items.products) {
      if (product.subcategory == selectedSubcategoryUuid) {
        const option = document.createElement("option");
        option.value = product.id;
        option.textContent = product.name;
        productSelect.appendChild(option);
      }
    }
  }
}
